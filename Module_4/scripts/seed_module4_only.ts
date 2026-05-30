import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { freelancers } from "../artifacts/module-4/src/data/freelancers.js";
import { projects } from "../artifacts/module-4/src/data/projects.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
const envPath = path.resolve(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const [key, ...valueParts] = line.split("=");
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join("=").trim();
    }
  });
}

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/spm_db",
});

async function main() {
  console.log("Connecting to database for selective Module 4 seeding...");
  const client = await pool.connect();

  try {
    // 1. Seed Profiles for existing Freelancers
    console.log("Seeding profiles for existing freelancers...");
    const usersResult = await client.query(`SELECT id FROM users WHERE role = 'freelancer'`);
    const userIds = usersResult.rows.map(row => row.id);

    if (userIds.length === 0) {
      console.log("No freelancers found in the users table! Cannot seed profiles.");
    } else {
      let freelancerIndex = 0;
      for (const userId of userIds) {
        // Cyclically assign a dummy profile to ensure all freelancers get one
        const fData = freelancers[freelancerIndex % freelancers.length];
        
        await client.query(`
          INSERT INTO profiles (user_id, headline, bio, location, hourly_rate, average_rating, skills)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (user_id) DO UPDATE SET 
            headline = EXCLUDED.headline,
            bio = EXCLUDED.bio,
            location = EXCLUDED.location,
            hourly_rate = EXCLUDED.hourly_rate,
            average_rating = EXCLUDED.average_rating,
            skills = EXCLUDED.skills
        `, [
          userId,
          fData.title || "Freelancer",
          fData.bio || "Available for work.",
          fData.location || "Remote",
          fData.hourlyRate || 50,
          fData.rating || 4.5,
          fData.skills || []
        ]);
        
        freelancerIndex++;
      }
      console.log(`Seeded profiles for ${userIds.length} existing freelancers.`);
    }

    // 2. Seed Tags and Job_Required_Skills for existing Jobs
    console.log("Seeding tags for existing jobs...");
    const jobsResult = await client.query(`SELECT id FROM jobs`);
    const jobIds = jobsResult.rows.map(row => row.id);

    if (jobIds.length === 0) {
      console.log("No jobs found in the jobs table! Cannot seed job_required_skills.");
    } else {
      let projectIndex = 0;
      for (const jobId of jobIds) {
        // Cyclically assign dummy skills to existing jobs
        const pData = projects[projectIndex % projects.length];
        
        const requiredSkills = pData.requiredSkills || ['React', 'TypeScript'];
        
        for (const skillName of requiredSkills) {
          const tagSlug = skillName.toLowerCase().replace(/[^a-z0-9]/g, '-');
          const tagResult = await client.query(`
            INSERT INTO marketplace_tags (name, slug, is_verified) 
            VALUES ($1, $2, true)
            ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug
            RETURNING id
          `, [skillName, tagSlug]);
          const tagId = tagResult.rows[0].id;

          await client.query(`
            INSERT INTO job_required_skills (job_id, tag_id, level)
            VALUES ($1, $2, 'intermediate')
            ON CONFLICT (job_id, tag_id) DO NOTHING
          `, [jobId, tagId]);
        }

        projectIndex++;
      }
      console.log(`Seeded job_required_skills for ${jobIds.length} existing jobs.`);
    }

    console.log("Selective seeding completed successfully!");

  } catch (error) {
    console.error("Error setting up database:", error);
  } finally {
    client.release();
    pool.end();
  }
}

main();
