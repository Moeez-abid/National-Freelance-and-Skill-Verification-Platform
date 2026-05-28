import { pgTable, text, serial, integer, numeric, boolean, timestamp, uuid, date } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").defaultRandom().notNull(),
  email: text("email").notNull().unique(),
  password_hash: text("password_hash").notNull(),
  first_name: text("first_name").notNull(),
  last_name: text("last_name").notNull(),
  role: text("role").notNull().default("freelancer"),
  created_at: timestamp("created_at").defaultNow(),
});

export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id).notNull().unique(),
  headline: text("headline"),
  bio: text("bio"),
  location: text("location"),
  hourly_rate: numeric("hourly_rate", { precision: 18, scale: 4 }),
  average_rating: numeric("average_rating", { precision: 2, scale: 1 }).default('0'),
  skills: text("skills").array(),
});

export const categories = pgTable("marketplace_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
});

export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  client_id: integer("client_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category_id: integer("category_id").references(() => categories.id).notNull(),
  budget_min: numeric("budget_min", { precision: 18, scale: 4 }),
  budget_max: numeric("budget_max", { precision: 18, scale: 4 }),
  deadline: date("deadline").notNull(),
  status: text("status").default("open"),
  created_at: timestamp("created_at").defaultNow(),
});

export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  skill_name: text("skill_name").notNull().unique(),
});

export const jobRequiredSkills = pgTable("job_required_skills", {
  id: serial("id").primaryKey(),
  job_id: integer("job_id").references(() => jobs.id).notNull(),
  skill_id: integer("skill_id").references(() => skills.id).notNull(),
  skill_name: text("skill_name"),
});
