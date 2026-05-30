'use strict';

/**
 * gigRepository.js — Data Access Layer (local PostgreSQL)
 * All queries against gigs, gig_pricing_tiers, gig_portfolio_samples,
 * and gig_required_skills tables.
 */

const pool = require('../../config/pgClient');

function ok(row)   { return { data: row  || null, error: null }; }
function fail(err) { return { data: null, error: err };          }

// ─── helper: aggregate nested JSON from multiple query rows ──────────────────

/**
 * Build the rich gig object that joins pricing_tiers, portfolio_samples
 * and required_skills in one query using JSON aggregation.
 */
const GIG_FULL_SQL = `
  SELECT
    g.*,
    json_build_object('id', c.id, 'name', c.name, 'slug', c.slug) AS category,
    COALESCE(
      json_agg(DISTINCT jsonb_build_object(
        'id', pt.id, 'tier', pt.tier, 'package_name', pt.package_name,
        'description', pt.description, 'price', pt.price,
        'delivery_days', pt.delivery_days, 'revisions', pt.revisions,
        'deliverables', pt.deliverables
      )) FILTER (WHERE pt.id IS NOT NULL), '[]'
    ) AS pricing_tiers,
    COALESCE(
      json_agg(DISTINCT jsonb_build_object(
        'id', ps.id, 'title', ps.title, 'file_url', ps.file_url,
        'file_type', ps.file_type, 'sort_order', ps.sort_order
      )) FILTER (WHERE ps.id IS NOT NULL), '[]'
    ) AS portfolio_samples,
    COALESCE(
      json_agg(DISTINCT jsonb_build_object(
        'id', grs.id,
        'tag', json_build_object('id', mt.id, 'name', mt.name, 'slug', mt.slug, 'is_verified', mt.is_verified)
      )) FILTER (WHERE grs.id IS NOT NULL), '[]'
    ) AS required_skills
  FROM gigs g
  LEFT JOIN marketplace_categories c  ON c.id  = g.category_id
  LEFT JOIN gig_pricing_tiers     pt  ON pt.gig_id = g.id
  LEFT JOIN gig_portfolio_samples ps  ON ps.gig_id = g.id
  LEFT JOIN gig_required_skills   grs ON grs.gig_id = g.id
  LEFT JOIN marketplace_tags      mt  ON mt.id = grs.tag_id
`;

async function createGig(gigData) {
  try {
    const { freelancer_id, category_id, title, description, thumbnail_url, status = 'draft' } = gigData;
    const sql = `
      INSERT INTO gigs (freelancer_id, category_id, title, description, thumbnail_url, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`;
    const { rows } = await pool.query(sql, [
      freelancer_id, category_id || null, title, description, thumbnail_url || null, status,
    ]);
    return ok(rows[0]);
  } catch (err) { return fail(err); }
}

async function getGigById(id) {
  try {
    const sql = `${GIG_FULL_SQL} WHERE g.id = $1 GROUP BY g.id, c.id`;
    const { rows } = await pool.query(sql, [id]);
    return ok(rows[0]);
  } catch (err) { return fail(err); }
}

async function getGigsByFreelancer(freelancerId, filters = {}) {
  try {
    const { status, page = 1, limit = 10 } = filters;
    const offset = (page - 1) * limit;
    const params = [freelancerId];
    let where = 'WHERE g.freelancer_id = $1';

    if (status) {
      params.push(status);
      where += ` AND g.status = $${params.length}`;
    }

    const countRes = await pool.query(
      `SELECT COUNT(*) AS total FROM gigs g ${where}`, params
    );
    const count = parseInt(countRes.rows[0].total, 10);

    params.push(limit, offset);
    const sql = `
      SELECT g.id, g.title, g.status, g.avg_rating, g.review_count,
             g.orders_count, g.thumbnail_url, g.created_at,
             COALESCE(json_agg(json_build_object('tier', pt.tier, 'price', pt.price))
               FILTER (WHERE pt.id IS NOT NULL), '[]') AS pricing_tiers
      FROM gigs g
      LEFT JOIN gig_pricing_tiers pt ON pt.gig_id = g.id
      ${where}
      GROUP BY g.id
      ORDER BY g.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}`;
    const { rows } = await pool.query(sql, params);
    return { data: rows, error: null, count };
  } catch (err) { return { data: null, error: err, count: 0 }; }
}

