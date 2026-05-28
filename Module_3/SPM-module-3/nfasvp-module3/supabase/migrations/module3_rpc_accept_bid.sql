-- =============================================================================
-- Module 3: ACID Bid Acceptance Stored Procedure
-- Run AFTER module3_schema.sql on Supabase SQL Editor
-- =============================================================================
--
-- This RPC ensures the 4-step bid acceptance is fully atomic:
--   1. Accept the winning bid
--   2. Reject all other pending bids on the same job
--   3. Set job status to 'in_progress'
--   4. Create the project record
--
-- Called from bidRepository.js via: supabase.rpc('accept_bid_transaction', {...})
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
SECURITY DEFINER
AS $$
DECLARE
  v_project projects%ROWTYPE;
BEGIN
  -- ── Guard: verify the bid belongs to the given job ────────────────────────
  IF NOT EXISTS (
    SELECT 1 FROM bids WHERE id = p_bid_id AND job_id = p_job_id
  ) THEN
    RAISE EXCEPTION 'Bid % does not belong to job %', p_bid_id, p_job_id
      USING ERRCODE = 'P0002';
  END IF;

  -- ── Guard: verify the job is still open ───────────────────────────────────
  IF NOT EXISTS (
    SELECT 1 FROM jobs WHERE id = p_job_id AND status = 'open'
  ) THEN
    RAISE EXCEPTION 'Job % is no longer open for acceptance', p_job_id
      USING ERRCODE = 'P0003';
  END IF;

  -- ── Guard: verify the bid is still pending ────────────────────────────────
  IF NOT EXISTS (
    SELECT 1 FROM bids WHERE id = p_bid_id AND status = 'pending'
  ) THEN
    RAISE EXCEPTION 'Bid % is no longer in pending status', p_bid_id
      USING ERRCODE = 'P0004';
  END IF;

  -- ── Step 1: Accept the winning bid ────────────────────────────────────────
  UPDATE bids
  SET    status     = 'accepted',
         updated_at = NOW()
  WHERE  id = p_bid_id;

  -- ── Step 2: Reject all other pending bids on this job ────────────────────
  UPDATE bids
  SET    status     = 'rejected',
         updated_at = NOW()
  WHERE  job_id = p_job_id
    AND  id     != p_bid_id
    AND  status = 'pending';

  -- ── Step 3: Set job status to in_progress ─────────────────────────────────
  UPDATE jobs
  SET    status     = 'in_progress',
         updated_at = NOW()
  WHERE  id = p_job_id;

  -- ── Step 4: Create the project record ─────────────────────────────────────
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

  -- ── Return the newly created project row ──────────────────────────────────
  RETURN NEXT v_project;
  RETURN;

EXCEPTION
  WHEN OTHERS THEN
    -- Re-raise; PostgreSQL rolls back the entire transaction automatically
    RAISE;
END;
$$;

-- Grant execute permission to the authenticated role used by Supabase service key
GRANT EXECUTE ON FUNCTION accept_bid_transaction(
  UUID, UUID, UUID, UUID, TEXT, NUMERIC, TEXT, TIMESTAMPTZ
) TO service_role;

-- =============================================================================
-- HOW TO RUN:
--   1. Supabase Dashboard → SQL Editor → paste and Run.
--   2. Must be run AFTER module3_schema.sql (tables must exist first).
--   3. To test manually:
--      SELECT * FROM accept_bid_transaction(
--        'job-uuid-here', 'bid-uuid-here',
--        'client-uuid', 'freelancer-uuid',
--        'My Project Title', 2000.00, 'fixed_price', NULL
--      );
-- =============================================================================
