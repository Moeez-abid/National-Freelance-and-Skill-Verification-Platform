'use strict';

const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../../../middleware/authMiddleware');
const jobService = require('../../application/JobPostingService');
const biddingService = require('../../application/BiddingService');
const searchService = require('../../application/SearchFilterService');
const jobValidators = require('../../../utils/validators/jobValidators');
const handleValidationErrors = require('../../../utils/validators/handleValidationErrors');
const { success } = require('../../../utils/responseFormatter');

// Global authMiddleware removed to allow public access to GET routes

// POST /api/v1/jobs - Create a new job (Client only)
router.post('/', authMiddleware, requireRole('client'), jobValidators.createJob, handleValidationErrors, async (req, res, next) => {
  try {
    const job = await jobService.createJob(req.user.id, req.body);
    return success(res, job, 201);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/jobs/dashboard - Get jobs posted by the logged-in client
router.get('/dashboard', authMiddleware, requireRole('client'), async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
      page: req.query.page,
      limit: req.query.limit,
    };
    const result = await jobService.getClientDashboardJobs(req.user.id, filters);
    return success(res, result.data, 200, result.pagination);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/jobs/search - Search jobs (Any role)
router.get('/search', async (req, res, next) => {
  try {
    const query = req.query.q;
    const filters = {
      category_id: req.query.category_id,
      project_type: req.query.project_type,
      budget_min: req.query.budget_min,
      budget_max: req.query.budget_max,
      sort: req.query.sort,
    };
    const pagination = { page: req.query.page, limit: req.query.limit };
    const result = await searchService.searchJobs(query, filters, pagination);
    return success(res, result.data, 200, result.pagination);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/jobs/:id - Get a specific job (Any role)
router.get('/:id', async (req, res, next) => {
  try {
    const job = await jobService.getJob(req.params.id);
    return success(res, job);
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/jobs/:id - Update an existing job (Client only)
router.put('/:id', authMiddleware, requireRole('client'), jobValidators.updateJob, handleValidationErrors, async (req, res, next) => {
  try {
    const updatedJob = await jobService.updateJob(req.params.id, req.user.id, req.body);
    return success(res, updatedJob);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/jobs/:id - Delete (cancel) an open job (Client only)
router.delete('/:id', authMiddleware, requireRole('client'), async (req, res, next) => {
  try {
    await jobService.deleteJob(req.params.id, req.user.id);
    return success(res, { message: 'Job successfully deleted' });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/jobs/:id/bids - Get bids for a specific job (Client only)
router.get('/:id/bids', authMiddleware, requireRole('client'), async (req, res, next) => {
  try {
    const bids = await biddingService.getJobBids(req.params.id, req.user.id);
    return success(res, bids);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/jobs - List marketplace jobs (Any role)
router.get('/', async (req, res, next) => {
  try {
    const filters = {
      q: req.query.q,
      status: req.query.status,
      category_id: req.query.category_id,
      project_type: req.query.project_type,
      budget_min: req.query.budget_min,
      budget_max: req.query.budget_max,
    };
    const pagination = { page: req.query.page, limit: req.query.limit };
    const result = await jobService.listJobs(filters, pagination);
    return success(res, result.data, 200, result.pagination);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
