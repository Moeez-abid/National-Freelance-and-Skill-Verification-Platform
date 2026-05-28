'use strict';

/**
 * GigListingService.js — Application Layer
 * All business logic for gig listing lifecycle.
 * Calls repositories only — never imports supabaseClient directly.
 */

const gigRepo      = require('../dataAccess/gigRepository');
const categoryRepo = require('../dataAccess/categoryRepository');
const {
  ValidationError,
  NotFoundError,
  ForbiddenError,
  ConflictError,
} = require('../../middleware/errorHandler');

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const MAX_ACTIVE_GIGS  = 20;       // REQ-MKT-015
const MAX_FILE_SIZE_KB = 10240;    // 10 MB
const ALLOWED_FILE_TYPES = ['image', 'pdf', 'video'];
const VALID_TIERS        = ['basic', 'standard', 'premium'];
const VALID_STATUSES     = ['draft', 'live', 'paused'];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

/**
 * Validate core gig fields.
 * @param {Object}  data
 * @param {boolean} isCreate - enforce required fields
 * @throws {ValidationError}
 */
function validateGigFields(data, isCreate = false) {
  const errors = [];

  if (isCreate || data.title !== undefined) {
    if (!data.title || data.title.trim().length === 0)
      errors.push({ field: 'title', message: 'Title is required' });
    else if (data.title.length > 120)
      errors.push({ field: 'title', message: 'Title must not exceed 120 characters' });
  }

  if (isCreate || data.description !== undefined) {
    if (!data.description || data.description.trim().length === 0)
      errors.push({ field: 'description', message: 'Description is required' });
  }

  if (isCreate || data.category_id !== undefined) {
    if (!data.category_id)
      errors.push({ field: 'category_id', message: 'Category is required' });
  }

  if (data.status !== undefined && !VALID_STATUSES.includes(data.status)) {
    errors.push({ field: 'status', message: `status must be one of: ${VALID_STATUSES.join(', ')}` });
  }

  if (errors.length > 0) throw new ValidationError('Gig validation failed', errors);
}

/**
 * Validate a single pricing tier object.
 * @param {Object} tier
 * @param {number} index
 * @returns {string[]} - Array of error messages for this tier
 */
function validateTier(tier, index) {
  const errors = [];
  const prefix = `pricing_tiers[${index}]`;

  if (!tier.tier || !VALID_TIERS.includes(tier.tier))
    errors.push({ field: `${prefix}.tier`, message: `tier must be one of: ${VALID_TIERS.join(', ')}` });

  if (tier.price === undefined || isNaN(Number(tier.price)) || Number(tier.price) <= 0)
    errors.push({ field: `${prefix}.price`, message: 'price must be greater than 0' });

  if (!tier.delivery_days || isNaN(Number(tier.delivery_days)) || Number(tier.delivery_days) < 1)
    errors.push({ field: `${prefix}.delivery_days`, message: 'delivery_days must be a positive integer' });

  return errors;
}

/**
 * Normalise pagination params.
 */
function normalisePagination(pagination = {}) {
  const page  = Math.max(1, parseInt(pagination.page,  10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(pagination.limit, 10) || 20));
  return { page, limit };
}

// ─── SERVICE METHODS ──────────────────────────────────────────────────────────

/**
 * Create a new gig listing (starts as draft, set to live on publish).
 *
 * @param {string} freelancerId
 * @param {Object} gigData - { title, description, category_id, pricing_tiers?,
 *                             required_tags?, thumbnail_url? }
 * @returns {Promise<Object>} - Full gig record with tiers and tags
 * @throws {ValidationError}
 * @throws {ConflictError}  - If freelancer already has 20 active gigs (REQ-MKT-015)
 * @throws {NotFoundError}  - If category not found
 */
async function createGig(freelancerId, gigData) {
  const { title, description, category_id, pricing_tiers, required_tags, thumbnail_url, status = 'draft' } = gigData;

  // 1. Validate core fields
  validateGigFields({ title, description, category_id, status }, true);

  // 2. Validate pricing tiers if provided
  if (pricing_tiers !== undefined) {
    if (!Array.isArray(pricing_tiers))
      throw new ValidationError('Gig validation failed', [{ field: 'pricing_tiers', message: 'pricing_tiers must be an array' }]);

    const tierErrors = pricing_tiers.flatMap((t, i) => validateTier(t, i));
    if (tierErrors.length > 0) throw new ValidationError('Pricing tier validation failed', tierErrors);
  }

  // 3. Enforce active gig limit (REQ-MKT-015)
  const { count, error: countErr } = await gigRepo.countActiveGigsByFreelancer(freelancerId);
  if (countErr) throw new Error(`Failed to count gigs: ${countErr.message}`);
  if (count >= MAX_ACTIVE_GIGS)
    throw new ConflictError(`Maximum ${MAX_ACTIVE_GIGS} active gigs allowed per freelancer`);

  // 4. Verify category exists
  const { data: category, error: catErr } = await categoryRepo.getCategoryById(category_id);
  if (catErr || !category) throw new NotFoundError('Category');

  // 5. Create gig record
  const { data: gig, error: gigErr } = await gigRepo.createGig({
    freelancer_id : freelancerId,
    category_id,
    title         : title.trim(),
    description   : description.trim(),
    thumbnail_url : thumbnail_url || null,
    status,
  });
  if (gigErr) throw new Error(`Failed to create gig: ${gigErr.message}`);

  // 6. Insert pricing tiers
  if (Array.isArray(pricing_tiers) && pricing_tiers.length > 0) {
    await Promise.all(pricing_tiers.map((tier) => gigRepo.addPricingTier(gig.id, tier)));
  }

  // 7. Link required tags
  if (Array.isArray(required_tags) && required_tags.length > 0) {
    await Promise.all(required_tags.map((tagId) => gigRepo.addRequiredTag(gig.id, tagId)));
  }

  // 8. Return full gig with relations
  const { data: fullGig } = await gigRepo.getGigById(gig.id);
  return fullGig;
}

