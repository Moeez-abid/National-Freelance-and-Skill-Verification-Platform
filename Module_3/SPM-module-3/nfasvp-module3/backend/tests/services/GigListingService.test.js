'use strict';

const gigService = require('../../src/layers/application/GigListingService');
const gigRepo = require('../../src/layers/dataAccess/gigRepository');
const categoryRepo = require('../../src/layers/dataAccess/categoryRepository');
const { ConflictError, ForbiddenError } = require('../../src/middleware/errorHandler');

jest.mock('../../src/layers/dataAccess/gigRepository');
jest.mock('../../src/layers/dataAccess/categoryRepository');

describe('GigListingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createGig', () => {
    const validData = {
      title: 'Valid title',
      description: 'Valid description',
      category_id: 'cat1',
    };

    it('1. createGig — success', async () => {
      gigRepo.countActiveGigsByFreelancer.mockResolvedValue({ count: 5 });
      categoryRepo.getCategoryById.mockResolvedValue({ data: { id: 'cat1' } });
      gigRepo.createGig.mockResolvedValue({ data: { id: 'gig1' } });
      gigRepo.getGigById.mockResolvedValue({ data: { id: 'gig1', ...validData } });

      const result = await gigService.createGig('f1', validData);
      expect(result.id).toBe('gig1');
    });

    it('2. createGig — exceeds 20 active gigs: throws ConflictError', async () => {
      gigRepo.countActiveGigsByFreelancer.mockResolvedValue({ count: 20 });
      await expect(gigService.createGig('f1', validData)).rejects.toThrow(ConflictError);
    });
  });

  describe('deactivateGig', () => {
    it('3. deactivateGig — freelancer mismatch: throws ForbiddenError', async () => {
      gigRepo.getGigById.mockResolvedValue({ data: { id: 'gig1', freelancer_id: 'f1' } });
      await expect(gigService.deactivateGig('gig1', 'f2')).rejects.toThrow(ForbiddenError);
    });
  });
});
