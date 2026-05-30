'use strict';

const gigService = require('../../src/layers/application/GigListingService');
const gigRepo = require('../../src/layers/dataAccess/gigRepository');
const categoryRepo = require('../../src/layers/dataAccess/categoryRepository');
const { ConflictError, ForbiddenError, ValidationError } = require('../../src/middleware/errorHandler');

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

    it('creates a gig successfully', async () => {
      gigRepo.countActiveGigsByFreelancer.mockResolvedValue({ count: 5 });
      categoryRepo.getCategoryById.mockResolvedValue({ data: { id: 'cat1' } });
      categoryRepo.getAllTags.mockResolvedValue({ data: [] });
      gigRepo.createGig.mockResolvedValue({ data: { id: 'gig1' } });
      gigRepo.getGigById.mockResolvedValue({ data: { id: 'gig1', ...validData } });

      const result = await gigService.createGig('f1', validData);

      expect(result.id).toBe('gig1');
    });

    it('throws ConflictError when freelancer already has 20 active gigs', async () => {
      gigRepo.countActiveGigsByFreelancer.mockResolvedValue({ count: 20 });

      await expect(gigService.createGig('f1', validData)).rejects.toThrow(ConflictError);
    });

    it('preserves requested live status so published gigs appear in marketplace', async () => {
      gigRepo.countActiveGigsByFreelancer.mockResolvedValue({ count: 2 });
      categoryRepo.getCategoryById.mockResolvedValue({ data: { id: 'cat1' } });
      categoryRepo.getAllTags.mockResolvedValue({ data: [] });
      gigRepo.createGig.mockResolvedValue({ data: { id: 'gig1', status: 'live' } });
      gigRepo.getGigById.mockResolvedValue({ data: { id: 'gig1', status: 'live', ...validData } });

      const result = await gigService.createGig('f1', { ...validData, status: 'live' });

      expect(result.status).toBe('live');
      expect(gigRepo.createGig).toHaveBeenCalledWith(expect.objectContaining({ status: 'live' }));
    });

    it('converts typed skill names into marketplace tags and links them to the gig', async () => {
      gigRepo.countActiveGigsByFreelancer.mockResolvedValue({ count: 2 });
      categoryRepo.getCategoryById.mockResolvedValue({ data: { id: 'cat1' } });
      categoryRepo.getAllTags.mockResolvedValue({
        data: [{ id: 'tag-react', name: 'React', slug: 'react' }],
      });
      categoryRepo.createTag.mockResolvedValue({
        data: { id: 'tag-nextjs', name: 'Next.js', slug: 'next-js' },
      });
      categoryRepo.incrementTagUsage.mockResolvedValue({ data: {} });
      gigRepo.createGig.mockResolvedValue({ data: { id: 'gig1', status: 'live' } });
      gigRepo.addRequiredTag.mockResolvedValue({ data: {} });
      gigRepo.getGigById.mockResolvedValue({ data: { id: 'gig1', status: 'live', ...validData } });

      await gigService.createGig('f1', {
        ...validData,
        status: 'live',
        required_skills: ['React', 'Next.js'],
      });

      expect(categoryRepo.createTag).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Next.js',
        slug: 'next-js',
        category_id: 'cat1',
      }));
      expect(gigRepo.addRequiredTag).toHaveBeenCalledWith('gig1', 'tag-react');
      expect(gigRepo.addRequiredTag).toHaveBeenCalledWith('gig1', 'tag-nextjs');
    });

    it('rejects invalid gig status values', async () => {
      await expect(gigService.createGig('f1', { ...validData, status: 'archived' }))
        .rejects.toThrow(ValidationError);
    });
  });

  describe('deactivateGig', () => {
    it('throws ForbiddenError when freelancer does not own the gig', async () => {
      gigRepo.getGigById.mockResolvedValue({ data: { id: 'gig1', freelancer_id: 'f1' } });

      await expect(gigService.deactivateGig('gig1', 'f2')).rejects.toThrow(ForbiddenError);
    });
  });

  describe('listGigs', () => {
    it('forwards marketplace search and filter params to repository', async () => {
      gigRepo.getAllGigs.mockResolvedValue({ data: [], count: 0 });

      await gigService.listGigs({
        q: 'react',
        category_id: 'cat1',
        price_min: '100',
        price_max: '500',
        max_delivery_days: '7',
        sort: 'price_asc',
      }, { page: 2, limit: 5 });

      expect(gigRepo.getAllGigs).toHaveBeenCalledWith(expect.objectContaining({
        q: 'react',
        category_id: 'cat1',
        price_min: '100',
        price_max: '500',
        max_delivery_days: '7',
        sort: 'price_asc',
        page: 2,
        limit: 5,
      }));
    });
  });
});
