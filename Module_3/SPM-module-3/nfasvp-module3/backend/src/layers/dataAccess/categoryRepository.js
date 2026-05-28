'use strict';

/**
 * categoryRepository.js — Data Access Layer (local PostgreSQL)
 * All marketplace_categories and marketplace_tags queries live here.
 * Only this file (and other repositories) may import pgClient.
 */

const pool = require('../../config/pgClient');

function ok(row)      { return { data: row  || null, error: null }; }
function okMany(rows) { return { data: rows || [],   error: null }; }
function fail(err)    { return { data: null, error: err };          }

// ─── CATEGORIES ──────────────────────────────────────────────────────────────

/**
 * Fetch all active categories (flat list — caller builds tree from parent_id).
 */
async function getAllCategories() {
  try {
    const sql = `SELECT * FROM marketplace_categories WHERE is_active = true ORDER BY sort_order ASC`;
    const { rows } = await pool.query(sql);
    return okMany(rows);
  } catch (err) { return fail(err); }
}

/**
 * Fetch all categories ordered by sort_order (for tree building, includes inactive).
 * Includes count of open jobs per category.
 */
async function getCategoryTree() {
  try {
    const sql = `
      SELECT c.id, c.name, c.slug, c.description, c.icon_url,
             c.parent_id, c.is_active, c.sort_order,
             COALESCE(j.cnt, 0) AS jobs_count
      FROM marketplace_categories c
      LEFT JOIN (
        SELECT category_id, COUNT(*) AS cnt
        FROM jobs WHERE status = 'open'
        GROUP BY category_id
      ) j ON j.category_id = c.id
      ORDER BY c.sort_order ASC`;
    const { rows } = await pool.query(sql);
    return okMany(rows);
  } catch (err) { return fail(err); }
}

/**
 * Fetch a single category by primary key.
 * @param {string} id - UUID
 */
async function getCategoryById(id) {
  try {
    const sql = `SELECT * FROM marketplace_categories WHERE id = $1`;
    const { rows } = await pool.query(sql, [id]);
    return ok(rows[0]);
  } catch (err) { return fail(err); }
}

/**
 * Fetch a single category by its URL slug.
 * @param {string} slug
 */
async function getCategoryBySlug(slug) {
  try {
    const sql = `SELECT * FROM marketplace_categories WHERE slug = $1`;
    const { rows } = await pool.query(sql, [slug]);
    return ok(rows[0]);
  } catch (err) { return fail(err); }
}

/**
 * Insert a new category.
 * @param {Object} categoryData - { name, slug, description?, icon_url?, parent_id?, sort_order? }
 */
async function createCategory(categoryData) {
  try {
    const { name, slug, description, icon_url, parent_id, sort_order } = categoryData;
    const sql = `
      INSERT INTO marketplace_categories (name, slug, description, icon_url, parent_id, sort_order)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`;
    const { rows } = await pool.query(sql, [
      name, slug,
      description || null,
      icon_url    || null,
      parent_id   || null,
      sort_order  || 0,
    ]);
    return ok(rows[0]);
  } catch (err) { return fail(err); }
}

/**
 * Partially update a category.
 * @param {string} id
 * @param {Object} updates
 */
async function updateCategory(id, updates) {
  try {
    // Build dynamic SET clause
    const allowed = ['name', 'slug', 'description', 'icon_url', 'parent_id', 'sort_order', 'is_active'];
    const fields  = Object.keys(updates).filter((k) => allowed.includes(k));
    if (fields.length === 0) return ok(null);

    const setClauses = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values     = fields.map((f) => updates[f]);
    values.push(id);

    const sql = `UPDATE marketplace_categories SET ${setClauses}, updated_at = NOW() WHERE id = $${values.length} RETURNING *`;
    const { rows } = await pool.query(sql, values);
    return ok(rows[0]);
  } catch (err) { return fail(err); }
}

// ─── TAGS ────────────────────────────────────────────────────────────────────

/**
 * Fetch all marketplace tags, optionally filtered by is_verified.
 * @param {{ is_verified?: boolean }} filters
 */
async function getAllTags(filters = {}) {
  try {
    const params = [];
    let where = '';
    if (typeof filters.is_verified === 'boolean') {
      params.push(filters.is_verified);
      where = `WHERE is_verified = $1`;
    }
    const sql = `
      SELECT id, name, slug, category_id, is_verified, usage_count
      FROM marketplace_tags
      ${where}
      ORDER BY usage_count DESC`;
    const { rows } = await pool.query(sql, params);
    return okMany(rows);
  } catch (err) { return fail(err); }
}

/**
 * Fetch a single tag by ID.
 * @param {string} id
 */
async function getTagById(id) {
  try {
    const sql = `SELECT * FROM marketplace_tags WHERE id = $1`;
    const { rows } = await pool.query(sql, [id]);
    return ok(rows[0]);
  } catch (err) { return fail(err); }
}

/**
 * Insert a new tag.
 * @param {Object} tagData - { name, slug, category_id?, is_verified? }
 */
async function createTag(tagData) {
  try {
    const { name, slug, category_id, is_verified } = tagData;
    const sql = `
      INSERT INTO marketplace_tags (name, slug, category_id, is_verified)
      VALUES ($1, $2, $3, $4)
      RETURNING *`;
    const { rows } = await pool.query(sql, [
      name, slug,
      category_id  || null,
      is_verified  !== undefined ? is_verified : false,
    ]);
    return ok(rows[0]);
  } catch (err) { return fail(err); }
}

/**
 * Increment usage_count on a tag (called when a tag is added to a job/gig).
 * @param {string} id
 */
async function incrementTagUsage(id) {
  try {
    const sql = `UPDATE marketplace_tags SET usage_count = usage_count + 1 WHERE id = $1 RETURNING id, usage_count`;
    const { rows } = await pool.query(sql, [id]);
    return ok(rows[0]);
  } catch (err) { return fail(err); }
}

module.exports = {
  getAllCategories,
  getCategoryTree,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  getAllTags,
  getTagById,
  createTag,
  incrementTagUsage,
};
