'use strict';

const express = require('express');
const router = express.Router();
const searchService = require('../../application/SearchFilterService');
const { success } = require('../../../utils/responseFormatter');
const internalAuthMiddleware = require('../../../middleware/internalAuthMiddleware');

// Apply internal auth middleware for Module 4 specifically
router.use(internalAuthMiddleware('module4'));

// ─── ENDPOINTS ─────────────────────────────────────────────────────────────────

// GET /api/v1/internal/module4/jobs - Bulk export open jobs for AI matching
router.get('/jobs', async (req, res, next) => {
  try {
    const filters = { status: 'open' };
    const pagination = { 
      page: req.query.page || 1, 
      limit: req.query.limit || 500 // Allow larger batches for internal sync
    };
    
    // We can use searchService here to get structured job data
    const result = await searchService.searchJobs('', filters, pagination);
    return success(res, result.data, 200, result.pagination);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/internal/module4/gigs - Bulk export active gigs for AI matching
router.get('/gigs', async (req, res, next) => {
  try {
    const filters = {}; // Active is default in gig repo usually, or we can specify it
    const pagination = { 
      page: req.query.page || 1, 
      limit: req.query.limit || 500 
    };
    
    const result = await searchService.searchGigs('', filters, pagination);
    return success(res, result.data, 200, result.pagination);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
