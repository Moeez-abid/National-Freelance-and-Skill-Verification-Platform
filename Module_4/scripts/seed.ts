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
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  console.log("Connecting to database...");
  const client = await pool.connect();

  try {
    console.log("Running schema...");
    const schemaSql = fs.readFileSync(path.resolve(__dirname, "../SPM_Centralized_Db.sql"), "utf-8");
    await client.query(schemaSql);
    console.log("Schema created successfully.");

    console.log("Seeding data...");

    // Insert categories needed for jobs
    const categoryResult = await client.query(`
      INSERT INTO marketplace_categories (name, slug, description)
      VALUES 
        ('Development & IT', 'development-it', 'Software development and IT services'),
        ('Design & Creative', 'design-creative', 'Design, UI/UX, and creative services')
      ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
      RETURNING id, name
    `);
    const categories = categoryResult.rows;

    // Insert freelancers and profiles
    for (const freelancer of freelancers) {
      const [firstName, ...lastNames] = freelancer.name.split(" ");
      const lastName = lastNames.join(" ") || "Doe";
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;

      const userResult = await client.query(`
        INSERT INTO users (email, password_hash, first_name, last_name, role, is_email_verified)
        VALUES ($1, 'dummyhash', $2, $3, 'freelancer', true)
        ON CONFLICT (email) DO UPDATE SET first_name = EXCLUDED.first_name
        RETURNING id
      `, [email, firstName, lastName]);

      const userId = userResult.rows[0].id;

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
        freelancer.title,
        freelancer.bio,
        freelancer.location,
        freelancer.hourlyRate,
        freelancer.rating,
        freelancer.skills
      ]);
    }

    console.log("Seeded freelancers.");

    // Create a dummy client
    const clientUserResult = await client.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, role, is_email_verified)
      VALUES ('client@example.com', 'dummyhash', 'Nexus', 'Finance', 'client', true)
      ON CONFLICT (email) DO UPDATE SET first_name = EXCLUDED.first_name
      RETURNING id
    `);
    const clientId = clientUserResult.rows[0].id;

    // Insert projects (jobs)
    for (const project of projects) {
      const categoryId = project.requiredSkills.includes('Figma') || project.requiredSkills.includes('Design') 
        ? categories.find(c => c.name === 'Design & Creative')?.id
        : categories.find(c => c.name === 'Development & IT')?.id;

      // Calculate deadline based on postedAt and durationWeeks
      const postedAtDate = new Date(project.postedAt);
      const deadlineDate = new Date(postedAtDate.getTime() + project.durationWeeks * 7 * 24 * 60 * 60 * 1000);

      const jobResult = await client.query(`
        INSERT INTO jobs (client_id, title, description, category_id, budget_min, budget_max, deadline, status, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'open', $8)
        RETURNING id
      `, [
        clientId,
        project.title,
        project.description,
        categoryId,
        project.maxHourlyBudget * 0.8, // Guessing budget_min
        project.maxHourlyBudget,
        deadlineDate,
        project.postedAt
      ]);

      const jobId = jobResult.rows[0].id;

      // Ensure skills exist and insert into job_required_skills
      for (const skillName of project.requiredSkills) {
        const skillResult = await client.query(`
          INSERT INTO skills (skill_name) VALUES ($1)
          ON CONFLICT (skill_name) DO UPDATE SET skill_name = EXCLUDED.skill_name
          RETURNING id
        `, [skillName]);
        const skillId = skillResult.rows[0].id;

        await client.query(`
          INSERT INTO job_required_skills (job_id, skill_id, skill_name)
          VALUES ($1, $2, $3)
          ON CONFLICT (job_id, skill_id) DO NOTHING
        `, [jobId, skillId, skillName]);
      }
    }

    console.log("Seeded projects (jobs).");
    console.log("Database setup and seed completed successfully!");

  } catch (error) {
    console.error("Error setting up database:", error);
  } finally {
    client.release();
    pool.end();
  }
}

main();
