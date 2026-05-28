-- Run this file to set up Module 1 tables
-- Command: psql -U postgres -d module1_db -f schema.sql

CREATE TYPE user_role AS ENUM ('freelancer', 'client', 'admin', 'moderator');
CREATE TYPE account_status AS ENUM ('active', 'suspended', 'banned', 'pending_verification');
CREATE TYPE skill_level AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');
CREATE TYPE verification_status AS ENUM ('unverified', 'pending', 'in_review', 'verified', 'rejected', 'expired');
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    display_name VARCHAR(100) GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    role user_role NOT NULL DEFAULT 'freelancer',
    account_status account_status DEFAULT 'active',
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_identity_verified BOOLEAN DEFAULT FALSE,
    phone_number VARCHAR(20),
    country VARCHAR(100),
    profile_flags INTEGER DEFAULT 0,
    moderation_notes TEXT,
    last_moderated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    last_moderated_at TIMESTAMP,
    deleted_at TIMESTAMP,
    reset_token VARCHAR(255),
    reset_token_expiry TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    headline VARCHAR(150),
    bio TEXT,
    location VARCHAR(100),
    profile_image_url VARCHAR(500),
    banner_image_url VARCHAR(500),
    hourly_rate DECIMAL(18,4),
    experience_years DECIMAL(3,1) DEFAULT 0,
    availability_status VARCHAR(20) DEFAULT 'available',
    impact_points INTEGER DEFAULT 0,
    social_contribution_level VARCHAR(20) DEFAULT 'bronze',
    national_builder_badge BOOLEAN DEFAULT FALSE,
    reputation_level INTEGER DEFAULT 1,
    tier_level VARCHAR(20) DEFAULT 'beginner',
    achievement_points INTEGER DEFAULT 0,
    trust_score NUMERIC(5,2) DEFAULT 0 CHECK (trust_score BETWEEN 0 AND 100),
    total_reviews INTEGER DEFAULT 0,
    average_rating NUMERIC(2,1) DEFAULT 0,
    skills TEXT[] DEFAULT '{}',
    badges TEXT[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS skills (
    id SERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    skill_name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_skills (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    skill_level skill_level DEFAULT 'intermediate',
    years_of_experience DECIMAL(3,1),
    is_certified BOOLEAN DEFAULT FALSE,
    verified_by_test BOOLEAN DEFAULT FALSE,
    test_score INTEGER,
    last_tested_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, skill_id)
);

CREATE TABLE IF NOT EXISTS skill_badges (
    id SERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    badge_name VARCHAR(150) NOT NULL,
    level skill_level DEFAULT 'intermediate',
    issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    certificate_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, skill_id)
);

