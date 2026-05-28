import { Router } from "express";
import { db } from "@workspace/db";
import { users, profiles } from "@workspace/db/schema";
import { eq, sql } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const data = await db
      .select({
        id: users.uuid,
        name: sql<string>`${users.first_name} || ' ' || ${users.last_name}`,
        title: profiles.headline,
        hourlyRate: profiles.hourly_rate,
        rating: profiles.average_rating,
        location: profiles.location,
        bio: profiles.bio,
        skills: profiles.skills,
        firstName: users.first_name,
        lastName: users.last_name,
      })
      .from(users)
      .innerJoin(profiles, eq(users.id, profiles.user_id))
      .where(eq(users.role, "freelancer"));

    // Map to frontend structure
    const colors = ["#3b82f6", "#ec4899", "#10b981", "#8b5cf6", "#f59e0b", "#14b8a6"];
    const mapped = data.map((f, i) => ({
      id: f.id,
      name: f.name,
      title: f.title || "",
      avatarColor: colors[i % colors.length],
      initials: `${f.firstName?.[0] || ""}${f.lastName?.[0] || ""}`.toUpperCase(),
      skills: f.skills || [],
      hourlyRate: Number(f.hourlyRate),
      rating: Number(f.rating),
      completedProjects: Math.floor(Math.random() * 50) + 10, // Dummy
      location: f.location || "",
      bio: f.bio || "",
    }));

    res.json(mapped);
  } catch (error) {
    console.error("Error fetching freelancers:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
