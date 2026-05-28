'use strict';

const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../../../middleware/authMiddleware');
const biddingService = require('../../application/BiddingService');
const bidValidators = require('../../../utils/validators/bidValidators');
const handleValidationErrors = require('../../../utils/validators/handleValidationErrors');
const { success } = require('../../../utils/responseFormatter');

// All bid routes require authentication
router.use(authMiddleware);

// POST /api/v1/bids - Submit a bid (Freelancer only)
router.post('/', requireRole('freelancer'), bidValidators.submitBid, handleValidationErrors, async (req, res, next) => {
  try {
    const bid = await biddingService.submitBid(req.user.id, req.body.job_id, req.body);
    return success(res, bid, 201);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/bids/my-bids - Get bids by logged-in freelancer
router.get('/my-bids', requireRole('freelancer'), async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
      page: req.query.page,
      limit: req.query.limit,
    };
    const result = await biddingService.getFreelancerBids(req.user.id, filters);
    return success(res, result.data, 200, result.pagination);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/bids/:id - Get a specific bid detail
router.get('/:id', async (req, res, next) => {
  try {
    const bid = await biddingService.getBidById(req.params.id, req.user.id);
    return success(res, bid);
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/bids/:id/withdraw - Withdraw a bid (Freelancer only)
router.put('/:id/withdraw', requireRole('freelancer'), async (req, res, next) => {
  try {
    await biddingService.withdrawBid(req.params.id, req.user.id);
    return success(res, { message: 'Bid successfully withdrawn' });
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/bids/:id/accept - Accept a bid (Client only)
router.put('/:id/accept', requireRole('client'), async (req, res, next) => {
  try {
    const result = await biddingService.acceptBid(req.body.job_id, req.params.id, req.user.id);
    return success(res, result, 200, { message: 'Bid accepted successfully and escrow initiated' });
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/bids/:id/reject - Reject a bid (Client only)
router.put('/:id/reject', requireRole('client'), async (req, res, next) => {
  try {
    await biddingService.rejectBid(req.params.id, req.user.id);
    return success(res, { message: 'Bid rejected successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
