'use strict';

/**
 * SearchFilterService.js — Application Layer
 * Full-text and filtered search across jobs and gigs.
 * Calls repositories only — never imports supabaseClient directly.
 */

const jobRepo      = require('../dataAccess/jobRepository');
const gigRepo      = require('../dataAccess/gigRepository');
const categoryRepo = require('../dataAccess/categoryRepository');
const { ValidationError } = require('../../middleware/errorHandler');

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const VALID_JOB_SORTS = ['newest', 'budget_asc', 'budget_desc', 'deadline_asc'];
const VALID_GIG_SORTS = ['newest', 'rating_desc', 'price_asc', 'price_desc', 'orders_desc'];

/**
 * Normalise and validate pagination params.
 * @param {Object} pagination
 * @returns {{ page: number, limit: number }}
 */
function normalisePagination(pagination = {}) {
  const page  = Math.max(1, parseInt(pagination.page,  10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(pagination.limit, 10) || 20));
  return { page, limit };
}

/**
 * Sanitise a search query string — strip empty / too-short queries.
 * @param {string|undefined} query
 * @returns {string|null}
 */
function sanitiseQuery(query) {
  if (!query || typeof query !== 'string') return null;
  const q = query.trim();
  return q.length >= 2 ? q : null;
}

/**
 * Validate job-specific filter values.
 * @param {Object} filters
 * @throws {ValidationError}
 */
function validateJobFilters(filters) {
  const errors = [];

  if (filters.budget_min !== undefined && isNaN(Number(filters.budget_min))) {
    errors.push({ field: 'budget_min', message: 'budget_min must be a number' });
  }
  if (filters.budget_max !== undefined && isNaN(Number(filters.budget_max))) {
    errors.push({ field: 'budget_max', message: 'budget_max must be a number' });
  }
  if (filters.sort && !VALID_JOB_SORTS.includes(filters.sort)) {
    errors.push({ field: 'sort', message: `sort must be one of: ${VALID_JOB_SORTS.join(', ')}` });
  }

  if (errors.length > 0) throw new ValidationError('Invalid search filters', errors);
}

/**
 * Validate gig-specific filter values.
 * @param {Object} filters
 * @throws {ValidationError}
 */
function validateGigFilters(filters) {
  const errors = [];

  if (filters.min_rating !== undefined) {
    const r = Number(filters.min_rating);
    if (isNaN(r) || r < 0 || r > 5) {
      errors.push({ field: 'min_rating', message: 'min_rating must be between 0 and 5' });
    }
  }
  if (filters.max_delivery_days !== undefined && isNaN(Number(filters.max_delivery_days))) {
    errors.push({ field: 'max_delivery_days', message: 'max_delivery_days must be a number' });
  }
  if (filters.price_min !== undefined && isNaN(Number(filters.price_min))) {
    errors.push({ field: 'price_min', message: 'price_min must be a number' });
  }
  if (filters.price_max !== undefined && isNaN(Number(filters.price_max))) {
    errors.push({ field: 'price_max', message: 'price_max must be a number' });
  }
  if (filters.sort && !VALID_GIG_SORTS.includes(filters.sort)) {
    errors.push({ field: 'sort', message: `sort must be one of: ${VALID_GIG_SORTS.join(', ')}` });
  }

  if (errors.length > 0) throw new ValidationError('Invalid gig filters', errors);
}

/**
 * Build the repository-layer filter object for jobs.
 * Maps service-level filter names to repo-level names.
 * @param {Object} filters
 * @param {{ page: number, limit: number }} pagination
 */
function buildJobRepoFilters(filters, pagination) {
  return {
    status:       filters.status || 'open',
    category_id:  filters.category_id  || undefined,
    project_type: filters.project_type || undefined,
    budget_min:   filters.budget_min   !== undefined ? Number(filters.budget_min)  : undefined,
    budget_max:   filters.budget_max   !== undefined ? Number(filters.budget_max)  : undefined,
    page:         pagination.page,
    limit:        pagination.limit,
  };
}

/**
 * Build the repository-layer filter object for gigs.
 * @param {Object} filters
 * @param {{ page: number, limit: number }} pagination
 */
