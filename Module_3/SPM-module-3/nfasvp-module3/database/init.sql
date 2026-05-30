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

DO $$ BEGIN
  CREATE TYPE contract_status AS ENUM ('active', 'completed', 'cancelled', 'disputed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM (
    'pending', 'confirmed', 'in_progress',
    'delivered', 'completed', 'cancelled', 'refunded'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE skill_level AS ENUM ('beginner', 'intermediate', 'expert');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE verification_status AS ENUM ('unverified', 'pending', 'verified', 'rejected');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE job_status AS ENUM ('open', 'in_progress', 'completed', 'cancelled', 'closed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE bid_status AS ENUM ('pending', 'accepted', 'rejected', 'withdrawn');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE gig_status AS ENUM ('draft', 'live', 'paused');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE pricing_tier AS ENUM ('basic', 'standard', 'premium');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE milestone_status AS ENUM (
    'pending', 'in_progress', 'submitted', 'approved', 'rejected'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE project_type AS ENUM ('fixed_price', 'hourly');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE notification_event AS ENUM (
    'bid_submitted', 'bid_accepted', 'bid_rejected', 'bid_withdrawn',
    'gig_published', 'gig_paused',
    'project_started', 'project_completed', 'project_cancelled',
    'milestone_submitted', 'milestone_approved', 'milestone_rejected',
    'job_posted', 'job_closed'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

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

-- =============================================================================
-- SHARED TRIGGER: auto-update updated_at on every row mutation
-- =============================================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER trg_categories_updated_at
    BEFORE UPDATE ON marketplace_categories
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

  CREATE TRIGGER trg_jobs_updated_at
    BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

  CREATE TRIGGER trg_bids_updated_at
    BEFORE UPDATE ON bids
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

  CREATE TRIGGER trg_gigs_updated_at
    BEFORE UPDATE ON gigs
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

  CREATE TRIGGER trg_pricing_tiers_updated_at
    BEFORE UPDATE ON gig_pricing_tiers
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

  CREATE TRIGGER trg_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

  CREATE TRIGGER trg_milestones_updated_at
    BEFORE UPDATE ON project_milestones
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- =============================================================================
-- STORED PROCEDURE: accept_bid_transaction (ACID bid acceptance)
-- =============================================================================
--
-- This function is no longer called via supabase.rpc() — the application now
-- executes the same 4 steps directly inside a pg BEGIN/COMMIT block in
-- bidRepository.js (acceptBidTransaction). This SQL definition is kept here
-- so the procedure also exists in the local DB for optional direct SQL usage.
--
-- REQ-MKT-031: Bid acceptance MUST be an atomic operation.
-- =============================================================================

CREATE OR REPLACE FUNCTION accept_bid_transaction(
  p_job_id        UUID,
  p_bid_id        UUID,
  p_client_id     UUID,
  p_freelancer_id UUID,
  p_title         TEXT,
  p_total_amount  NUMERIC,
  p_project_type  TEXT,
  p_deadline_at   TIMESTAMPTZ DEFAULT NULL
)
RETURNS SETOF projects
LANGUAGE plpgsql
AS $$
DECLARE
  v_project projects%ROWTYPE;
BEGIN
  -- Guard: verify the bid belongs to the given job
  IF NOT EXISTS (
    SELECT 1 FROM bids WHERE id = p_bid_id AND job_id = p_job_id
  ) THEN
    RAISE EXCEPTION 'Bid % does not belong to job %', p_bid_id, p_job_id
      USING ERRCODE = 'P0002';
  END IF;

  -- Guard: verify the job is still open
  IF NOT EXISTS (
    SELECT 1 FROM jobs WHERE id = p_job_id AND status = 'open'
  ) THEN
    RAISE EXCEPTION 'Job % is no longer open for acceptance', p_job_id
      USING ERRCODE = 'P0003';
  END IF;

  -- Guard: verify the bid is still pending
  IF NOT EXISTS (
    SELECT 1 FROM bids WHERE id = p_bid_id AND status = 'pending'
  ) THEN
    RAISE EXCEPTION 'Bid % is no longer in pending status', p_bid_id
      USING ERRCODE = 'P0004';
  END IF;

  -- Step 1: Accept the winning bid
  UPDATE bids
  SET    status     = 'accepted',
         updated_at = NOW()
  WHERE  id = p_bid_id;

  -- Step 2: Reject all other pending bids on this job
  UPDATE bids
  SET    status     = 'rejected',
         updated_at = NOW()
  WHERE  job_id = p_job_id
    AND  id     != p_bid_id
    AND  status = 'pending';

  -- Step 3: Set job status to in_progress
  UPDATE jobs
  SET    status     = 'in_progress',
         updated_at = NOW()
  WHERE  id = p_job_id;

  -- Step 4: Create the project record
  INSERT INTO projects (
    job_id, bid_id, client_id, freelancer_id,
    title, total_amount, project_type,
    status, started_at, deadline_at
  )
  VALUES (
    p_job_id, p_bid_id, p_client_id, p_freelancer_id,
    p_title, p_total_amount, p_project_type::project_type,
    'active', NOW(), p_deadline_at
  )
  RETURNING * INTO v_project;

  RETURN NEXT v_project;
  RETURN;

EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$;
