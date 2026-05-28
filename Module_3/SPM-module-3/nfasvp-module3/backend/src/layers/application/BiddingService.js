'use strict';

/**
 * BiddingService.js — Application Layer
 * All business logic for the bidding/proposal lifecycle.
 * acceptBid is the most critical path — ACID via RPC, non-blocking integrations.
 */

const bidRepo     = require('../dataAccess/bidRepository');
const jobRepo     = require('../dataAccess/jobRepository');
const projectRepo = require('../dataAccess/projectRepository');
const module6     = require('../integration/module6Client');
const module7     = require('../integration/module7Client');
const {
  ValidationError,
  NotFoundError,
  ForbiddenError,
  ConflictError,
} = require('../../middleware/errorHandler');

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function normalisePagination(pagination = {}) {
  const page  = Math.max(1, parseInt(pagination.page,  10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(pagination.limit, 10) || 20));
  return { page, limit };
}

/**
 * Validate bid submission fields.
 * @throws {ValidationError}
 */
function validateBidFields(data) {
  const errors = [];

  if (!data.cover_letter || data.cover_letter.trim().length === 0)
    errors.push({ field: 'cover_letter', message: 'Cover letter is required' });
  else if (data.cover_letter.length > 2000)
    errors.push({ field: 'cover_letter', message: 'Cover letter must not exceed 2000 characters' });

  if (data.bid_amount === undefined || data.bid_amount === null)
    errors.push({ field: 'bid_amount', message: 'Bid amount is required' });
  else if (isNaN(Number(data.bid_amount)) || Number(data.bid_amount) < 0)
    errors.push({ field: 'bid_amount', message: 'Bid amount must be a non-negative number' });

  if (errors.length > 0) throw new ValidationError('Bid validation failed', errors);
}

// ─── SERVICE METHODS ──────────────────────────────────────────────────────────

/**
 * Submit a proposal on an open job.
 *
 * @param {string} freelancerId
 * @param {string} jobId
 * @param {Object} bidData - { bid_amount, bid_type?, duration_label?, cover_letter }
 * @returns {Promise<Object>} - Created bid record
 * @throws {NotFoundError}   - Job not found
 * @throws {ConflictError}   - Job closed or duplicate bid
 * @throws {ValidationError} - Invalid fields
 */
async function submitBid(freelancerId, jobId, bidData) {
  // 1. Verify job exists and is open
  const { data: job, error: jobErr } = await jobRepo.getJobById(jobId);
  if (jobErr || !job) throw new NotFoundError('Job');
  if (job.status !== 'open') throw new ConflictError('Job is not accepting bids');

  // 2. Prevent duplicate bid
  const { data: isDuplicate, error: dupErr } = await bidRepo.checkDuplicateBid(jobId, freelancerId);
  if (dupErr) throw new Error(`Duplicate check failed: ${dupErr.message}`);
  if (isDuplicate) throw new ConflictError('You have already submitted a bid on this job');

  // 3. Validate bid fields
  validateBidFields(bidData);

  // 4. Create the bid
  const { data: bid, error: bidErr } = await bidRepo.createBid({
    job_id        : jobId,
    freelancer_id : freelancerId,
    bid_amount    : Number(bidData.bid_amount),
    bid_type      : bidData.bid_type      || 'fixed_price',
    duration_label: bidData.duration_label || null,
    cover_letter  : bidData.cover_letter.trim(),
    milestones    : bidData.milestones || [],
  });
  if (bidErr) throw new Error(`Failed to create bid: ${bidErr.message}`);

  // 5. Log marketplace event (fire-and-forget, non-blocking)
  projectRepo.logMarketplaceEvent({
    event_type  : 'bid_submitted',
    triggered_by: freelancerId,
    recipient_id: job.client_id,
    entity_type : 'bid',
    entity_id   : bid.id,
    payload     : { job_id: jobId, bid_amount: bid.bid_amount },
    module6_sent: false,
  }).catch(console.error);

  return bid;
}