function buildGigRepoFilters(filters, pagination) {
  return {
    q:                 filters.q || undefined,
    category_id:       filters.category_id || undefined,
    min_rating:        filters.min_rating !== undefined ? Number(filters.min_rating) : undefined,
    max_delivery_days: filters.max_delivery_days !== undefined ? Number(filters.max_delivery_days) : undefined,
    price_min:         filters.price_min !== undefined ? Number(filters.price_min) : undefined,
    price_max:         filters.price_max !== undefined ? Number(filters.price_max) : undefined,
    is_featured:       filters.is_featured !== undefined ? filters.is_featured === true || filters.is_featured === 'true' : undefined,
    sort:              filters.sort || 'newest',
    page:              pagination.page,
    limit:             pagination.limit,
  };
}

// ─── SERVICE METHODS ──────────────────────────────────────────────────────────

/**
 * Search and filter job listings.
 *
 * @param {string|undefined} query       - Free-text search string (searches title + description)
 * @param {Object}           filters     - { status?, category_id?, project_type?,
 *                                          budget_min?, budget_max?, sort? }
 * @param {Object}           pagination  - { page?, limit? }
 * @returns {Promise<{ data: Object[], pagination: Object }>}
 * @throws {ValidationError} - On invalid filter values
 */
async function searchJobs(query, filters = {}, pagination = {}) {
  validateJobFilters(filters);

  const { page, limit } = normalisePagination(pagination);
  const q = sanitiseQuery(query);
  const repoFilters = buildJobRepoFilters(filters, { page, limit });

  let result;
  if (q) {
    result = await jobRepo.searchJobs(q, repoFilters);
  } else {
    result = await jobRepo.getAllJobs(repoFilters);
  }

  const { data, error, count } = result;
  if (error) throw new Error(`Job search failed: ${error.message}`);

  return {
    data: data || [],
    pagination: {
      page,
      limit,
      total:      count || 0,
      totalPages: Math.ceil((count || 0) / limit),
      query:      q || null,
    },
  };
}

/**
 * Search and filter gig listings.
 *
 * @param {string|undefined} query       - Free-text search string
 * @param {Object}           filters     - { category_id?, min_rating?, max_delivery_days?,
 *                                          price_min?, price_max?, is_featured?, sort? }
 * @param {Object}           pagination  - { page?, limit? }
 * @returns {Promise<{ data: Object[], pagination: Object }>}
 * @throws {ValidationError}
 */
async function searchGigs(query, filters = {}, pagination = {}) {
  validateGigFilters(filters);

  const { page, limit } = normalisePagination(pagination);
  const q = sanitiseQuery(query);
  const repoFilters = buildGigRepoFilters(filters, { page, limit });

  let result;
  if (q) {
    result = await gigRepo.searchGigs(q, repoFilters);
  } else {
    result = await gigRepo.getAllGigs(repoFilters);
  }

  const { data, error, count } = result;
  if (error) throw new Error(`Gig search failed: ${error.message}`);

  return {
    data: data || [],
    pagination: {
      page,
      limit,
      total:      count || 0,
      totalPages: Math.ceil((count || 0) / limit),
      query:      q || null,
    },
  };
}

/**
 * Search jobs and gigs concurrently and return combined results.
 *
 * @param {string|undefined} query
 * @param {Object}           filters    - Applied to both jobs and gigs where applicable
 * @param {Object}           pagination
 * @returns {Promise<{ jobs: { data, total }, gigs: { data, total } }>}
 */
async function searchAll(query, filters = {}, pagination = {}) {
  const [jobResults, gigResults] = await Promise.all([
    searchJobs(query, filters, pagination),
    searchGigs(query, filters, pagination),
  ]);

  return {
    jobs: {
      data:  jobResults.data,
      total: jobResults.pagination.total,
    },
    gigs: {
      data:  gigResults.data,
      total: gigResults.pagination.total,
    },
    query: sanitiseQuery(query),
  };
}

/**
 * Get all marketplace tags, optionally filtered by verified status.
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
  searchJobs,
  searchGigs,
  searchAll,
  getAllTags,
};
