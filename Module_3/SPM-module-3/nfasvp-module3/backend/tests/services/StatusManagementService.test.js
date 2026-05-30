'use strict';

const statusService = require('../../src/layers/application/StatusManagementService');
const projectRepo = require('../../src/layers/dataAccess/projectRepository');
const { ConflictError, ForbiddenError, NotFoundError } = require('../../src/middleware/errorHandler');

jest.mock('../../src/layers/dataAccess/projectRepository');

describe('StatusManagementService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('project access and listing', () => {
    it('returns client projects for client role', async () => {
      projectRepo.getProjectsByClient.mockResolvedValue({ data: [{ id: 'p1' }], count: 1 });

      const result = await statusService.getProjectsByUser('client1', 'client', { page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(projectRepo.getProjectsByClient).toHaveBeenCalledWith('client1', { page: 1, limit: 10 });
    });

    it('returns freelancer projects for freelancer role', async () => {
      projectRepo.getProjectsByFreelancer.mockResolvedValue({ data: [{ id: 'p1' }], count: 1 });

      const result = await statusService.getProjectsByUser('free1', 'freelancer', { status: 'active' });

      expect(result.data[0].id).toBe('p1');
      expect(projectRepo.getProjectsByFreelancer).toHaveBeenCalledWith('free1', { status: 'active' });
    });

    it('rejects project listing for unsupported roles', async () => {
      await expect(statusService.getProjectsByUser('admin1', 'admin')).rejects.toThrow(ForbiddenError);
    });

    it('allows project parties to fetch project detail', async () => {
      projectRepo.getProjectById.mockResolvedValue({
        data: { id: 'p1', client_id: 'client1', freelancer_id: 'free1' },
      });

      const project = await statusService.getProject('p1', 'free1');

      expect(project.id).toBe('p1');
    });

    it('blocks unrelated users from project detail', async () => {
      projectRepo.getProjectById.mockResolvedValue({
        data: { id: 'p1', client_id: 'client1', freelancer_id: 'free1' },
      });

      await expect(statusService.getProject('p1', 'other')).rejects.toThrow(ForbiddenError);
    });
  });

  describe('project transitions', () => {
    it('lets client complete an active project', async () => {
      projectRepo.getProjectById.mockResolvedValue({
        data: { id: 'p1', status: 'active', client_id: 'client1', freelancer_id: 'free1' },
      });
      projectRepo.updateProjectStatus.mockResolvedValue({ data: { id: 'p1', status: 'completed' } });
      projectRepo.logMarketplaceEvent.mockResolvedValue({ data: {} });

      const result = await statusService.transitionProjectStatus('p1', 'client1', 'completed');

      expect(result.status).toBe('completed');
      expect(projectRepo.updateProjectStatus).toHaveBeenCalledWith('p1', 'completed');
    });

    it('blocks freelancer from completing an active project', async () => {
      projectRepo.getProjectById.mockResolvedValue({
        data: { id: 'p1', status: 'active', client_id: 'client1', freelancer_id: 'free1' },
      });

      await expect(statusService.transitionProjectStatus('p1', 'free1', 'completed'))
        .rejects.toThrow(ForbiddenError);
    });

    it('rejects transitions out of terminal completed project', async () => {
      projectRepo.getProjectById.mockResolvedValue({
        data: { id: 'p1', status: 'completed', client_id: 'client1', freelancer_id: 'free1' },
      });

      await expect(statusService.transitionProjectStatus('p1', 'client1', 'cancelled'))
        .rejects.toThrow(ConflictError);
    });
  });

  describe('milestones and git repos', () => {
    it('lets client add milestone', async () => {
      projectRepo.getProjectById.mockResolvedValue({
        data: { id: 'p1', client_id: 'client1', freelancer_id: 'free1' },
      });
      projectRepo.addMilestone.mockResolvedValue({ data: { id: 'm1', title: 'Build' } });

      const result = await statusService.addMilestone('p1', 'client1', { title: 'Build', amount: 100 });

      expect(result.id).toBe('m1');
    });

    it('blocks freelancer from adding milestone', async () => {
      projectRepo.getProjectById.mockResolvedValue({
        data: { id: 'p1', client_id: 'client1', freelancer_id: 'free1' },
      });

      await expect(statusService.addMilestone('p1', 'free1', { title: 'Build', amount: 100 }))
        .rejects.toThrow(ForbiddenError);
    });

    it('lets freelancer link git repository', async () => {
      projectRepo.getProjectById.mockResolvedValue({
        data: { id: 'p1', client_id: 'client1', freelancer_id: 'free1' },
      });
      projectRepo.linkGitRepo.mockResolvedValue({ data: { id: 'repo1', repo_url: 'https://github.com/a/b' } });

      const result = await statusService.linkGitRepo('p1', 'free1', { repo_url: 'https://github.com/a/b' });

      expect(result.id).toBe('repo1');
      expect(projectRepo.linkGitRepo).toHaveBeenCalledWith('p1', expect.objectContaining({ linked_by: 'free1' }));
    });

    it('throws NotFoundError when project is missing', async () => {
      projectRepo.getProjectById.mockResolvedValue({ data: null });

      await expect(statusService.getProject('missing', 'client1')).rejects.toThrow(NotFoundError);
    });
  });
});
