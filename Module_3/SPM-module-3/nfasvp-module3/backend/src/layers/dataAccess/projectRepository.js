'use strict';

/**
 * projectRepository.js — Data Access Layer (local PostgreSQL)
 * All queries against projects, project_milestones, project_git_repos,
 * and marketplace_notifications_log tables.
 */

const pool = require('../../config/pgClient');

function ok(row)   { return { data: row  || null, error: null }; }
function fail(err) { return { data: null, error: err };          }

// ─── PROJECTS ─────────────────────────────────────────────────────────────────

async function createProject(projectData) {
  try {
    const {
      job_id, bid_id, client_id, freelancer_id,
      title, total_amount, project_type, deadline_at,
    } = projectData;
    const sql = `
      INSERT INTO projects (job_id, bid_id, client_id, freelancer_id, title, total_amount, project_type, deadline_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`;
    const { rows } = await pool.query(sql, [
      job_id, bid_id, client_id, freelancer_id,
      title, total_amount,
      project_type || 'fixed_price',
      deadline_at  || null,
    ]);
    return ok(rows[0]);
  } catch (err) { return fail(err); }
}

async function getProjectById(id) {
  try {
    const sql = `
      SELECT
        p.*,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object(
            'id', m.id, 'title', m.title, 'description', m.description,
            'amount', m.amount, 'due_date', m.due_date, 'status', m.status,
            'sort_order', m.sort_order, 'submitted_at', m.submitted_at, 'approved_at', m.approved_at
          )) FILTER (WHERE m.id IS NOT NULL), '[]'
        ) AS milestones,
        json_agg(DISTINCT jsonb_build_object(
          'id', gr.id, 'repo_url', gr.repo_url, 'provider', gr.provider,
          'branch', gr.branch, 'is_private', gr.is_private, 'linked_at', gr.linked_at
        )) FILTER (WHERE gr.id IS NOT NULL) AS git_repo
      FROM projects p
      LEFT JOIN project_milestones m  ON m.project_id = p.id
      LEFT JOIN project_git_repos  gr ON gr.project_id = p.id
      WHERE p.id = $1
      GROUP BY p.id`;
    const { rows } = await pool.query(sql, [id]);
    // git_repo comes back as an array (aggregated); unwrap to single object or null
    if (rows[0] && rows[0].git_repo) {
      rows[0].git_repo = rows[0].git_repo[0] || null;
    }
    return ok(rows[0]);
  } catch (err) { return fail(err); }
}

async function getProjectsByClient(clientId, filters = {}) {
  try {
    const { status, page = 1, limit = 10 } = filters;
    const offset = (page - 1) * limit;
    const params = [clientId];
    let where = 'WHERE client_id = $1';

    if (status) {
      params.push(status);
      where += ` AND status = $${params.length}`;
    }

    const countRes = await pool.query(`SELECT COUNT(*) AS total FROM projects ${where}`, params);
    const count    = parseInt(countRes.rows[0].total, 10);

    params.push(limit, offset);
    const sql = `
      SELECT id, title, status, total_amount, project_type, started_at, deadline_at, freelancer_id
      FROM projects
      ${where}
      ORDER BY created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}`;
    const { rows } = await pool.query(sql, params);
    return { data: rows, error: null, count };
  } catch (err) { return { data: null, error: err, count: 0 }; }
}

async function getProjectsByFreelancer(freelancerId, filters = {}) {
  try {
    const { status, page = 1, limit = 10 } = filters;
    const offset = (page - 1) * limit;
    const params = [freelancerId];
    let where = 'WHERE freelancer_id = $1';

    if (status) {
      params.push(status);
      where += ` AND status = $${params.length}`;
    }

    const countRes = await pool.query(`SELECT COUNT(*) AS total FROM projects ${where}`, params);
    const count    = parseInt(countRes.rows[0].total, 10);

    params.push(limit, offset);
    const sql = `
      SELECT id, title, status, total_amount, project_type, started_at, deadline_at, client_id
      FROM projects
      ${where}
      ORDER BY created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}`;
    const { rows } = await pool.query(sql, params);
    return { data: rows, error: null, count };
  } catch (err) { return { data: null, error: err, count: 0 }; }
}

