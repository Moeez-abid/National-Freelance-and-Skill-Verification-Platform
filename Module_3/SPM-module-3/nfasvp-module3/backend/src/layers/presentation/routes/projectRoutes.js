'use strict';

const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../../../middleware/authMiddleware');
const projectService = require('../../application/StatusManagementService');
const statusManagementService = require('../../application/StatusManagementService');
const { success } = require('../../../utils/responseFormatter');
const { ForbiddenError } = require('../../../middleware/errorHandler');

// All project routes require authentication
router.use(authMiddleware);

// GET /api/v1/projects - Fetch projects for the logged-in user (filtered by their role)
router.get('/', async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
      page: req.query.page,
      limit: req.query.limit,
    };
    const result = await projectService.getProjectsByUser(req.user.id, req.user.role, filters);
    return success(res, result.data, 200, result.pagination);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/projects/:id - Get specific project by ID
router.get('/:id', async (req, res, next) => {
  try {
    const project = await projectService.getProject(req.params.id, req.user.id);
    return success(res, project);
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/projects/:id/status - Update project status
router.put('/:id/status', async (req, res, next) => {
  try {
    const updatedProject = await projectService.transitionProjectStatus(
      req.params.id,
      req.user.id,
      req.body.status
    );
    return success(res, updatedProject);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/projects/:id/milestones - Fetch milestones for a project
router.get('/:id/milestones', async (req, res, next) => {
  try {
    const project = await projectService.getProject(req.params.id, req.user.id);
    return success(res, project.milestones || []);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/projects/:id/milestones - Add milestone (Client only)
router.post('/:id/milestones', requireRole('client'), async (req, res, next) => {
  try {
    const milestone = await projectService.addMilestone(req.params.id, req.user.id, req.body);
    return success(res, milestone, 201);
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/projects/:id/milestones/:milId/status - Update milestone status
router.put('/:id/milestones/:milId/status', async (req, res, next) => {
  try {
    const updatedMilestone = await projectService.updateProjectMilestoneStatus(
      req.params.id,
      req.params.milId,
      req.user.id,
      req.body.status,
      req.body.reason
    );
    return success(res, updatedMilestone);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/projects/:id/git-repo - Link a Git repository (Freelancer only)
router.post('/:id/git-repo', requireRole('freelancer'), async (req, res, next) => {
  try {
    const linkedRepo = await projectService.linkGitRepo(req.params.id, req.user.id, req.body);
    return success(res, linkedRepo, 201);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
