import { Router } from "express";
import { db } from "@workspace/db";
import { jobs, users, jobRequiredSkills, marketplaceTags } from "@workspace/db/schema";
import { eq, sql } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const data = await db
      .select({
        id: jobs.id,
        title: jobs.title,
        description: jobs.description,
        clientName: sql<string>`${users.first_name} || ' ' || ${users.last_name}`,
        maxHourlyBudget: jobs.budget_max,
        deadline: jobs.expires_at,
        postedAt: jobs.created_at,
        skillName: marketplaceTags.name,
      })
      .from(jobs)
      .innerJoin(users, eq(jobs.client_id, users.uuid))
      .leftJoin(jobRequiredSkills, eq(jobs.id, jobRequiredSkills.job_id))
      .leftJoin(marketplaceTags, eq(jobRequiredSkills.tag_id, marketplaceTags.id));

    // Group skills by job
    const jobsMap = new Map();
    for (const row of data) {
      if (!jobsMap.has(row.id)) {
        // Calculate approx duration in weeks from deadline vs postedAt
        const posted = new Date(row.postedAt || Date.now());
        const dead = new Date(row.deadline || Date.now());
        let durationWeeks = Math.round((dead.getTime() - posted.getTime()) / (1000 * 60 * 60 * 24 * 7));
        if (durationWeeks <= 0 || isNaN(durationWeeks)) durationWeeks = 4;

        jobsMap.set(row.id, {
          id: row.id.toString(), // frontend expects string
          title: row.title,
          description: row.description,
          clientName: row.clientName,
          requiredSkills: [],
          maxHourlyBudget: Number(row.maxHourlyBudget),
          durationWeeks,
          postedAt: row.postedAt?.toISOString() || new Date().toISOString(),
        });
      }
      if (row.skillName) {
        jobsMap.get(row.id).requiredSkills.push(row.skillName);
      }
    }

    res.json(Array.from(jobsMap.values()));
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
