'use strict';

const searchService = require('../../src/layers/application/SearchFilterService');
const gigRepo = require('../../src/layers/dataAccess/gigRepository');
const jobRepo = require('../../src/layers/dataAccess/jobRepository');

jest.mock('../../src/layers/dataAccess/gigRepository');
jest.mock('../../src/layers/dataAccess/jobRepository');
jest.mock('../../src/layers/dataAccess/categoryRepository');

describe('SearchFilterService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('searchGigs', () => {
    it('uses getAllGigs when query is empty and keeps gig marketplace filters', async () => {
      gigRepo.getAllGigs.mockResolvedValue({ data: [{ id: 'gig1' }], count: 1 });

      const result = await searchService.searchGigs('', {
        category_id: 'cat1',
        price_min: '100',
        price_max: '500',
        max_delivery_days: '7',
        sort: 'price_asc',
      }, { page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(gigRepo.getAllGigs).toHaveBeenCalledWith(expect.objectContaining({
        category_id: 'cat1',
        price_min: 100,
        price_max: 500,
        max_delivery_days: 7,
        sort: 'price_asc',
        page: 1,
        limit: 10,
      }));
    });

    it('uses searchGigs when query has at least two characters', async () => {
      gigRepo.searchGigs.mockResolvedValue({ data: [{ id: 'gig1' }], count: 1 });

      const result = await searchService.searchGigs('react', {
        min_rating: '4',
        sort: 'rating_desc',
      }, { page: 2, limit: 5 });

      expect(result.pagination.query).toBe('react');
      expect(gigRepo.searchGigs).toHaveBeenCalledWith('react', expect.objectContaining({
        min_rating: 4,
        sort: 'rating_desc',
        page: 2,
        limit: 5,
      }));
    });

    it('rejects invalid gig sort values', async () => {
      await expect(searchService.searchGigs('react', { sort: 'random' }))
        .rejects.toThrow('Invalid gig filters');
    });
  });

  describe('searchAll', () => {
    it('returns separate job and gig result buckets for global search', async () => {
      jobRepo.searchJobs.mockResolvedValue({ data: [{ id: 'job1' }], count: 1 });
      gigRepo.searchGigs.mockResolvedValue({ data: [{ id: 'gig1' }], count: 1 });

      const result = await searchService.searchAll('react', {}, { page: 1, limit: 10 });

      expect(result.jobs.total).toBe(1);
      expect(result.gigs.total).toBe(1);
      expect(result.query).toBe('react');
    });
  });
});