/**
 * Get all bids on a job (client-only view).
 *
 * @param {string} jobId
 * @param {string} clientId - Must own the job
 * @returns {Promise<Object[]>}
 * @throws {NotFoundError}
 * @throws {ForbiddenError}
 */
async function getJobBids(jobId, clientId) {
  const { data: job, error } = await jobRepo.getJobById(jobId);
  if (error || !job) throw new NotFoundError('Job');
  if (job.client_id !== clientId) throw new ForbiddenError('You do not own this job');

  const { data: bids, error: bidsErr } = await bidRepo.getBidsByJob(jobId);
  if (bidsErr) throw new Error(`Failed to fetch bids: ${bidsErr.message}`);
  return bids || [];
}

/**
 * Get a freelancer's own bids (My Proposals view).
 *
 * @param {string} freelancerId
 * @param {Object} filters - { status?, page?, limit? }
 * @returns {Promise<{ data: Object[], pagination: Object }>}
 */
async function getFreelancerBids(freelancerId, filters = {}) {
  const { page, limit } = normalisePagination(filters);
  const { data, error, count } = await bidRepo.getBidsByFreelancer(freelancerId, { ...filters, page, limit });
  if (error) throw new Error(`Failed to fetch bids: ${error.message}`);

  return {
    data: data || [],
    pagination: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) },
  };
}

/**
 * Withdraw a pending bid.
 *
 * @param {string} bidId
 * @param {string} freelancerId - Must own the bid
 * @throws {NotFoundError}
 * @throws {ForbiddenError}
 * @throws {ConflictError}
 */
async function withdrawBid(bidId, freelancerId) {
  const { data: bid, error } = await bidRepo.getBidById(bidId);
  if (error || !bid) throw new NotFoundError('Bid');
  if (bid.freelancer_id !== freelancerId) throw new ForbiddenError('You do not own this bid');
  if (bid.status !== 'pending') throw new ConflictError('Only pending bids can be withdrawn');

  await bidRepo.withdrawBid(bidId, freelancerId);
}

/**
 * Accept a bid — CRITICAL atomic operation.
 *
 * Flow:
 *   1. Guard checks (job ownership, statuses)
 *   2. ACID RPC: accept bid + reject others + set job in_progress + create project
 *   3. Non-blocking integrations via Promise.allSettled (M7 escrow + M6 notification)
 *   4. Audit log
 *
 * @param {string} jobId
 * @param {string} bidId
 * @param {string} clientId - Must own the job
 * @returns {Promise<{ project: Object, bid: Object }>}
 * @throws {NotFoundError}
 * @throws {ForbiddenError}
 * @throws {ConflictError}
 */
