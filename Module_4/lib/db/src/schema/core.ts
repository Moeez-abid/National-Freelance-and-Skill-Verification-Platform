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
  id: uuid("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
});

export const jobs = pgTable("jobs", {
  id: uuid("id").primaryKey(),
  client_id: uuid("client_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category_id: uuid("category_id").references(() => categories.id),
  budget_min: numeric("budget_min", { precision: 12, scale: 2 }),
  budget_max: numeric("budget_max", { precision: 12, scale: 2 }),
  expires_at: timestamp("expires_at"),
  status: text("status").default("open"),
  created_at: timestamp("created_at").defaultNow(),
});

export const marketplaceTags = pgTable("marketplace_tags", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
});

export const jobRequiredSkills = pgTable("job_required_skills", {
  id: uuid("id").primaryKey(),
  job_id: uuid("job_id").references(() => jobs.id).notNull(),
  tag_id: uuid("tag_id").references(() => marketplaceTags.id).notNull(),
});

export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  skill_name: text("skill_name").notNull().unique(),
});

export const userSkills = pgTable("user_skills", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  skill_id: integer("skill_id").references(() => skills.id).notNull(),
});

export const workHistory = pgTable("work_history", {
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").defaultRandom().notNull().unique(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  company_name: text("company_name").notNull(),
  job_title: text("job_title").notNull(),
  start_date: date("start_date").notNull(),
  end_date: date("end_date"),
  is_current: boolean("is_current").default(false),
  description: text("description"),
  location: text("location"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").defaultRandom().notNull().unique(),
  badge_name: text("badge_name").notNull().unique(),
  badge_description: text("badge_description"),
  badge_icon_url: text("badge_icon_url"),
  category: text("category"),
  points_value: integer("points_value").default(0),
});

export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  badge_id: integer("badge_id").references(() => badges.id).notNull(),
  awarded_at: timestamp("awarded_at").defaultNow(),
  awarded_by: integer("awarded_by"),
  is_displayed: boolean("is_displayed").default(true),
});
