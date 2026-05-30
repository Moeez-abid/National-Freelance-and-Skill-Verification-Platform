-- =============================================================================
-- accept_bid_transaction RPC
-- Module 3: Atomically accepts a bid, rejects all others on the same job,
-- sets the job to in_progress, and creates a project record.
--
-- Called by: BiddingService.acceptBid() → bidRepository.acceptBidTransaction()
-- ACID guarantee: all 4 operations succeed or all roll back.
--
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
  -- 1. Accept the winning bid
  UPDATE bids
  SET    status     = 'accepted',
         updated_at = NOW()
  WHERE  id = p_bid_id
    AND  job_id = p_job_id
    AND  status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Bid % not found or not pending on job %', p_bid_id, p_job_id;
  END IF;

  -- 2. Reject all other pending bids on the same job
  UPDATE bids
  SET    status     = 'rejected',
         updated_at = NOW()
  WHERE  job_id = p_job_id
    AND  id    != p_bid_id
    AND  status = 'pending';

  -- 3. Move the job to in_progress
  UPDATE jobs
  SET    status     = 'in_progress',
         updated_at = NOW()
  WHERE  id = p_job_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Job % not found', p_job_id;
  END IF;

  -- 4. Create the project record
  INSERT INTO projects (
    job_id,
    bid_id,
    client_id,
    freelancer_id,
    title,
    total_amount,
    project_type,
    status,
    started_at,
    deadline_at
  ) VALUES (
    p_job_id,
    p_bid_id,
    p_client_id,
    p_freelancer_id,
    p_title,
    p_total_amount,
    p_project_type::project_type,
    'active',
    NOW(),
    p_deadline_at
  )
  RETURNING * INTO v_project;

  -- 5. Copy milestones from bid to project_milestones
  -- We parse the JSONB array from the bid table
  INSERT INTO project_milestones (
    project_id,
    title,
    amount,
    due_date,
    status,
    sort_order
  )
  SELECT
    v_project.id,
    (m.value->>'title')::VARCHAR,
    (REPLACE(REPLACE(m.value->>'budget', '$', ''), ',', ''))::NUMERIC,
    CASE 
      WHEN (m.value->>'due') ~ '^\d{4}-\d{2}-\d{2}$' THEN (m.value->>'due')::DATE 
      ELSE NULL 
    END,
    'pending',
    (m.ordinality - 1)
  FROM bids,
       jsonb_array_elements(milestones) WITH ORDINALITY AS m
  WHERE bids.id = p_bid_id;

  RETURN NEXT v_project;
END;
$$;
