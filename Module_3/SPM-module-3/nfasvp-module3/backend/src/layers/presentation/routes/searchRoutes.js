'use strict';

const express = require('express');
const router = express.Router();
const searchService = require('../../application/SearchFilterService');
const { success } = require('../../../utils/responseFormatter');

// GET /api/v1/search?q=...&type=jobs|gigs|all
// No auth middleware applied globally here; if auth is needed, mount it in server.js
// But typically search is open (or validated based on requirements).
// We'll assume any role can search, so we can use it openly or apply auth depending on M4 requirements.

router.get('/', async (req, res, next) => {
  try {
    const query = req.query.q;
    const type = req.query.type || 'all';
    
    // Base filters from query string
    const filters = {
      category_id: req.query.category_id,
      budget_min: req.query.budget_min,
      budget_max: req.query.budget_max,
      min_rating: req.query.min_rating,
      price_min: req.query.price_min,
      price_max: req.query.price_max,
      is_featured: req.query.is_featured,
      sort: req.query.sort,
    };
    
    const pagination = { page: req.query.page, limit: req.query.limit };

    let result;
    if (type === 'jobs') {
      result = await searchService.searchJobs(query, filters, pagination);
    } else if (type === 'gigs') {
      result = await searchService.searchGigs(query, filters, pagination);
    } else {
      // Default to 'all'
      result = await searchService.searchAll(query, filters, pagination);
      // searchAll returns a different shape: { jobs, gigs, query }
      return success(res, result);
    }

    // For single type searches, format pagination metadata
    return success(res, result.data, 200, result.pagination);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/search/tags
router.get('/tags', async (req, res, next) => {
  try {
    const filters = {};
    if (req.query.is_verified !== undefined) {
      filters.is_verified = req.query.is_verified === 'true';
    }
    const tags = await searchService.getAllTags(filters);
    return success(res, tags);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
