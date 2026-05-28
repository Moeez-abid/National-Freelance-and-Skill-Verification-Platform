'use strict';

/**
 * bidRepository.js — Data Access Layer (local PostgreSQL)
 * All queries against the bids table, including the ACID transaction.
 *
 * Every function returns { data, error } (or { data, error, count } for paged queries)
 * to preserve the same interface the application layer already expects.
 */

const pool = require('../../config/pgClient');

// ─── helpers ────────────────────────────────────────────────────────────────

/** Wrap a pg result row (or null) in the { data, error } envelope. */
function ok(row)      { return { data: row  || null, error: null }; }
function okMany(rows) { return { data: rows || [],   error: null }; }
function fail(err)    { return { data: null, error: err };          }

// ─── BIDS ─────────────────────────────────────────────────────────────────────

/**
 * Insert a new bid with status='pending'.
 * @param {Object} bidData - { job_id, freelancer_id, bid_amount, bid_type, duration_label, cover_letter, milestones }
 */
async function createBid(bidData) {
  try {
    const { job_id, freelancer_id, bid_amount, bid_type, duration_label, cover_letter, milestones } = bidData;
    const sql = `
      INSERT INTO bids (job_id, freelancer_id, bid_amount, bid_type, duration_label, cover_letter, milestones, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
      RETURNING *`;
    const { rows } = await pool.query(sql, [
      job_id, freelancer_id, bid_amount,
      bid_type || 'fixed_price',
      duration_label || null,
      cover_letter,
      JSON.stringify(milestones || []),
    ]);
    return ok(rows[0]);
  } catch (err) { return fail(err); }
}

/**
 * Fetch a single bid by ID, with the related job summary.
 * @param {string} id
 */
async function getBidById(id) {
  try {
    const sql = `
      SELECT b.*,
             json_build_object('id', j.id, 'title', j.title,
               'budget_min', j.budget_min, 'budget_max', j.budget_max,
               'status', j.status, 'client_id', j.client_id) AS job
      FROM bids b
      LEFT JOIN jobs j ON j.id = b.job_id
      WHERE b.id = $1`;
    const { rows } = await pool.query(sql, [id]);
    return ok(rows[0]);
  } catch (err) { return fail(err); }
}

/**
 * List all bids on a job (for client review).
 * @param {string} jobId
 */
async function getBidsByJob(jobId) {
  try {
    const sql = `SELECT * FROM bids WHERE job_id = $1 ORDER BY submitted_at DESC`;
    const { rows } = await pool.query(sql, [jobId]);
    return okMany(rows);
  } catch (err) { return fail(err); }
}

/**
 * Paginated bids by freelancer, with optional status filter (My Proposals view).
 * @param {string} freelancerId
 * @param {{ status?: string, page?: number, limit?: number }} filters
 */
async function getBidsByFreelancer(freelancerId, filters = {}) {
  try {
    const { status, page = 1, limit = 10 } = filters;
    const offset = (page - 1) * limit;
    const params = [freelancerId];
    let whereClause = 'WHERE b.freelancer_id = $1';

    if (status) {
      params.push(status);
      whereClause += ` AND b.status = $${params.length}`;
    }

    // Count query
    const countSql = `
      SELECT COUNT(*) AS total
      FROM bids b
      ${whereClause}`;
    const countRes = await pool.query(countSql, params);
    const count = parseInt(countRes.rows[0].total, 10);

    // Data query
    params.push(limit, offset);
    const sql = `
      SELECT b.*,
             json_build_object('id', j.id, 'title', j.title,
               'budget_min', j.budget_min, 'budget_max', j.budget_max,
               'status', j.status, 'client_id', j.client_id) AS job
      FROM bids b
      LEFT JOIN jobs j ON j.id = b.job_id
      ${whereClause}
      ORDER BY b.submitted_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}`;
    const { rows } = await pool.query(sql, params);
    return { data: rows, error: null, count };
  } catch (err) { return { data: null, error: err, count: 0 }; }
}

/**
 * Update the status of a single bid.
 * @param {string} id
 * @param {string} status - bid_status enum value
 */
async function updateBidStatus(id, status) {
  try {
    const sql = `UPDATE bids SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, status`;
    const { rows } = await pool.query(sql, [status, id]);
    return ok(rows[0]);
  } catch (err) { return fail(err); }
}

/**
 * Reject all bids on a job except the accepted one.
 * @param {string} jobId
 * @param {string} acceptedBidId
 */
async function rejectAllOtherBids(jobId, acceptedBidId) {
  try {
    const sql = `
      UPDATE bids SET status = 'rejected', updated_at = NOW()
      WHERE job_id = $1 AND id != $2 AND status = 'pending'`;
    const { rowCount } = await pool.query(sql, [jobId, acceptedBidId]);
    return { data: { rowCount }, error: null };
  } catch (err) { return fail(err); }
}

