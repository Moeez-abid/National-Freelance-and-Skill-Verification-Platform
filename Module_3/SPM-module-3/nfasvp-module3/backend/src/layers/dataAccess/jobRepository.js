'use strict';

/**
 * jobRepository.js — Data Access Layer (local PostgreSQL)
 * All queries against the jobs and job_required_skills tables.
 */

const pool = require('../../config/pgClient');

function ok(row)   { return { data: row  || null, error: null }; }
function fail(err) { return { data: null, error: err };          }

// ─── JOBS ─────────────────────────────────────────────────────────────────────

/**
 * Insert a new job listing.
 * @param {Object} jobData
 */
async function createJob(jobData) {
  try {
    const {
      client_id, title, description, category_id,
      project_type, budget_min, budget_max,
      duration_label, experience_level, expires_at,
    } = jobData;

    const sql = `
      INSERT INTO jobs (
        client_id, title, description, category_id,
        project_type, budget_min, budget_max,
        duration_label, experience_level, expires_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *`;
    const { rows } = await pool.query(sql, [
      client_id, title, description,
      category_id      || null,
      project_type     || 'fixed_price',
      budget_min       !== undefined ? budget_min : null,
      budget_max       !== undefined ? budget_max : null,
      duration_label   || null,
      experience_level || null,
      expires_at       || null,
    ]);
    return ok(rows[0]);
  } catch (err) { return fail(err); }
}

/**
 * Fetch a single job with its required skills (tags).
 * @param {string} id
 */
async function getJobById(id) {
  try {
    const sql = `
      SELECT
        j.*,
        json_build_object('id', c.id, 'name', c.name, 'slug', c.slug) AS category,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object(
            'id', jrs.id, 'level', jrs.level,
            'tag', json_build_object('id', mt.id, 'name', mt.name, 'slug', mt.slug)
          )) FILTER (WHERE jrs.id IS NOT NULL), '[]'
        ) AS required_skills
      FROM jobs j
      LEFT JOIN marketplace_categories c   ON c.id  = j.category_id
      LEFT JOIN job_required_skills   jrs  ON jrs.job_id = j.id
      LEFT JOIN marketplace_tags      mt   ON mt.id = jrs.tag_id
      WHERE j.id = $1
      GROUP BY j.id, c.id`;
    const { rows } = await pool.query(sql, [id]);
    return ok(rows[0]);
  } catch (err) { return fail(err); }
}

/**
 * Paginated job listings for a specific client.
 * @param {string} clientId
 * @param {{ status?: string, page?: number, limit?: number }} filters
 */
async function getJobsByClient(clientId, filters = {}) {
  try {
    const { status, page = 1, limit = 10 } = filters;
    const offset = (page - 1) * limit;
    const params = [clientId];
    let whereClause = 'WHERE j.client_id = $1';

    if (status) {
      params.push(status);
      whereClause += ` AND j.status = $${params.length}`;
    }

    const countRes = await pool.query(
      `SELECT COUNT(*) AS total FROM jobs j ${whereClause}`, params
    );
    const count = parseInt(countRes.rows[0].total, 10);

    params.push(limit, offset);
    const sql = `
      SELECT
        j.*,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object(
            'tag', json_build_object('id', mt.id, 'name', mt.name, 'slug', mt.slug)
          )) FILTER (WHERE jrs.id IS NOT NULL), '[]'
        ) AS required_skills
      FROM jobs j
      LEFT JOIN job_required_skills jrs ON jrs.job_id = j.id
      LEFT JOIN marketplace_tags    mt  ON mt.id = jrs.tag_id
      ${whereClause}
      GROUP BY j.id
      ORDER BY j.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}`;
    const { rows } = await pool.query(sql, params);
    return { data: rows, error: null, count };
  } catch (err) { return { data: null, error: err, count: 0 }; }
}

/**
 * Paginated marketplace browse — open jobs only by default.
 * @param {{ status?, category_id?, project_type?, budget_min?, budget_max?, page?, limit? }} filters
 */
async function getAllJobs(filters = {}) {
  try {
    const {
      status       = 'open',
      category_id,
      project_type,
      budget_min,
      budget_max,
      page  = 1,
      limit = 10,
    } = filters;

    const offset = (page - 1) * limit;
    const params = [status];
    const conditions = ['j.status = $1'];

    if (category_id)  { params.push(category_id);  conditions.push(`j.category_id  = $${params.length}`); }
    if (project_type) { params.push(project_type); conditions.push(`j.project_type = $${params.length}`); }
    if (budget_min)   { params.push(budget_min);   conditions.push(`j.budget_max  >= $${params.length}`); }
    if (budget_max)   { params.push(budget_max);   conditions.push(`j.budget_min  <= $${params.length}`); }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const countRes = await pool.query(
      `SELECT COUNT(*) AS total FROM jobs j ${where}`, params
    );
    const count = parseInt(countRes.rows[0].total, 10);

    params.push(limit, offset);
    const sql = `
      SELECT
        j.id, j.title, j.description, j.project_type,
        j.budget_min, j.budget_max, j.duration_label,
        j.experience_level, j.status, j.bids_count, j.created_at,
        json_build_object('id', c.id, 'name', c.name, 'slug', c.slug) AS category,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object(
            'tag', json_build_object('id', mt.id, 'name', mt.name, 'slug', mt.slug)
          )) FILTER (WHERE jrs.id IS NOT NULL), '[]'
        ) AS required_skills
      FROM jobs j
      LEFT JOIN marketplace_categories c   ON c.id  = j.category_id
      LEFT JOIN job_required_skills   jrs  ON jrs.job_id = j.id
      LEFT JOIN marketplace_tags      mt   ON mt.id = jrs.tag_id
      ${where}
      GROUP BY j.id, c.id
      ORDER BY j.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}`;
    const { rows } = await pool.query(sql, params);
    return { data: rows, error: null, count };
  } catch (err) { return { data: null, error: err, count: 0 }; }
}