async function acceptBid(jobId, bidId, clientId) {
  // ── 1. Guard: job exists and belongs to client ────────────────────────────
  const { data: job, error: jobErr } = await jobRepo.getJobById(jobId);
  if (jobErr || !job) throw new NotFoundError('Job');
  if (job.client_id !== clientId) throw new ForbiddenError('You do not own this job');
  if (job.status !== 'open') throw new ConflictError('Job is no longer accepting bids');

  // ── 2. Guard: bid exists and belongs to this job ──────────────────────────
  const { data: bid, error: bidErr } = await bidRepo.getBidById(bidId);
  if (bidErr || !bid) throw new NotFoundError('Bid');
  if (bid.job_id !== jobId) throw new NotFoundError('Bid does not belong to this job');
  if (bid.status !== 'pending') throw new ConflictError('Bid is no longer pending');

  // ── 3. Build project payload ──────────────────────────────────────────────
  const projectData = {
    client_id    : clientId,
    freelancer_id: bid.freelancer_id,
    title        : job.title,
    total_amount : bid.bid_amount,
    project_type : bid.bid_type,
    deadline_at  : job.expires_at || null,
  };

  // ── 4. ACID transaction via local PostgreSQL BEGIN/COMMIT ────────────────
  // Atomically: accepts bid, rejects all others, updates job, creates project.
  const { data: projectRows, error: rpcErr } = await bidRepo.acceptBidTransaction(
    jobId, bidId, projectData
  );
  if (rpcErr) throw new Error(`Bid acceptance transaction failed: ${rpcErr.message}`);

  const project = Array.isArray(projectRows) ? projectRows[0] : projectRows;

  // ── 5. Non-blocking integrations — failures MUST NOT affect response ──────
  // Promise.allSettled ensures both calls fire, and neither failure propagates.
  const integrationResults = await Promise.allSettled([
    module7.initiateEscrow(project),                                       // M7: escrow
    module6.notifyBidAccepted(bid.freelancer_id, clientId, project),       // M6: notify
  ]);

  // Log integration outcomes (for observability, non-blocking)
  integrationResults.forEach((result, i) => {
    const target = i === 0 ? 'Module7/escrow' : 'Module6/notification';
    if (result.status === 'rejected') {
      console.error(`[BiddingService] ${target} integration failed (non-fatal):`, result.reason?.message);
    }
  });

  // ── 6. Audit log ──────────────────────────────────────────────────────────
  projectRepo.logMarketplaceEvent({
    event_type  : 'bid_accepted',
    triggered_by: clientId,
    recipient_id: bid.freelancer_id,
    entity_type : 'project',
    entity_id   : project.id,
    payload     : { job_id: jobId, bid_id: bidId, project_id: project.id },
    module6_sent: integrationResults[1].status === 'fulfilled',
    module6_response: integrationResults[1].status === 'fulfilled'
      ? integrationResults[1].value
      : { error: integrationResults[1].reason?.message },
  }).catch(console.error);

  return { project, bid: { ...bid, status: 'accepted' } };
}

/**
 * Reject a specific bid (client action).
 *
 * @param {string} bidId
 * @param {string} clientId
 * @throws {NotFoundError}
 * @throws {ForbiddenError}
 * @throws {ConflictError}
 */
async function rejectBid(bidId, clientId) {
  const { data: bid, error } = await bidRepo.getBidById(bidId);
  if (error || !bid) throw new NotFoundError('Bid');

  // Verify client owns the job this bid belongs to
  const { data: job, error: jobErr } = await jobRepo.getJobById(bid.job_id);
  if (jobErr || !job) throw new NotFoundError('Job');
  if (job.client_id !== clientId) throw new ForbiddenError('You do not own this job');
  if (bid.status !== 'pending') throw new ConflictError('Only pending bids can be rejected');

  await bidRepo.updateBidStatus(bidId, 'rejected');

  // Non-blocking notification to freelancer
  module6.notifyBidRejected(bid.freelancer_id, bid.job_id).catch(console.error);
}

/**
 * Get a specific bid by ID.
 *
 * @param {string} bidId
 * @param {string} userId - Must be either the freelancer who submitted it or the client who owns the job
 * @returns {Promise<Object>}
 * @throws {NotFoundError}
 * @throws {ForbiddenError}
 */
async function getBidById(bidId, userId) {
  const { data: bid, error } = await bidRepo.getBidById(bidId);
  if (error || !bid) throw new NotFoundError('Bid');

  // Verify access: freelancer who bid OR client who owns the job
  const { data: job, error: jobErr } = await jobRepo.getJobById(bid.job_id);
  if (jobErr || !job) throw new NotFoundError('Job');

  if (bid.freelancer_id !== userId && job.client_id !== userId) {
    throw new ForbiddenError('You do not have access to this bid');
  }

  // Attach job info for convenience
  return { ...bid, job };
}

module.exports = {
  submitBid,
  getJobBids,
  getFreelancerBids,
  getBidById,
  withdrawBid,
  acceptBid,
  rejectBid,
};