/**
 * Check if a freelancer already has a bid on this job.
 * Returns { data: true } if a duplicate exists.
 * @param {string} jobId
 * @param {string} freelancerId
 */
async function checkDuplicateBid(jobId, freelancerId) {
  try {
    const sql = `SELECT id FROM bids WHERE job_id = $1 AND freelancer_id = $2 LIMIT 1`;
    const { rows } = await pool.query(sql, [jobId, freelancerId]);
    return { data: rows.length > 0, error: null };
  } catch (err) { return fail(err); }
}

/**
 * Withdraw a bid — set status to 'withdrawn'.
 * Verifies freelancer_id ownership before update.
 * @param {string} id
 * @param {string} freelancerId
 */
async function withdrawBid(id, freelancerId) {
  try {
    const sql = `
      UPDATE bids SET status = 'withdrawn', updated_at = NOW()
      WHERE id = $1 AND freelancer_id = $2 AND status = 'pending'
      RETURNING id, status`;
    const { rows } = await pool.query(sql, [id, freelancerId]);
    return ok(rows[0]);
  } catch (err) { return fail(err); }
}

// ─── ATOMIC BID ACCEPTANCE (ACID via PostgreSQL transaction) ─────────────────

/**
 * Atomically accepts a bid and creates a project in a single DB transaction.
 * Replaces the Supabase RPC call — the same 4-step logic is now executed
 * in a local pg transaction using BEGIN/COMMIT.
 *
 *   1. UPDATE bids SET status='accepted' WHERE id=bidId
 *   2. UPDATE bids SET status='rejected' WHERE job_id=jobId AND id != bidId
 *   3. UPDATE jobs  SET status='in_progress' WHERE id=jobId
 *   4. INSERT INTO projects (...) VALUES (...)
 *   5. RETURN the new project row
 *
 * @param {string} jobId
 * @param {string} bidId
 * @param {Object} projectData - { client_id, freelancer_id, title, total_amount, project_type, deadline_at? }
 */
async function acceptBidTransaction(jobId, bidId, projectData) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Guard: bid belongs to job
    const guardBid = await client.query(
      'SELECT id FROM bids WHERE id = $1 AND job_id = $2',
      [bidId, jobId]
    );
    if (guardBid.rowCount === 0) throw new Error(`Bid ${bidId} does not belong to job ${jobId}`);

    // Guard: job is still open
    const guardJob = await client.query(
      "SELECT id FROM jobs WHERE id = $1 AND status = 'open'",
      [jobId]
    );
    if (guardJob.rowCount === 0) throw new Error(`Job ${jobId} is no longer open for acceptance`);

    // Guard: bid is still pending
    const guardStatus = await client.query(
      "SELECT id FROM bids WHERE id = $1 AND status = 'pending'",
      [bidId]
    );
    if (guardStatus.rowCount === 0) throw new Error(`Bid ${bidId} is no longer in pending status`);

    // Step 1: Accept the winning bid
    await client.query(
      "UPDATE bids SET status = 'accepted', updated_at = NOW() WHERE id = $1",
      [bidId]
    );

    // Step 2: Reject all other pending bids on this job
    await client.query(
      "UPDATE bids SET status = 'rejected', updated_at = NOW() WHERE job_id = $1 AND id != $2 AND status = 'pending'",
      [jobId, bidId]
    );

    // Step 3: Set job status to in_progress
    await client.query(
      "UPDATE jobs SET status = 'in_progress', updated_at = NOW() WHERE id = $1",
      [jobId]
    );

    // Step 4: Create the project record
    const insertProject = await client.query(
      `INSERT INTO projects (job_id, bid_id, client_id, freelancer_id, title, total_amount, project_type, status, started_at, deadline_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7::project_type, 'active', NOW(), $8)
       RETURNING *`,
      [
        jobId,
        bidId,
        projectData.client_id,
        projectData.freelancer_id,
        projectData.title,
        projectData.total_amount,
        projectData.project_type,
        projectData.deadline_at || null,
      ]
    );

    await client.query('COMMIT');
    return { data: [insertProject.rows[0]], error: null };
  } catch (err) {
    await client.query('ROLLBACK');
    return fail(err);
  } finally {
    client.release();
  }
}

module.exports = {
  createBid,
  getBidById,
  getBidsByJob,
  getBidsByFreelancer,
  updateBidStatus,
  rejectAllOtherBids,
  checkDuplicateBid,
  withdrawBid,
  acceptBidTransaction,
};
