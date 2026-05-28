'use strict';

const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../../../middleware/authMiddleware');
const gigService = require('../../application/GigListingService');
const searchService = require('../../application/SearchFilterService');
const gigValidators = require('../../../utils/validators/gigValidators');
const handleValidationErrors = require('../../../utils/validators/handleValidationErrors');
const { success } = require('../../../utils/responseFormatter');

// Global authMiddleware removed to allow public access to GET routes

// POST /api/v1/gigs - Create a new gig (Freelancer only)
router.post('/', authMiddleware, requireRole('freelancer'), gigValidators.createGig, handleValidationErrors, async (req, res, next) => {
  try {
    const gig = await gigService.createGig(req.user.id, req.body);
    return success(res, gig, 201);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/gigs/my-gigs - Get gigs by logged-in freelancer
router.get('/my-gigs', authMiddleware, requireRole('freelancer'), async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
      page: req.query.page,
      limit: req.query.limit,
    };
    const result = await gigService.getFreelancerGigs(req.user.id, filters);
    return success(res, result.data, 200, result.pagination);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/gigs/search - Search gigs (Any role)
router.get('/search', async (req, res, next) => {
  try {
    const query = req.query.q;
    const filters = {
      category_id: req.query.category_id,
      min_rating: req.query.min_rating,
      max_delivery_days: req.query.max_delivery_days,
      price_min: req.query.price_min,
      price_max: req.query.price_max,
      is_featured: req.query.is_featured,
      sort: req.query.sort,
    };
    const pagination = { page: req.query.page, limit: req.query.limit };
    const result = await searchService.searchGigs(query, filters, pagination);
    return success(res, result.data, 200, result.pagination);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/gigs/:id - Get a specific gig (Any role)
router.get('/:id', async (req, res, next) => {
  try {
    const gig = await gigService.getGig(req.params.id);
    return success(res, gig);
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/gigs/:id - Update an existing gig (Freelancer only)
router.put('/:id', authMiddleware, requireRole('freelancer'), gigValidators.updateGig, handleValidationErrors, async (req, res, next) => {
  try {
    const updatedGig = await gigService.updateGig(req.params.id, req.user.id, req.body);
    return success(res, updatedGig);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/gigs/:id - Deactivate a gig (Freelancer only)
router.delete('/:id', authMiddleware, requireRole('freelancer'), async (req, res, next) => {
  try {
    await gigService.deactivateGig(req.params.id, req.user.id);
    return success(res, { message: 'Gig successfully deactivated' });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/gigs/:id/samples - Upload portfolio sample (Freelancer only)
router.post('/:id/samples', authMiddleware, requireRole('freelancer'), async (req, res, next) => {
  try {
    const sample = await gigService.uploadPortfolioSample(req.params.id, req.user.id, req.body);
    return success(res, sample, 201);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/gigs - List marketplace gigs (Any role)
router.get('/', async (req, res, next) => {
  try {
    const filters = {
      category_id: req.query.category_id,
      min_rating: req.query.min_rating,
      is_featured: req.query.is_featured,
    };
    const pagination = { page: req.query.page, limit: req.query.limit };
    const result = await gigService.listGigs(filters, pagination);
    return success(res, result.data, 200, result.pagination);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