/**
 * Fetch a single gig with all related data.
 *
 * @param {string} gigId
 * @returns {Promise<Object>}
 * @throws {NotFoundError}
 */
async function getGig(gigId) {
  const { data: gig, error } = await gigRepo.getGigById(gigId);
  if (error || !gig) throw new NotFoundError('Gig');
  return gig;
}

/**
 * Paginated gig marketplace browse.
 *
 * @param {Object} filters    - { category_id?, min_rating?, is_featured? }
 * @param {Object} pagination - { page?, limit? }
 * @returns {Promise<{ data: Object[], pagination: Object }>}
 */
async function listGigs(filters = {}, pagination = {}) {
  const { page, limit } = normalisePagination(pagination);
  const { data, error, count } = await gigRepo.getAllGigs({ ...filters, page, limit });
  if (error) throw new Error(`Failed to list gigs: ${error.message}`);

  return {
    data: data || [],
    pagination: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) },
  };
}

/**
 * Partially update a gig. Only the owning freelancer may update.
 *
 * @param {string} gigId
 * @param {string} freelancerId
 * @param {Object} updates
 * @returns {Promise<Object>} - Updated gig
 * @throws {NotFoundError}
 * @throws {ForbiddenError}
 * @throws {ValidationError}
 */
async function updateGig(gigId, freelancerId, updates) {
  const { data: gig, error } = await gigRepo.getGigById(gigId);
  if (error || !gig) throw new NotFoundError('Gig');
  if (gig.freelancer_id !== freelancerId) throw new ForbiddenError('You do not own this gig');

  validateGigFields(updates, false);

  if (updates.category_id) {
    const { data: cat } = await categoryRepo.getCategoryById(updates.category_id);
    if (!cat) throw new NotFoundError('Category');
  }

  const { data: updated, error: updateErr } = await gigRepo.updateGig(gigId, updates);
  if (updateErr) throw new Error(`Failed to update gig: ${updateErr.message}`);
  return updated;
}

/**
 * Deactivate (pause) a gig. Only the owning freelancer may do this.
 *
 * @param {string} gigId
 * @param {string} freelancerId
 * @throws {NotFoundError}
 * @throws {ForbiddenError}
 */
async function deactivateGig(gigId, freelancerId) {
  const { data: gig, error } = await gigRepo.getGigById(gigId);
  if (error || !gig) throw new NotFoundError('Gig');
  if (gig.freelancer_id !== freelancerId) throw new ForbiddenError('You do not own this gig');

  await gigRepo.deactivateGig(gigId);
}

/**
 * Upload a portfolio sample for a gig.
 *
 * @param {string} gigId
 * @param {string} freelancerId
 * @param {Object} sampleData - { file_url, file_type, title?, file_size_kb? }
 * @returns {Promise<Object>} - Created portfolio sample
 * @throws {NotFoundError}
 * @throws {ForbiddenError}
 * @throws {ValidationError}
 */
async function uploadPortfolioSample(gigId, freelancerId, sampleData) {
  const { data: gig, error } = await gigRepo.getGigById(gigId);
  if (error || !gig) throw new NotFoundError('Gig');
  if (gig.freelancer_id !== freelancerId) throw new ForbiddenError('You do not own this gig');

  const errors = [];
  if (!sampleData.file_url || sampleData.file_url.trim().length === 0)
    errors.push({ field: 'file_url', message: 'file_url is required' });
  if (!sampleData.file_type || !ALLOWED_FILE_TYPES.includes(sampleData.file_type))
    errors.push({ field: 'file_type', message: `file_type must be one of: ${ALLOWED_FILE_TYPES.join(', ')}` });
  if (sampleData.file_size_kb !== undefined && Number(sampleData.file_size_kb) > MAX_FILE_SIZE_KB)
    errors.push({ field: 'file_size_kb', message: `File size must not exceed ${MAX_FILE_SIZE_KB} KB (10 MB)` });

  if (errors.length > 0) throw new ValidationError('Portfolio sample validation failed', errors);

  const { data: sample, error: sampleErr } = await gigRepo.addPortfolioSample(gigId, {
    file_url  : sampleData.file_url.trim(),
    file_type : sampleData.file_type,
    title     : sampleData.title?.trim() || null,
    sort_order: sampleData.sort_order ?? 0,
  });
  if (sampleErr) throw new Error(`Failed to upload portfolio sample: ${sampleErr.message}`);
  return sample;
}

/**
 * Get all gigs for a freelancer's own dashboard (includes drafts/paused).
 *
 * @param {string} freelancerId
 * @param {Object} filters - { status?, page?, limit? }
 * @returns {Promise<{ data: Object[], pagination: Object }>}
 */
async function getFreelancerGigs(freelancerId, filters = {}) {
  const { page, limit } = normalisePagination(filters);
  const { data, error, count } = await gigRepo.getGigsByFreelancer(freelancerId, { ...filters, page, limit });
  if (error) throw new Error(`Failed to fetch freelancer gigs: ${error.message}`);

  return {
    data: data || [],
    pagination: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) },
  };
}

module.exports = {
  createGig,
  getGig,
  listGigs,
  updateGig,
  deactivateGig,
  uploadPortfolioSample,
  getFreelancerGigs,
};
