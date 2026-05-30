'use strict';

/**
 * CategoryService.js — Application Layer
 * Business logic for marketplace categories and tags.
 * Calls repositories only — never imports supabaseClient directly.
 */

const categoryRepo = require('../dataAccess/categoryRepository');
const {
  ValidationError,
  NotFoundError,
  ConflictError,
} = require('../../middleware/errorHandler');

// ─── HELPERS ──────────────────────────────────────────────────────────────────

/**
 * Converts a flat array of category rows into a nested tree.
 * Each node: { id, name, slug, description, icon_url, sort_order, is_active, children[] }
 *
 * @param {Object[]} flat - Flat category rows from DB
 * @returns {Object[]}    - Root-level nodes with nested children
 */
function buildCategoryTree(flat) {
  const map = {};
  const roots = [];

  // Index all nodes and flatten job counts
  for (const node of flat) {
    const jobsCount = node.jobs?.[0]?.count || 0;
    map[node.id] = { ...node, jobs_count: jobsCount, children: [] };
    delete map[node.id].jobs; // Clean up the raw jobs count array
  }

  // Link children to parents
  for (const node of flat) {
    if (node.parent_id && map[node.parent_id]) {
      map[node.parent_id].children.push(map[node.id]);
    } else {
      roots.push(map[node.id]);
    }
  }

  return roots;
}

/**
 * Validate category input fields.
 * @param {Object} data
 * @param {boolean} isCreate - true = all required fields enforced
 * @throws {ValidationError}
 */
function validateCategoryFields(data, isCreate = false) {
  const errors = [];

  if (isCreate || data.name !== undefined) {
    if (!data.name || data.name.trim().length === 0) {
      errors.push({ field: 'name', message: 'Category name is required' });
    } else if (data.name.length > 100) {
      errors.push({ field: 'name', message: 'Name must not exceed 100 characters' });
    }
  }

  if (isCreate || data.slug !== undefined) {
    if (!data.slug || data.slug.trim().length === 0) {
      errors.push({ field: 'slug', message: 'Slug is required' });
    } else if (!/^[a-z0-9-]+$/.test(data.slug)) {
      errors.push({ field: 'slug', message: 'Slug must contain only lowercase letters, numbers, and hyphens' });
    } else if (data.slug.length > 100) {
      errors.push({ field: 'slug', message: 'Slug must not exceed 100 characters' });
    }
  }

  if (data.sort_order !== undefined && (isNaN(data.sort_order) || data.sort_order < 0)) {
    errors.push({ field: 'sort_order', message: 'sort_order must be a non-negative integer' });
  }

  if (errors.length > 0) throw new ValidationError('Category validation failed', errors);
}

// ─── SERVICE METHODS ──────────────────────────────────────────────────────────

/**
 * Get all categories as a nested tree.
 * Active and inactive categories are included (admin-visible full tree).
 *
 * @returns {Promise<Object[]>} - Nested category tree
 */
async function getAllCategories() {
  const { data, error } = await categoryRepo.getCategoryTree();
  if (error) throw new Error(`Failed to fetch categories: ${error.message}`);
  return buildCategoryTree(data || []);
}

/**
 * Get a single category by ID.
 *
 * @param {string} id
 * @returns {Promise<Object>}
 * @throws {NotFoundError}
 */
async function getCategoryById(id) {
  const { data, error } = await categoryRepo.getCategoryById(id);
  if (error || !data) throw new NotFoundError('Category');
  return data;
}

/**
 * Create a new category. Admin-only — role check is enforced in the route.
 *
 * @param {string} adminId  - Authenticated admin user ID
 * @param {Object} data     - { name, slug, description?, icon_url?, parent_id?, sort_order? }
 * @returns {Promise<Object>} - Created category
 * @throws {ValidationError}
 * @throws {NotFoundError}   - If parent_id does not exist
 * @throws {ConflictError}   - If slug already exists
 */
async function createCategory(adminId, data) {
  validateCategoryFields(data, true);

  // Verify parent exists if provided
  if (data.parent_id) {
    const { data: parent } = await categoryRepo.getCategoryById(data.parent_id);
    if (!parent) throw new NotFoundError('Parent category');
  }

  // Check slug uniqueness
  const { data: existing } = await categoryRepo.getCategoryBySlug(data.slug);
  if (existing) throw new ConflictError(`Slug '${data.slug}' is already in use`);

  const { data: created, error } = await categoryRepo.createCategory({
    name:        data.name.trim(),
    slug:        data.slug.trim(),
    description: data.description?.trim() || null,
    icon_url:    data.icon_url    || null,
    parent_id:   data.parent_id   || null,
    sort_order:  data.sort_order  ?? 0,
    is_active:   true,
  });

  if (error) throw new Error(`Failed to create category: ${error.message}`);
  return created;
}

/**
 * Update an existing category. Admin-only.
 *
 * @param {string} id
 * @param {string} adminId
 * @param {Object} updates  - Partial category fields
 * @returns {Promise<Object>} - Updated category
 * @throws {NotFoundError}
 * @throws {ValidationError}
 * @throws {ConflictError}   - If new slug conflicts with another category
 */
async function updateCategory(id, adminId, updates) {
  // Verify category exists
  const { data: existing } = await categoryRepo.getCategoryById(id);
  if (!existing) throw new NotFoundError('Category');

  validateCategoryFields(updates, false);

  // If slug is changing, verify uniqueness
  if (updates.slug && updates.slug !== existing.slug) {
    const { data: slugConflict } = await categoryRepo.getCategoryBySlug(updates.slug);
    if (slugConflict) throw new ConflictError(`Slug '${updates.slug}' is already in use`);
  }

  // If parent is changing, verify parent exists and prevent circular reference
  if (updates.parent_id) {
    if (updates.parent_id === id) {
      throw new ValidationError('Category validation failed', [
        { field: 'parent_id', message: 'A category cannot be its own parent' },
      ]);
    }
    const { data: parent } = await categoryRepo.getCategoryById(updates.parent_id);
    if (!parent) throw new NotFoundError('Parent category');
  }

  const { data: updated, error } = await categoryRepo.updateCategory(id, updates);
  if (error) throw new Error(`Failed to update category: ${error.message}`);
  return updated;
}

/**
 * Get all marketplace tags, optionally filtered by is_verified.
 *
 * @param {{ is_verified?: boolean }} filters
 * @returns {Promise<Object[]>}
 */
async function getAllTags(filters = {}) {
  const { data, error } = await categoryRepo.getAllTags(filters);
  if (error) throw new Error(`Failed to fetch tags: ${error.message}`);
  return data || [];
}

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  getAllTags,
};