async function updateProjectStatus(id, status) {
  try {
    const sql = `UPDATE projects SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, status`;
    const { rows } = await pool.query(sql, [status, id]);
    return ok(rows[0]);
  } catch (err) { return fail(err); }
}

// ─── MILESTONES ───────────────────────────────────────────────────────────────

async function addMilestone(projectId, milestoneData) {
  try {
    const { title, description, amount, due_date, sort_order } = milestoneData;
    const sql = `
      INSERT INTO project_milestones (project_id, title, description, amount, due_date, sort_order)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`;
    const { rows } = await pool.query(sql, [
      projectId, title,
      description || null,
      amount,
      due_date    || null,
      sort_order  || 0,
    ]);
    return ok(rows[0]);
  } catch (err) { return fail(err); }
}

async function updateMilestoneStatus(milestoneId, status) {
  try {
    const updates  = { status };
    const extraSet = [];
    const params   = [status];

    if (status === 'submitted') { updates.submitted_at = new Date().toISOString(); params.push(updates.submitted_at); extraSet.push(`submitted_at = $${params.length}`); }
    if (status === 'approved')  { updates.approved_at  = new Date().toISOString(); params.push(updates.approved_at);  extraSet.push(`approved_at  = $${params.length}`); }

    const extra = extraSet.length ? `, ${extraSet.join(', ')}` : '';
    params.push(milestoneId);

    const sql = `
      UPDATE project_milestones
      SET status = $1${extra}, updated_at = NOW()
      WHERE id = $${params.length}
      RETURNING id, status, submitted_at, approved_at`;
    const { rows } = await pool.query(sql, params);
    return ok(rows[0]);
  } catch (err) { return fail(err); }
}

// ─── GIT REPOS ────────────────────────────────────────────────────────────────

async function linkGitRepo(projectId, repoData) {
  try {
    const { repo_url, provider, branch, is_private, linked_by } = repoData;
    const sql = `
      INSERT INTO project_git_repos (project_id, repo_url, provider, branch, is_private, linked_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (project_id) DO UPDATE SET
        repo_url   = EXCLUDED.repo_url,
        provider   = EXCLUDED.provider,
        branch     = EXCLUDED.branch,
        is_private = EXCLUDED.is_private,
        linked_by  = EXCLUDED.linked_by,
        linked_at  = NOW()
      RETURNING *`;
    const { rows } = await pool.query(sql, [
      projectId,
      repo_url,
      provider   || 'github',
      branch     || 'main',
      is_private !== undefined ? is_private : true,
      linked_by,
    ]);
    return ok(rows[0]);
  } catch (err) { return fail(err); }
}

// ─── NOTIFICATIONS LOG ────────────────────────────────────────────────────────

/**
 * Insert an entry into the marketplace_notifications_log audit table.
 * @param {Object} logData - { event_type, triggered_by, recipient_id, entity_type, entity_id, payload?, module6_sent?, module6_response? }
 */
async function logMarketplaceEvent(logData) {
  try {
    const {
      event_type, triggered_by, recipient_id,
      entity_type, entity_id, payload,
      module6_sent, module6_response,
    } = logData;
    const sql = `
      INSERT INTO marketplace_notifications_log
        (event_type, triggered_by, recipient_id, entity_type, entity_id, payload, module6_sent, module6_response)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id`;
    const { rows } = await pool.query(sql, [
      event_type, triggered_by, recipient_id,
      entity_type, entity_id,
      payload          ? JSON.stringify(payload)          : null,
      module6_sent     !== undefined ? module6_sent       : false,
      module6_response ? JSON.stringify(module6_response) : null,
    ]);
    return ok(rows[0]);
  } catch (err) { return fail(err); }
}

module.exports = {
  createProject,
  getProjectById,
  getProjectsByClient,
  getProjectsByFreelancer,
  updateProjectStatus,
  addMilestone,
  updateMilestoneStatus,
  linkGitRepo,
  logMarketplaceEvent,
};
