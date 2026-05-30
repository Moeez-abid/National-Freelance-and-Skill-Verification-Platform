import { Router } from "express";
import { db } from "@workspace/db";
import { users, profiles, skills, userSkills, workHistory, badges, userBadges } from "@workspace/db/schema";
import { eq, sql } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const data = await db
      .select({
        id: users.uuid,
        user_id: users.id,
        name: sql<string>`${users.first_name} || ' ' || ${users.last_name}`,
        title: profiles.headline,
        hourlyRate: profiles.hourly_rate,
        rating: profiles.average_rating,
        location: profiles.location,
        bio: profiles.bio,
        skillsArray: profiles.skills,
        firstName: users.first_name,
        lastName: users.last_name,
        dynamicSkill: skills.skill_name,
      })
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.user_id))
      .leftJoin(userSkills, eq(users.id, userSkills.user_id))
      .leftJoin(skills, eq(userSkills.skill_id, skills.id))
      .where(eq(users.role, "freelancer"));

    // Fetch work history
    const allWorkHistory = await db.select().from(workHistory);
    
    // Fetch user badges
    const allBadges = await db
      .select({
        user_id: userBadges.user_id,
        badge_name: badges.badge_name,
        badge_description: badges.badge_description,
        badge_icon_url: badges.badge_icon_url,
        category: badges.category,
      })
      .from(userBadges)
      .innerJoin(badges, eq(userBadges.badge_id, badges.id));

    // Map to frontend structure and group dynamic skills
    const freelancersMap = new Map();
    const colors = ["#3b82f6", "#ec4899", "#10b981", "#8b5cf6", "#f59e0b", "#14b8a6"];
    let i = 0;

    for (const row of data) {
      if (!freelancersMap.has(row.id)) {
        freelancersMap.set(row.id, {
          id: row.id,
          name: row.name,
          title: row.title || "",
          avatarColor: colors[i % colors.length],
          initials: `${row.firstName?.[0] || ""}${row.lastName?.[0] || ""}`.toUpperCase(),
          skills: row.skillsArray || [],
          hourlyRate: Number(row.hourlyRate || 0),
          rating: Number(row.rating || 0),
          completedProjects: 0,
          location: row.location || "",
          bio: row.bio || "",
          workHistory: allWorkHistory.filter(wh => wh.user_id === row.user_id),
          badges: allBadges.filter(b => b.user_id === row.user_id),
        });
        i++;
      }
      
      if (row.dynamicSkill) {
        const freelancer = freelancersMap.get(row.id);
        if (!freelancer.skills.includes(row.dynamicSkill)) {
          freelancer.skills.push(row.dynamicSkill);
        }
      }
    }

    res.json(Array.from(freelancersMap.values()));
  } catch (error) {
    console.error("Error fetching freelancers:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