/**
 * Partial update of a job record.
 * @param {string} id
 * @param {Object} updates
 */
async function updateJob(id, updates) {
  try {
    const allowed = [
      'title', 'description', 'category_id', 'project_type',
      'budget_min', 'budget_max', 'duration_label', 'experience_level',
      'status', 'expires_at', 'is_verified',
    ];
    const fields = Object.keys(updates).filter((k) => allowed.includes(k));
    if (fields.length === 0) return ok(null);

    const setClauses = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values     = [...fields.map((f) => updates[f]), id];

    const sql = `UPDATE jobs SET ${setClauses}, updated_at = NOW() WHERE id = $${values.length} RETURNING *`;
    const { rows } = await pool.query(sql, values);
    return ok(rows[0]);
  } catch (err) { return fail(err); }
}

/**
 * Update only the status field of a job.
 * @param {string} id
 * @param {string} status - job_status enum value
 */
async function updateJobStatus(id, status) {
  try {
    const sql = `UPDATE jobs SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, status`;
    const { rows } = await pool.query(sql, [status, id]);
    return ok(rows[0]);
  } catch (err) { return fail(err); }
}

// ─── JOB REQUIRED SKILLS ─────────────────────────────────────────────────────

/**
 * Bulk insert skill tags for a job.
 * @param {string}   jobId
 * @param {Array<{ tag_id: string, level?: string }>} skills
 */
async function addRequiredSkillsToJob(jobId, skills) {
  try {
    if (!skills || skills.length === 0) return { data: [], error: null };
    const rows = [];
    for (const s of skills) {
      const res = await pool.query(
        `INSERT INTO job_required_skills (job_id, tag_id, level)
         VALUES ($1, $2, $3)
         ON CONFLICT (job_id, tag_id) DO NOTHING
         RETURNING *`,
        [jobId, s.tag_id, s.level || null]
      );
      if (res.rows[0]) rows.push(res.rows[0]);
    }
    return { data: rows, error: null };
  } catch (err) { return fail(err); }
}

/**
 * Remove a single skill tag from a job.
 * @param {string} jobId
 * @param {string} tagId
 */
async function removeRequiredSkillFromJob(jobId, tagId) {
  try {
    const sql = `DELETE FROM job_required_skills WHERE job_id = $1 AND tag_id = $2`;
    await pool.query(sql, [jobId, tagId]);
    return { data: null, error: null };
  } catch (err) { return fail(err); }
}

// ─── SEARCH ──────────────────────────────────────────────────────────────────

/**
 * Full-text search on jobs using ILIKE on title + description.
 * Combined with optional filters.
 * @param {string} query
 * @param {{ category_id?, project_type?, budget_min?, budget_max?, page?, limit? }} filters
 */
async function searchJobs(query, filters = {}) {
  try {
    const {
      category_id,
      project_type,
      budget_min,
      budget_max,
      page  = 1,
      limit = 10,
    } = filters;

    const offset = (page - 1) * limit;
    const params = [`%${query}%`, `%${query}%`];
    const conditions = [
      `j.status = 'open'`,
      `(j.title ILIKE $1 OR j.description ILIKE $2)`,
    ];

    if (category_id)  { params.push(category_id);  conditions.push(`j.category_id  = $${params.length}`); }
    if (project_type) { params.push(project_type); conditions.push(`j.project_type = $${params.length}`); }
    if (budget_min)   { params.push(budget_min);   conditions.push(`j.budget_max  >= $${params.length}`); }
    if (budget_max)   { params.push(budget_max);   conditions.push(`j.budget_min  <= $${params.length}`); }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const countRes = await pool.query(
      `SELECT COUNT(*) AS total FROM jobs j ${where}`, params
    );
    const count = parseInt(countRes.rows[0].total, 10);

    params.push(limit, offset);
    const sql = `
      SELECT
        j.id, j.title, j.description, j.project_type,
        j.budget_min, j.budget_max, j.duration_label,
        j.status, j.bids_count, j.created_at,
        json_build_object('id', c.id, 'name', c.name, 'slug', c.slug) AS category,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object(
            'tag', json_build_object('id', mt.id, 'name', mt.name, 'slug', mt.slug)
          )) FILTER (WHERE jrs.id IS NOT NULL), '[]'
        ) AS required_skills
      FROM jobs j
      LEFT JOIN marketplace_categories c   ON c.id  = j.category_id
      LEFT JOIN job_required_skills   jrs  ON jrs.job_id = j.id
      LEFT JOIN marketplace_tags      mt   ON mt.id = jrs.tag_id
      ${where}
      GROUP BY j.id, c.id
      ORDER BY j.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}`;
    const { rows } = await pool.query(sql, params);
    return { data: rows, error: null, count };
  } catch (err) { return { data: null, error: err, count: 0 }; }
}

module.exports = {
  createJob,
  getJobById,
  getJobsByClient,
  getAllJobs,
  updateJob,
  updateJobStatus,
  addRequiredSkillsToJob,
  removeRequiredSkillFromJob,
  searchJobs,
};
