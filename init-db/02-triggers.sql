CREATE OR REPLACE FUNCTION update_freelancer_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE profiles
    SET 
        average_rating = (
            SELECT COALESCE(AVG(rating), 0)
            FROM reviews
            WHERE freelancer_id = COALESCE(NEW.freelancer_id, OLD.freelancer_id)
        ),
        total_reviews = (
            SELECT COUNT(*)
            FROM reviews
            WHERE freelancer_id = COALESCE(NEW.freelancer_id, OLD.freelancer_id)
        )
    WHERE user_id = COALESCE(NEW.freelancer_id, OLD.freelancer_id);

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER review_rating_trigger
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_freelancer_rating();

CREATE OR REPLACE FUNCTION update_freelancer_rating_delete()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE profiles
    SET 
        average_rating = (
            SELECT COALESCE(AVG(rating), 0)
            FROM reviews
            WHERE freelancer_id = OLD.freelancer_id
        ),
        total_reviews = (
            SELECT COUNT(*)
            FROM reviews
            WHERE freelancer_id = OLD.freelancer_id
        )
    WHERE user_id = OLD.freelancer_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER review_delete_trigger
AFTER DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_freelancer_rating_delete();

CREATE OR REPLACE FUNCTION update_trust_score()
RETURNS TRIGGER AS $$
DECLARE
    uid INTEGER;
    avg_rating NUMERIC;
    cert_count INTEGER;
    skill_count INTEGER;
    work_count INTEGER;
    final_score NUMERIC;
    tier TEXT;
BEGIN

    -- Determine User ID based on table
    IF TG_TABLE_NAME = 'reviews' THEN
        uid := COALESCE(NEW.freelancer_id, OLD.freelancer_id);
    ELSE
        uid := COALESCE(NEW.user_id, OLD.user_id);
    END IF;

    -- REVIEWS
    SELECT COALESCE(AVG(rating),0)
    INTO avg_rating
    FROM reviews
    WHERE freelancer_id = uid;

    -- CERTIFICATIONS
    SELECT COUNT(*)
    INTO cert_count
    FROM certifications
    WHERE user_id = uid
    AND verification_status = 'verified';

    -- SKILLS
    SELECT COUNT(*)
    INTO skill_count
    FROM user_skills
    WHERE user_id = uid;

    -- WORK HISTORY
    SELECT COUNT(*)
    INTO work_count
    FROM work_history
    WHERE user_id = uid;

    -- TRUST SCORE CALCULATION
    final_score :=
        (avg_rating / 5) * 50 +
        LEAST(cert_count * 5, 20) +
        LEAST(skill_count * 2, 15) +
        LEAST(work_count * 3, 15);

    final_score := LEAST(final_score, 100);

    -- TIER CALCULATION
    IF final_score >= 85 THEN
        tier := 'Elite';
    ELSIF final_score >= 70 THEN
        tier := 'Gold';
    ELSIF final_score >= 50 THEN
        tier := 'Silver';
    ELSE
        tier := 'Bronze';
    END IF;

    -- FINAL UPDATE (ONLY ONCE)
    UPDATE profiles
    SET 
        trust_score = final_score,
        tier_level = tier
    WHERE user_id = uid;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER review_trust_trigger
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_trust_score();

CREATE TRIGGER cert_trust_trigger
AFTER INSERT OR UPDATE OR DELETE ON certifications
FOR EACH ROW
EXECUTE FUNCTION update_trust_score();

CREATE TRIGGER skill_trust_trigger
AFTER INSERT OR DELETE ON user_skills
FOR EACH ROW
EXECUTE FUNCTION update_trust_score();

CREATE TRIGGER work_trust_trigger
AFTER INSERT OR DELETE ON work_history
FOR EACH ROW
EXECUTE FUNCTION update_trust_score();


-- ========================================================================================================= module 2 =============================================================================================

-- 02-master-triggers.sql

-- ==========================================
-- 1. CREATE THE GENERIC UPDATE FUNCTION
-- ==========================================
-- This function automatically sets the updated_at column to the current timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
 $$ language 'plpgsql';

-- ==========================================
-- 2. ATTACH THE TRIGGER TO PRISMA'S TABLES
-- ==========================================

-- Trigger for ec_skill_assessments
CREATE TRIGGER update_ec_skill_assessments_updated_at
    BEFORE UPDATE ON ec_skill_assessments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for ec_questions
CREATE TRIGGER update_ec_questions_updated_at
    BEFORE UPDATE ON ec_questions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for ec_submissions
CREATE TRIGGER update_ec_submissions_updated_at
    BEFORE UPDATE ON ec_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();



--===================================================== module 3 =========================================================
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