CREATE TABLE IF NOT EXISTS certifications (
    id SERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    certification_name VARCHAR(200) NOT NULL,
    issuing_authority VARCHAR(150) NOT NULL,
    credential_id VARCHAR(100),
    issue_date DATE NOT NULL,
    expiry_date DATE,
    verification_status verification_status DEFAULT 'pending',
    verification_url VARCHAR(500),
    certificate_file_url VARCHAR(500),
    verified_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS portfolio_projects (
    id SERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    project_url VARCHAR(500),
    github_url VARCHAR(500),
    featured_image VARCHAR(500),
    is_featured BOOLEAN DEFAULT FALSE,
    completion_date DATE,
    sort_order INTEGER DEFAULT 0,
    technologies TEXT[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS work_history (
    id SERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(150) NOT NULL,
    job_title VARCHAR(150) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT FALSE,
    description TEXT,
    location VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    freelancer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reviewer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    contract_id INTEGER,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 5),
    quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 5),
    deadline_rating INTEGER CHECK (deadline_rating BETWEEN 1 AND 5),
    is_public BOOLEAN DEFAULT TRUE,
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (freelancer_id != reviewer_id)
);

CREATE TABLE IF NOT EXISTS verification_requests (
    id SERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    verification_type VARCHAR(50) NOT NULL CHECK (verification_type IN ('identity', 'email', 'phone', 'skill', 'professional')),
    verification_status verification_status DEFAULT 'pending',
    document_url VARCHAR(500),
    document_type VARCHAR(50),
    rejection_reason TEXT,
    verified_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMP,
    expires_at TIMESTAMP,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS badges (
    id SERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    badge_name VARCHAR(100) UNIQUE NOT NULL,
    badge_description TEXT,
    badge_icon_url VARCHAR(500),
    category VARCHAR(50),
    points_value INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS user_badges (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id INTEGER NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    awarded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    is_displayed BOOLEAN DEFAULT TRUE,
    UNIQUE(user_id, badge_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_trust_score ON profiles(trust_score);
CREATE INDEX IF NOT EXISTS idx_user_skills_user ON user_skills(user_id);

-- _================================================================================================ 2 =============================================================================================

-- ===================================================================
-- MODULE 2: SKILL TESTING & CERTIFICATION
-- ===================================================================

CREATE TABLE "ec_skill_assessments" (
    "id" SERIAL PRIMARY KEY,
    "uuid" UUID UNIQUE DEFAULT gen_random_uuid(),
    "skill_id" INTEGER NOT NULL,
    "assessment_name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "difficulty_level" "skill_level" NOT NULL DEFAULT 'intermediate',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "duration" INTEGER NOT NULL DEFAULT 30,
    "passing_score" INTEGER NOT NULL DEFAULT 50,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ec_skill_assessments_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ec_skill_assessments_skill_id_assessment_name_key" UNIQUE ("skill_id", "assessment_name")
);

CREATE TABLE "ec_questions" (
    "id" SERIAL PRIMARY KEY,
    "uuid" UUID UNIQUE DEFAULT gen_random_uuid(),
    "question_text" TEXT NOT NULL,
    "question_type" VARCHAR(20) NOT NULL,
    "options" JSONB,
    "correct_answer" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 1,
    "explanation" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "ec_exam_questions" (
    "assessment_id" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,

    CONSTRAINT "ec_exam_questions_pkey" PRIMARY KEY ("assessment_id", "question_id"),
    CONSTRAINT "ec_exam_questions_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "ec_skill_assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ec_exam_questions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "ec_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "ec_test_attempts" (
    "id" SERIAL PRIMARY KEY,
    "uuid" UUID UNIQUE DEFAULT gen_random_uuid(),
    "user_id" INTEGER NOT NULL,
    "assessment_id" INTEGER NOT NULL,
    "score" INTEGER DEFAULT 0,
    "total_points" INTEGER DEFAULT 0,
    "percentage_score" DECIMAL(5,2),
    "status" VARCHAR(20) DEFAULT 'in_progress',
    "started_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "time_taken_seconds" INTEGER,

    CONSTRAINT "ec_test_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ec_test_attempts_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "ec_skill_assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "ec_submissions" (
    "id" SERIAL PRIMARY KEY,
    "uuid" UUID UNIQUE DEFAULT gen_random_uuid(),
    "attempt_id" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,
    "given_answer" TEXT NOT NULL,
    "is_correct" BOOLEAN NOT NULL DEFAULT false,
    "points_earned" INTEGER NOT NULL DEFAULT 0,
    "auto_graded" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ec_submissions_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "ec_test_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ec_submissions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "ec_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ec_submissions_attempt_id_question_id_key" UNIQUE ("attempt_id", "question_id")
);

CREATE TABLE "ec_certificates" (
    "id" SERIAL PRIMARY KEY,
    "uuid" UUID UNIQUE DEFAULT gen_random_uuid(),
    "user_id" INTEGER NOT NULL,
    "assessment_id" INTEGER NOT NULL,
    "attempt_id" INTEGER UNIQUE NOT NULL,
    "certificate_number" VARCHAR(100) UNIQUE NOT NULL,
    "certificate_url" VARCHAR(500),
    "issue_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiry_date" DATE,
    "is_verified" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ec_certificates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ec_certificates_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "ec_skill_assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ec_certificates_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "ec_test_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ec_certificates_user_id_assessment_id_key" UNIQUE ("user_id", "assessment_id")
);

CREATE TABLE "ec_badges" (
    "id" SERIAL PRIMARY KEY,
    "uuid" UUID UNIQUE DEFAULT gen_random_uuid(),
    "user_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "criteria" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ec_badges_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 1. ALTER TABLE: Add timing and grading fields to ec_skill_assessments
ALTER TABLE ec_skill_assessments 
ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS passing_score INTEGER DEFAULT 50;

-- 2. CREATE TABLE: ec_exam_questions (Many-to-Many support for sharing questions)
CREATE TABLE IF NOT EXISTS ec_exam_questions (
    assessment_id INTEGER NOT NULL REFERENCES ec_skill_assessments(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL REFERENCES ec_questions(id) ON DELETE CASCADE,
    PRIMARY KEY (assessment_id, question_id)
);

-- 3. CREATE TABLE: ec_badges (Module 2 achievement tracking)
CREATE TABLE IF NOT EXISTS ec_badges (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid() UNIQUE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    criteria TEXT NOT NULL,
    "issueDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. CLEANUP: If migrating to Many-to-Many, assessment_id in ec_questions becomes redundant.
-- Optional: ALTER TABLE ec_questions DROP COLUMN IF EXISTS assessment_id;

-- 5. UPDATE DATA: Populate the new assessment fields
UPDATE ec_skill_assessments SET duration = 30, passing_score = 20 WHERE assessment_name = 'JavaScript Fundamentals';
UPDATE ec_skill_assessments SET duration = 45, passing_score = 30 WHERE assessment_name = 'React Performance Tuning';
UPDATE ec_skill_assessments SET duration = 30, passing_score = 25 WHERE assessment_name = 'Node.js Backend Mastery';
UPDATE ec_skill_assessments SET duration = 30, passing_score = 20 WHERE assessment_name = 'SQL Query Optimization';
UPDATE ec_skill_assessments SET duration = 10, passing_score = 25 WHERE assessment_name LIKE 'JavaScript AI Challenge%';

-- ================================================================================ module 3 ========================================================================


-- =============================================================================
-- Module 3: Project & Gig Marketplace — Local PostgreSQL Init Script
-- =============================================================================
-- Run this ONCE to set up the local database.
--
-- HOW TO RUN:
--   Option A — psql CLI:
--     psql -U postgres -c "CREATE DATABASE nfasvp_module3;"
--     psql -U postgres -d nfasvp_module3 -f database/init.sql
--
--   Option B — Docker (see docker-compose.yml):
--     The 'postgres' service in docker-compose.yml mounts this file automatically.
--     docker compose up postgres
--
--   Option C — pgAdmin / DBeaver:
--     Open a query window on the nfasvp_module3 database and run this file.
--
-- RE-RUNS: This file is idempotent (CREATE IF NOT EXISTS + DO $$ EXCEPTION).
--          Safe to run multiple times; existing data is never dropped.
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- ENUM TYPE DEFINITIONS (idempotent DO blocks)
-- =============================================================================

  CREATE TYPE contract_status AS ENUM ('active', 'completed', 'cancelled', 'disputed');

  CREATE TYPE booking_status AS ENUM (
    'pending', 'confirmed', 'in_progress',
    'delivered', 'completed', 'cancelled', 'refunded'
  );

  CREATE TYPE job_status AS ENUM ('open', 'in_progress', 'completed', 'cancelled', 'closed');

  CREATE TYPE bid_status AS ENUM ('pending', 'accepted', 'rejected', 'withdrawn');

  CREATE TYPE gig_status AS ENUM ('draft', 'live', 'paused');

  CREATE TYPE pricing_tier AS ENUM ('basic', 'standard', 'premium');

  CREATE TYPE milestone_status AS ENUM (
    'pending', 'in_progress', 'submitted', 'approved', 'rejected'
  );

  CREATE TYPE project_type AS ENUM ('fixed_price', 'hourly');

  CREATE TYPE notification_event AS ENUM (
    'bid_submitted', 'bid_accepted', 'bid_rejected', 'bid_withdrawn',
    'gig_published', 'gig_paused',
    'project_started', 'project_completed', 'project_cancelled',
    'milestone_submitted', 'milestone_approved', 'milestone_rejected',
    'job_posted', 'job_closed'
  );

-- =============================================================================
-- TABLE 1: marketplace_categories
-- =============================================================================

CREATE TABLE IF NOT EXISTS marketplace_categories (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(100) NOT NULL,
  slug        VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon_url    TEXT,
  parent_id   UUID        REFERENCES marketplace_categories(id) ON DELETE SET NULL,
  is_active   BOOLEAN     NOT NULL DEFAULT true,
  sort_order  INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON marketplace_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug      ON marketplace_categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON marketplace_categories(is_active);

-- =============================================================================
-- TABLE 2: marketplace_tags
-- =============================================================================

CREATE TABLE IF NOT EXISTS marketplace_tags (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(100) NOT NULL UNIQUE,
  slug        VARCHAR(100) NOT NULL UNIQUE,
  category_id UUID        REFERENCES marketplace_categories(id) ON DELETE SET NULL,
  is_verified BOOLEAN     NOT NULL DEFAULT false,
  usage_count INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tags_slug        ON marketplace_tags(slug);
CREATE INDEX IF NOT EXISTS idx_tags_category_id ON marketplace_tags(category_id);
CREATE INDEX IF NOT EXISTS idx_tags_is_verified ON marketplace_tags(is_verified);

-- =============================================================================
-- TABLE 3: jobs
-- =============================================================================

CREATE TABLE IF NOT EXISTS jobs (
  id               UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id        UUID         NOT NULL,
  title            VARCHAR(200) NOT NULL,
  description      TEXT         NOT NULL,
  category_id      UUID         REFERENCES marketplace_categories(id) ON DELETE SET NULL,
  project_type     project_type NOT NULL DEFAULT 'fixed_price',
  budget_min       NUMERIC(12,2),
  budget_max       NUMERIC(12,2),
  duration_label   VARCHAR(50),
  experience_level skill_level,
  status           job_status   NOT NULL DEFAULT 'open',
  bids_count       INTEGER      NOT NULL DEFAULT 0,
  is_verified      BOOLEAN      NOT NULL DEFAULT false,
  expires_at       TIMESTAMPTZ,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_budget_range    CHECK (budget_min IS NULL OR budget_max IS NULL OR budget_min <= budget_max),
  CONSTRAINT chk_budget_positive CHECK (budget_min IS NULL OR budget_min >= 0)
);

CREATE INDEX IF NOT EXISTS idx_jobs_client_id   ON jobs(client_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status       ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_category_id  ON jobs(category_id);
CREATE INDEX IF NOT EXISTS idx_jobs_project_type ON jobs(project_type);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at   ON jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_fts          ON jobs
  USING gin(to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,'')));

-- =============================================================================
-- TABLE 4: job_required_skills
-- =============================================================================

CREATE TABLE IF NOT EXISTS job_required_skills (
  id     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES marketplace_tags(id) ON DELETE CASCADE,
  level  skill_level,
  CONSTRAINT uq_job_tag UNIQUE (job_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_job_skills_job_id ON job_required_skills(job_id);
CREATE INDEX IF NOT EXISTS idx_job_skills_tag_id ON job_required_skills(tag_id);

-- =============================================================================
-- TABLE 5: bids
-- =============================================================================

CREATE TABLE IF NOT EXISTS bids (
  id             UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id         UUID         NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  freelancer_id  UUID         NOT NULL,
  bid_amount     NUMERIC(12,2) NOT NULL,
  bid_type       project_type NOT NULL DEFAULT 'fixed_price',
  duration_label VARCHAR(50),
  cover_letter   TEXT,
  status         bid_status   NOT NULL DEFAULT 'pending',
  milestones     JSONB        NOT NULL DEFAULT '[]'::jsonb,
  submitted_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_bid_freelancer_job   UNIQUE (job_id, freelancer_id),
  CONSTRAINT chk_bid_amount_positive CHECK (bid_amount > 0)
);

CREATE INDEX IF NOT EXISTS idx_bids_job_id        ON bids(job_id);
CREATE INDEX IF NOT EXISTS idx_bids_freelancer_id ON bids(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_bids_status        ON bids(status);
CREATE INDEX IF NOT EXISTS idx_bids_submitted_at  ON bids(submitted_at DESC);

-- =============================================================================
-- TABLE 6: gigs
-- =============================================================================

CREATE TABLE IF NOT EXISTS gigs (
  id            UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  freelancer_id UUID         NOT NULL,
  category_id   UUID         REFERENCES marketplace_categories(id) ON DELETE SET NULL,
  title         VARCHAR(200) NOT NULL,
  description   TEXT         NOT NULL,
  thumbnail_url TEXT,
  status        gig_status   NOT NULL DEFAULT 'draft',
  orders_count  INTEGER      NOT NULL DEFAULT 0,
  avg_rating    NUMERIC(3,2) NOT NULL DEFAULT 0.00,
  review_count  INTEGER      NOT NULL DEFAULT 0,
  is_featured   BOOLEAN      NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_avg_rating CHECK (avg_rating >= 0 AND avg_rating <= 5)
);

CREATE INDEX IF NOT EXISTS idx_gigs_freelancer_id ON gigs(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_gigs_category_id   ON gigs(category_id);
CREATE INDEX IF NOT EXISTS idx_gigs_status        ON gigs(status);
CREATE INDEX IF NOT EXISTS idx_gigs_is_featured   ON gigs(is_featured);
CREATE INDEX IF NOT EXISTS idx_gigs_created_at    ON gigs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gigs_fts           ON gigs
  USING gin(to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,'')));

-- =============================================================================
-- TABLE 7: gig_pricing_tiers
-- =============================================================================

CREATE TABLE IF NOT EXISTS gig_pricing_tiers (
  id            UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  gig_id        UUID         NOT NULL REFERENCES gigs(id) ON DELETE CASCADE,
  tier          pricing_tier NOT NULL,
  package_name  VARCHAR(100),
  description   TEXT,
  price         NUMERIC(12,2) NOT NULL,
  delivery_days INTEGER      NOT NULL,
  revisions     VARCHAR(20)  NOT NULL DEFAULT '1',
  deliverables  TEXT[],

  CONSTRAINT uq_gig_tier           UNIQUE (gig_id, tier),
  CONSTRAINT chk_price_positive    CHECK (price > 0),
  CONSTRAINT chk_delivery_positive CHECK (delivery_days > 0)
);

CREATE INDEX IF NOT EXISTS idx_pricing_tiers_gig_id ON gig_pricing_tiers(gig_id);
CREATE INDEX IF NOT EXISTS idx_pricing_tiers_tier   ON gig_pricing_tiers(tier);

-- =============================================================================
-- TABLE 8: gig_portfolio_samples
-- =============================================================================

CREATE TABLE IF NOT EXISTS gig_portfolio_samples (
  id         UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  gig_id     UUID         NOT NULL REFERENCES gigs(id) ON DELETE CASCADE,
  title      VARCHAR(200),
  file_url   TEXT         NOT NULL,
  file_type  VARCHAR(50),
  sort_order INTEGER      NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_gig_id ON gig_portfolio_samples(gig_id);

-- =============================================================================
-- TABLE 9: gig_required_skills
-- =============================================================================

CREATE TABLE IF NOT EXISTS gig_required_skills (
  id     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gig_id UUID NOT NULL REFERENCES gigs(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES marketplace_tags(id) ON DELETE CASCADE,
  CONSTRAINT uq_gig_tag UNIQUE (gig_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_gig_skills_gig_id ON gig_required_skills(gig_id);
CREATE INDEX IF NOT EXISTS idx_gig_skills_tag_id ON gig_required_skills(tag_id);

-- =============================================================================
-- TABLE 10: projects
-- =============================================================================

CREATE TABLE IF NOT EXISTS projects (
  id                  UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id              UUID            NOT NULL REFERENCES jobs(id) ON DELETE RESTRICT,
  bid_id              UUID            NOT NULL REFERENCES bids(id) ON DELETE RESTRICT,
  client_id           UUID            NOT NULL,
  freelancer_id       UUID            NOT NULL,
  title               VARCHAR(200)    NOT NULL,
  total_amount        NUMERIC(12,2)   NOT NULL,
  project_type        project_type    NOT NULL DEFAULT 'fixed_price',
  status              contract_status NOT NULL DEFAULT 'active',
  escrow_reference_id UUID,
  started_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  deadline_at         TIMESTAMPTZ,
  completed_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_project_bid              UNIQUE (bid_id),
  CONSTRAINT chk_total_amount_positive   CHECK (total_amount > 0)
);

CREATE INDEX IF NOT EXISTS idx_projects_job_id        ON projects(job_id);
CREATE INDEX IF NOT EXISTS idx_projects_bid_id        ON projects(bid_id);
CREATE INDEX IF NOT EXISTS idx_projects_client_id     ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_freelancer_id ON projects(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_projects_status        ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at    ON projects(created_at DESC);

-- =============================================================================
-- TABLE 11: project_milestones
-- =============================================================================

CREATE TABLE IF NOT EXISTS project_milestones (
  id           UUID             PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id   UUID             NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title        VARCHAR(200)     NOT NULL,
  description  TEXT,
  amount       NUMERIC(12,2)    NOT NULL,
  due_date     DATE,
  status       milestone_status NOT NULL DEFAULT 'pending',
  sort_order   INTEGER          NOT NULL DEFAULT 0,
  submitted_at TIMESTAMPTZ,
  approved_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ      NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_milestone_amount_positive CHECK (amount > 0)
);

CREATE INDEX IF NOT EXISTS idx_milestones_project_id ON project_milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_milestones_status     ON project_milestones(status);

-- =============================================================================
-- TABLE 12: project_git_repos
-- =============================================================================

CREATE TABLE IF NOT EXISTS project_git_repos (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  repo_url   TEXT        NOT NULL,
  provider   VARCHAR(30) NOT NULL DEFAULT 'github',
  branch     VARCHAR(100) NOT NULL DEFAULT 'main',
  is_private BOOLEAN     NOT NULL DEFAULT true,
  linked_by  UUID        NOT NULL,
  linked_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_project_repo UNIQUE (project_id)
);

CREATE INDEX IF NOT EXISTS idx_git_repos_project_id ON project_git_repos(project_id);

-- =============================================================================
-- TABLE 13: marketplace_notifications_log
-- =============================================================================

CREATE TABLE IF NOT EXISTS marketplace_notifications_log (
  id               UUID               PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type       notification_event NOT NULL,
  triggered_by     UUID               NOT NULL,
  recipient_id     UUID               NOT NULL,
  entity_type      VARCHAR(50)        NOT NULL,
  entity_id        UUID               NOT NULL,
  payload          JSONB,
  module6_sent     BOOLEAN            NOT NULL DEFAULT false,
  module6_response JSONB,
  created_at       TIMESTAMPTZ        NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notif_log_recipient_id ON marketplace_notifications_log(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notif_log_event_type   ON marketplace_notifications_log(event_type);
CREATE INDEX IF NOT EXISTS idx_notif_log_entity_id    ON marketplace_notifications_log(entity_id);
CREATE INDEX IF NOT EXISTS idx_notif_log_created_at   ON marketplace_notifications_log(created_at DESC);