async function getAllGigs(filters = {}) {
  try {
    const {
      q, category_id, is_featured, min_rating, max_delivery_days,
      price_min, price_max, sort = 'newest', page = 1, limit = 10,
    } = filters;
    const offset = (page - 1) * limit;
    const params = [];
    const conditions = [`g.status = 'live'`];

    if (q) {
      params.push(`%${q}%`, `%${q}%`);
      conditions.push(`(
        g.title ILIKE $${params.length - 1}
        OR g.description ILIKE $${params.length}
        OR c.name ILIKE $${params.length - 1}
        OR mt.name ILIKE $${params.length - 1}
      )`);
    }
    if (category_id) { params.push(category_id); conditions.push(`g.category_id = $${params.length}`); }
    if (is_featured !== undefined) { params.push(is_featured); conditions.push(`g.is_featured = $${params.length}`); }
    if (min_rating)  { params.push(min_rating);  conditions.push(`g.avg_rating >= $${params.length}`); }
    if (max_delivery_days) { params.push(max_delivery_days); conditions.push(`pt.delivery_days <= $${params.length}`); }
    if (price_min) { params.push(price_min); conditions.push(`pt.price >= $${params.length}`); }
    if (price_max) { params.push(price_max); conditions.push(`pt.price <= $${params.length}`); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count
    const countRes = await pool.query(
      `SELECT COUNT(DISTINCT g.id) AS total
       FROM gigs g
       LEFT JOIN marketplace_categories c ON c.id = g.category_id
       LEFT JOIN gig_pricing_tiers pt ON pt.gig_id = g.id
       LEFT JOIN gig_required_skills grs ON grs.gig_id = g.id
       LEFT JOIN marketplace_tags mt ON mt.id = grs.tag_id
       ${where}`, params
    );
    const count = parseInt(countRes.rows[0].total, 10);

    let orderBy;
    if (sort === 'newest') orderBy = 'g.created_at DESC';
    else if (sort === 'rating_desc') orderBy = 'g.avg_rating DESC';
    else if (sort === 'price_asc') orderBy = 'MIN(pt.price) ASC NULLS LAST';
    else if (sort === 'price_desc') orderBy = 'MIN(pt.price) DESC NULLS LAST';
    else if (sort === 'orders_desc') orderBy = 'g.orders_count DESC';
    else orderBy = 'g.is_featured DESC, g.avg_rating DESC';

    params.push(limit, offset);
    const sql = `
      SELECT
        g.id, g.title, g.thumbnail_url, g.avg_rating, g.review_count,
        g.orders_count, g.is_featured, g.freelancer_id, g.created_at,
        json_build_object('id', c.id, 'name', c.name, 'slug', c.slug) AS category,
        COALESCE(json_agg(DISTINCT jsonb_build_object('tier', pt.tier, 'price', pt.price, 'delivery_days', pt.delivery_days))
          FILTER (WHERE pt.id IS NOT NULL), '[]') AS pricing_tiers,
        COALESCE(json_agg(DISTINCT jsonb_build_object(
          'tag', json_build_object('id', mt.id, 'name', mt.name, 'slug', mt.slug)))
          FILTER (WHERE grs.id IS NOT NULL), '[]') AS required_skills
      FROM gigs g
      LEFT JOIN marketplace_categories c  ON c.id  = g.category_id
      LEFT JOIN gig_pricing_tiers     pt  ON pt.gig_id = g.id
      LEFT JOIN gig_required_skills   grs ON grs.gig_id = g.id
      LEFT JOIN marketplace_tags      mt  ON mt.id = grs.tag_id
      ${where}
      GROUP BY g.id, c.id
      ORDER BY ${orderBy}
      LIMIT $${params.length - 1} OFFSET $${params.length}`;
    const { rows } = await pool.query(sql, params);
    return { data: rows, error: null, count };
  } catch (err) { return { data: null, error: err, count: 0 }; }
}

async function updateGig(id, updates) {
  try {
    const allowed = ['category_id', 'title', 'description', 'thumbnail_url', 'status', 'is_featured'];
    const fields  = Object.keys(updates).filter((k) => allowed.includes(k));
    if (fields.length === 0) return ok(null);

    const setClauses = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values     = [...fields.map((f) => updates[f]), id];

    const sql = `UPDATE gigs SET ${setClauses}, updated_at = NOW() WHERE id = $${values.length} RETURNING *`;
    const { rows } = await pool.query(sql, values);
    return ok(rows[0]);
  } catch (err) { return fail(err); }
}

async function deactivateGig(id) {
  try {
    const sql = `UPDATE gigs SET status = 'paused', updated_at = NOW() WHERE id = $1 RETURNING id, status`;
    const { rows } = await pool.query(sql, [id]);
    return ok(rows[0]);
  } catch (err) { return fail(err); }
}

async function countActiveGigsByFreelancer(freelancerId) {
  try {
    const sql = `SELECT COUNT(*) AS total FROM gigs WHERE freelancer_id = $1 AND status = 'live'`;
    const { rows } = await pool.query(sql, [freelancerId]);
    return { data: null, error: null, count: parseInt(rows[0].total, 10) };
  } catch (err) { return { data: null, error: err, count: 0 }; }
}

async function addPricingTier(gigId, tierData) {
  try {
    const { tier, package_name, description, price, delivery_days, revisions, deliverables } = tierData;
    const sql = `
      INSERT INTO gig_pricing_tiers (gig_id, tier, package_name, description, price, delivery_days, revisions, deliverables)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (gig_id, tier) DO UPDATE SET
        package_name  = EXCLUDED.package_name,
        description   = EXCLUDED.description,
        price         = EXCLUDED.price,
        delivery_days = EXCLUDED.delivery_days,
        revisions     = EXCLUDED.revisions,
        deliverables  = EXCLUDED.deliverables
      RETURNING *`;
    const { rows } = await pool.query(sql, [
      gigId, tier,
      package_name  || null,
      description   || null,
      price,
      delivery_days,
      revisions     || '1',
      deliverables  || null,
    ]);
    return ok(rows[0]);
  } catch (err) { return fail(err); }
}

async function addPortfolioSample(gigId, sampleData) {
  try {
    const { title, file_url, file_type, sort_order } = sampleData;
    const sql = `
      INSERT INTO gig_portfolio_samples (gig_id, title, file_url, file_type, sort_order)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *`;
    const { rows } = await pool.query(sql, [
      gigId, title || null, file_url, file_type || null, sort_order || 0,
    ]);
    return ok(rows[0]);
  } catch (err) { return fail(err); }
}

async function addRequiredTag(gigId, tagId) {
  try {
    const sql = `
      INSERT INTO gig_required_skills (gig_id, tag_id) VALUES ($1, $2)
      ON CONFLICT (gig_id, tag_id) DO NOTHING
      RETURNING *`;
    const { rows } = await pool.query(sql, [gigId, tagId]);
    return ok(rows[0]);
  } catch (err) { return fail(err); }
}

async function searchGigs(query, filters = {}) {
  try {
    const { category_id, min_rating, max_delivery_days, price_min, price_max, sort = 'rating_desc', page = 1, limit = 10 } = filters;
    const offset = (page - 1) * limit;
    const params = [`%${query}%`, `%${query}%`];
    const conditions = [`g.status = 'live'`, `(
      g.title ILIKE $1
      OR g.description ILIKE $2
      OR c.name ILIKE $1
      OR mt.name ILIKE $1
    )`];

    if (category_id) { params.push(category_id); conditions.push(`g.category_id = $${params.length}`); }
    if (min_rating)  { params.push(min_rating);  conditions.push(`g.avg_rating >= $${params.length}`); }
    if (max_delivery_days) { params.push(max_delivery_days); conditions.push(`pt.delivery_days <= $${params.length}`); }
    if (price_min) { params.push(price_min); conditions.push(`pt.price >= $${params.length}`); }
    if (price_max) { params.push(price_max); conditions.push(`pt.price <= $${params.length}`); }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const countRes = await pool.query(
      `SELECT COUNT(DISTINCT g.id) AS total
       FROM gigs g
       LEFT JOIN marketplace_categories c ON c.id = g.category_id
       LEFT JOIN gig_pricing_tiers pt ON pt.gig_id = g.id
       LEFT JOIN gig_required_skills grs ON grs.gig_id = g.id
       LEFT JOIN marketplace_tags mt ON mt.id = grs.tag_id
       ${where}`, params
    );
    const count = parseInt(countRes.rows[0].total, 10);

    let orderBy;
    if (sort === 'newest') orderBy = 'g.created_at DESC';
    else if (sort === 'price_asc') orderBy = 'MIN(pt.price) ASC NULLS LAST';
    else if (sort === 'price_desc') orderBy = 'MIN(pt.price) DESC NULLS LAST';
    else if (sort === 'orders_desc') orderBy = 'g.orders_count DESC';
    else orderBy = 'g.avg_rating DESC';

    params.push(limit, offset);
    const sql = `
      SELECT
        g.id, g.title, g.thumbnail_url, g.avg_rating, g.review_count,
        g.orders_count, g.freelancer_id,
        json_build_object('id', c.id, 'name', c.name, 'slug', c.slug) AS category,
        COALESCE(json_agg(DISTINCT jsonb_build_object('tier', pt.tier, 'price', pt.price, 'delivery_days', pt.delivery_days))
          FILTER (WHERE pt.id IS NOT NULL), '[]') AS pricing_tiers,
        COALESCE(json_agg(DISTINCT jsonb_build_object(
          'tag', json_build_object('id', mt.id, 'name', mt.name, 'slug', mt.slug)))
          FILTER (WHERE grs.id IS NOT NULL), '[]') AS required_skills
      FROM gigs g
      LEFT JOIN marketplace_categories c  ON c.id  = g.category_id
      LEFT JOIN gig_pricing_tiers     pt  ON pt.gig_id = g.id
      LEFT JOIN gig_required_skills   grs ON grs.gig_id = g.id
      LEFT JOIN marketplace_tags      mt  ON mt.id = grs.tag_id
      ${where}
      GROUP BY g.id, c.id
      ORDER BY ${orderBy}
      LIMIT $${params.length - 1} OFFSET $${params.length}`;
    const { rows } = await pool.query(sql, params);
    return { data: rows, error: null, count };
  } catch (err) { return { data: null, error: err, count: 0 }; }
}

module.exports = {
  createGig, getGigById, getGigsByFreelancer, getAllGigs,
  updateGig, deactivateGig, countActiveGigsByFreelancer,
  addPricingTier, addPortfolioSample, addRequiredTag, searchGigs,
};
