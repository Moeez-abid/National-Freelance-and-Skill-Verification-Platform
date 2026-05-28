'use strict';

const biddingService = require('../../src/layers/application/BiddingService');
const bidRepo = require('../../src/layers/dataAccess/bidRepository');
const jobRepo = require('../../src/layers/dataAccess/jobRepository');
const projectRepo = require('../../src/layers/dataAccess/projectRepository');
const module6Client = require('../../src/layers/integration/module6Client');
const module7Client = require('../../src/layers/integration/module7Client');
const { ValidationError, NotFoundError, ConflictError, ForbiddenError } = require('../../src/middleware/errorHandler');

// Mock dependencies
jest.mock('../../src/layers/dataAccess/bidRepository');
jest.mock('../../src/layers/dataAccess/jobRepository');
jest.mock('../../src/layers/dataAccess/projectRepository');
jest.mock('../../src/layers/integration/module6Client');
jest.mock('../../src/layers/integration/module7Client');

describe('BiddingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('submitBid', () => {
    const validBidData = { bid_amount: 500, cover_letter: 'Hello there' };

    it('1. submitBid — success case: returns bid with status=pending', async () => {
      jobRepo.getJobById.mockResolvedValue({ data: { id: 'job1', status: 'open', client_id: 'client1' } });
      bidRepo.checkDuplicateBid.mockResolvedValue({ data: false });
      bidRepo.createBid.mockResolvedValue({ data: { id: 'bid1', status: 'pending', bid_amount: 500 } });
      projectRepo.logMarketplaceEvent.mockResolvedValue();

      const result = await biddingService.submitBid('freelancer1', 'job1', validBidData);

      expect(result.status).toBe('pending');
      expect(bidRepo.createBid).toHaveBeenCalled();
    });

    it('2. submitBid — job not found: throws NotFoundError', async () => {
      jobRepo.getJobById.mockResolvedValue({ data: null, error: { message: 'Not found' } });

      await expect(biddingService.submitBid('f1', 'job1', validBidData)).rejects.toThrow(NotFoundError);
    });

    it('3. submitBid — job not open: throws ConflictError', async () => {
      jobRepo.getJobById.mockResolvedValue({ data: { id: 'job1', status: 'closed' } });

      await expect(biddingService.submitBid('f1', 'job1', validBidData)).rejects.toThrow(ConflictError);
    });

    it('4. submitBid — duplicate bid: throws ConflictError', async () => {
      jobRepo.getJobById.mockResolvedValue({ data: { id: 'job1', status: 'open' } });
      bidRepo.checkDuplicateBid.mockResolvedValue({ data: true });

      await expect(biddingService.submitBid('f1', 'job1', validBidData)).rejects.toThrow(ConflictError);
    });

    it('5. submitBid — missing cover_letter: throws ValidationError', async () => {
      jobRepo.getJobById.mockResolvedValue({ data: { id: 'job1', status: 'open' } });
      bidRepo.checkDuplicateBid.mockResolvedValue({ data: false });

      await expect(biddingService.submitBid('f1', 'job1', { bid_amount: 500 })).rejects.toThrow(ValidationError);
    });
  });

  describe('acceptBid', () => {
    it('6. acceptBid — success: calls bidRepo.acceptBidTransaction AND module7Client AND module6Client', async () => {
      jobRepo.getJobById.mockResolvedValue({ data: { id: 'job1', status: 'open', client_id: 'client1' } });
      bidRepo.getBidById.mockResolvedValue({ data: { id: 'bid1', job_id: 'job1', status: 'pending', freelancer_id: 'f1', bid_amount: 500 } });
      bidRepo.acceptBidTransaction.mockResolvedValue({ data: { id: 'proj1' } });
      module7Client.initiateEscrow.mockResolvedValue({});
      module6Client.notifyBidAccepted.mockResolvedValue({});
      projectRepo.logMarketplaceEvent.mockResolvedValue();

      const result = await biddingService.acceptBid('job1', 'bid1', 'client1');

      expect(result.project.id).toBe('proj1');
      expect(result.bid.status).toBe('accepted');
      expect(bidRepo.acceptBidTransaction).toHaveBeenCalled();
      expect(module7Client.initiateEscrow).toHaveBeenCalled();
      expect(module6Client.notifyBidAccepted).toHaveBeenCalled();
    });

    it('7. acceptBid — client mismatch: throws ForbiddenError', async () => {
      jobRepo.getJobById.mockResolvedValue({ data: { id: 'job1', status: 'open', client_id: 'client1' } });

      await expect(biddingService.acceptBid('job1', 'bid1', 'client2')).rejects.toThrow(ForbiddenError);
    });

    it('8. acceptBid — module7Client failure: does NOT throw, logs error, returns project (non-blocking)', async () => {
      jobRepo.getJobById.mockResolvedValue({ data: { id: 'job1', status: 'open', client_id: 'client1' } });
      bidRepo.getBidById.mockResolvedValue({ data: { id: 'bid1', job_id: 'job1', status: 'pending', freelancer_id: 'f1' } });
      bidRepo.acceptBidTransaction.mockResolvedValue({ data: { id: 'proj1' } });
      
      // Simulate module 7 rejection
      module7Client.initiateEscrow.mockRejectedValue(new Error('M7 down'));
      module6Client.notifyBidAccepted.mockResolvedValue({});
      projectRepo.logMarketplaceEvent.mockResolvedValue();

      const result = await biddingService.acceptBid('job1', 'bid1', 'client1');

      // Should still succeed and return the project
      expect(result.project.id).toBe('proj1');
      expect(module7Client.initiateEscrow).toHaveBeenCalled();
    });
  });

  describe('withdrawBid', () => {
    it('9. withdrawBid — success: updates to withdrawn', async () => {
      bidRepo.getBidById.mockResolvedValue({ data: { id: 'bid1', status: 'pending', freelancer_id: 'f1' } });
      bidRepo.withdrawBid.mockResolvedValue();

      await expect(biddingService.withdrawBid('bid1', 'f1')).resolves.toBeUndefined();
      expect(bidRepo.withdrawBid).toHaveBeenCalledWith('bid1', 'f1');
    });

    it('10. withdrawBid — bid not pending: throws ConflictError', async () => {
      bidRepo.getBidById.mockResolvedValue({ data: { id: 'bid1', status: 'accepted', freelancer_id: 'f1' } });

      await expect(biddingService.withdrawBid('bid1', 'f1')).rejects.toThrow(ConflictError);
    });
  });
});
