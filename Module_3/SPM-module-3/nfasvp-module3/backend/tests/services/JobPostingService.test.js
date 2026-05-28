'use strict';

const jobService = require('../../src/layers/application/JobPostingService');
const jobRepo = require('../../src/layers/dataAccess/jobRepository');
const categoryRepo = require('../../src/layers/dataAccess/categoryRepository');
const { ValidationError, NotFoundError, ForbiddenError, ConflictError } = require('../../src/middleware/errorHandler');

jest.mock('../../src/layers/dataAccess/jobRepository');
jest.mock('../../src/layers/dataAccess/categoryRepository');

describe('JobPostingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createJob', () => {
    const validData = {
      title: 'Valid title',
      description: 'Valid description',
      category_id: 'cat1',
      budget_min: 100,
      budget_max: 200,
      expires_at: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    };

    it('1. createJob — success', async () => {
      categoryRepo.getCategoryById.mockResolvedValue({ data: { id: 'cat1' } });
      jobRepo.createJob.mockResolvedValue({ data: { id: 'job1', ...validData } });
      jobRepo.getJobById.mockResolvedValue({ data: { id: 'job1', ...validData } });

      const result = await jobService.createJob('client1', validData);
      expect(result.id).toBe('job1');
    });

    it('2. createJob — budget_max < budget_min: throws ValidationError', async () => {
      const invalidData = { ...validData, budget_min: 200, budget_max: 100 };
      await expect(jobService.createJob('client1', invalidData)).rejects.toThrow(ValidationError);
    });

    it('3. createJob — expires_at in past: throws ValidationError', async () => {
      const invalidData = { ...validData, expires_at: new Date(Date.now() - 86400000).toISOString() };
      await expect(jobService.createJob('client1', invalidData)).rejects.toThrow(ValidationError);
    });

    it('4. createJob — invalid category_id: throws NotFoundError', async () => {
      categoryRepo.getCategoryById.mockResolvedValue({ data: null });
      await expect(jobService.createJob('client1', validData)).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteJob', () => {
    it('5. deleteJob — client mismatch: throws ForbiddenError', async () => {
      jobRepo.getJobById.mockResolvedValue({ data: { id: 'job1', client_id: 'client1' } });
      await expect(jobService.deleteJob('job1', 'client2')).rejects.toThrow(ForbiddenError);
    });

    it('6. deleteJob — accepted bid exists: throws ConflictError', async () => {
      jobRepo.getJobById.mockResolvedValue({ data: { id: 'job1', client_id: 'client1', status: 'in_progress' } });
      await expect(jobService.deleteJob('job1', 'client1')).rejects.toThrow(ConflictError);
    });
  });
});
