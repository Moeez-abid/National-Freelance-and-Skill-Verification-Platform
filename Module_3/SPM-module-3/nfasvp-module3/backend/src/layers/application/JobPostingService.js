'use strict';

/**
 * JobPostingService.js — Application Layer
 * All business logic for job posting lifecycle.
 * Calls repositories only — never imports supabaseClient directly.
 */

const jobRepo      = require('../dataAccess/jobRepository');
const categoryRepo = require('../dataAccess/categoryRepository');
const {
  ValidationError,
  NotFoundError,
  ForbiddenError,
  ConflictError,
} = require('../../middleware/errorHandler');

// ─── HELPERS ──────────────────────────────────────────────────────────────────

/**
 * Validate fields common to both createJob and updateJob.
 * @param {Object} data
 * @throws {ValidationError}
 */
function validateJobFields(data) {
  const errors = [];

  if (data.title !== undefined) {
    if (!data.title || data.title.trim().length === 0) {
      errors.push({ field: 'title', message: 'Title is required' });
    } else if (data.title.length > 255) {
      errors.push({ field: 'title', message: 'Title must not exceed 255 characters' });
    }
  }

  if (data.description !== undefined) {
    if (!data.description || data.description.trim().length === 0) {
      errors.push({ field: 'description', message: 'Description is required' });
    }
  }

  if (data.budget_min !== undefined && data.budget_min !== null) {
    if (isNaN(data.budget_min) || Number(data.budget_min) < 0) {
      errors.push({ field: 'budget_min', message: 'budget_min must be a non-negative number' });
    }
  }

  if (data.budget_max !== undefined && data.budget_max !== null) {
    if (isNaN(data.budget_max) || Number(data.budget_max) < 0) {
      errors.push({ field: 'budget_max', message: 'budget_max must be a non-negative number' });
    }
    if (
      data.budget_min !== undefined &&
      data.budget_min !== null &&
      Number(data.budget_max) < Number(data.budget_min)
    ) {
      errors.push({ field: 'budget_max', message: 'budget_max must be greater than or equal to budget_min' });
    }
  }

  if (data.expires_at !== undefined && data.expires_at !== null) {
    const deadline = new Date(data.expires_at);
    if (isNaN(deadline.getTime())) {
      errors.push({ field: 'expires_at', message: 'Invalid date format for expires_at' });
    } else if (deadline <= new Date()) {
      errors.push({ field: 'expires_at', message: 'expires_at must be a future date' });
    }
  }

  if (data.required_skills !== undefined) {
    if (!Array.isArray(data.required_skills)) {
      errors.push({ field: 'required_skills', message: 'required_skills must be an array' });
    }
  }

  if (errors.length > 0) throw new ValidationError('Job validation failed', errors);
}

function normalizeProjectType(projectType) {
  if (!projectType || projectType === 'fixed') return 'fixed_price';
  return projectType;
}

/**
 * Validate and normalise pagination params.
 * @param {{ page?: number, limit?: number }} pagination
 * @returns {{ page: number, limit: number }}
 */
function normalisePagination(pagination = {}) {
  const page  = Math.max(1, parseInt(pagination.page, 10)  || 1);
  const limit = Math.min(50, Math.max(1, parseInt(pagination.limit, 10) || 20));
  return { page, limit };
}

// ─── SERVICE METHODS ──────────────────────────────────────────────────────────

/**
 * Create a new job posting.
 *
 * @param {string} clientId       - Authenticated user ID (from req.user.id)
 * @param {Object} jobData        - { title, description, category_id, project_type,
 *                                    budget_min?, budget_max?, duration_label?,
 *                                    experience_level?, expires_at?, required_skills? }
 * @returns {Promise<Object>}     - Created job record
 * @throws {ValidationError}      - On invalid input
 * @throws {NotFoundError}        - If category_id does not exist
 */
async function createJob(clientId, jobData) {
  // 1. Validate required fields
  const {
    title, description, category_id,
    budget_min, budget_max, duration_label,
    experience_level, expires_at, required_skills,
    project_type = 'fixed_price',
  } = jobData;
  const normalizedProjectType = normalizeProjectType(project_type);

  const errors = [];
  if (!title || title.trim().length === 0)       errors.push({ field: 'title',       message: 'Title is required' });
  if (title && title.length > 255)                errors.push({ field: 'title',       message: 'Title must not exceed 255 characters' });
  if (!description || description.trim().length === 0) errors.push({ field: 'description', message: 'Description is required' });
  if (!category_id)                              errors.push({ field: 'category_id', message: 'Category is required' });

  validateJobFields({ budget_min, budget_max, expires_at, required_skills });

  // 2. Verify category exists
  const { data: category, error: catErr } = await categoryRepo.getCategoryById(category_id);
  if (catErr || !category) throw new NotFoundError('Category');

  // 3. Create the job
  const { data: job, error: jobErr } = await jobRepo.createJob({
    client_id: clientId,
    title:     title.trim(),
    description: description.trim(),
    category_id,
    project_type: normalizedProjectType,
    budget_min:       budget_min  ?? null,
    budget_max:       budget_max  ?? null,
    duration_label:   duration_label   ?? null,
    experience_level: experience_level ?? null,
    expires_at:       expires_at       ?? null,
    status: 'open',
  });

  if (jobErr) throw new Error(`Failed to create job: ${jobErr.message}`);

  // 4. Attach required skills if provided
  if (Array.isArray(required_skills) && required_skills.length > 0) {
    const skills = required_skills.map((s) =>
      typeof s === 'string' ? { tag_id: s } : { tag_id: s.tag_id, level: s.level }
    );
    await jobRepo.addRequiredSkillsToJob(job.id, skills);
  }

  // 5. Return full job record
  const { data: fullJob } = await jobRepo.getJobById(job.id);
  return fullJob;
}

/**
 * Fetch a single job by ID.
 *
 * @param {string} jobId
 * @returns {Promise<Object>} - Job with required_skills and category
 * @throws {NotFoundError}    - If job does not exist
 */
async function getJob(jobId) {
  const { data: job, error } = await jobRepo.getJobById(jobId);
  if (error || !job) throw new NotFoundError('Job');
  return job;
}

/**
 * List marketplace jobs with filters and pagination.
 *
 * @param {Object} filters     - { status?, category_id?, project_type?, budget_min?, budget_max? }
 * @param {Object} pagination  - { page?, limit? }
 * @returns {Promise<{ data: Object[], pagination: Object }>}
 */
async function listJobs(filters = {}, pagination = {}) {
  const { page, limit } = normalisePagination(pagination);
  const { data, error, count } = await jobRepo.getAllJobs({ ...filters, page, limit });
  if (error) throw new Error(`Failed to list jobs: ${error.message}`);

  return {
    data: data || [],
    pagination: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) },
  };
}

/**
 * Update an existing job posting.
 * Only the job's owner (client) may update it, and only while it is 'open'.
 *
 * @param {string} jobId
 * @param {string} clientId  - Must match job.client_id
 * @param {Object} updates
 * @returns {Promise<Object>} - Updated job
 * @throws {NotFoundError}
 * @throws {ForbiddenError}
 * @throws {ConflictError}
 * @throws {ValidationError}
 */
async function updateJob(jobId, clientId, updates) {
  // 1. Fetch and verify ownership
  const { data: job, error } = await jobRepo.getJobById(jobId);
  if (error || !job) throw new NotFoundError('Job');
  if (job.client_id !== clientId) throw new ForbiddenError('You do not own this job');

  // 2. Status guard
  if (job.status !== 'open') {
    throw new ConflictError('Only open jobs can be edited');
  }

  // 3. Validate the subset of fields being updated
  validateJobFields(updates);

  // 4. If category is being changed, verify it exists
  if (updates.category_id) {
    const { data: cat } = await categoryRepo.getCategoryById(updates.category_id);
    if (!cat) throw new NotFoundError('Category');
  }

  // 5. Persist
  const { data: updated, error: updateErr } = await jobRepo.updateJob(jobId, updates);
  if (updateErr) throw new Error(`Failed to update job: ${updateErr.message}`);
  return updated;
}

/**
 * Soft-delete a job by setting status to 'cancelled'.
 * Only the job owner can delete; job must have no accepted bid.
 *
 * @param {string} jobId
 * @param {string} clientId
 * @throws {NotFoundError}
 * @throws {ForbiddenError}
 * @throws {ConflictError}
 */
async function deleteJob(jobId, clientId) {
  const { data: job, error } = await jobRepo.getJobById(jobId);
  if (error || !job) throw new NotFoundError('Job');
  if (job.client_id !== clientId) throw new ForbiddenError('You do not own this job');

  if (job.status === 'in_progress' || job.status === 'completed') {
    throw new ConflictError('Cannot delete a job with an accepted bid');
  }

  await jobRepo.updateJobStatus(jobId, 'cancelled');
}

/**
 * Get paginated jobs posted by a specific client (dashboard view).
 *
 * @param {string} clientId
 * @param {Object} filters    - { status?, page?, limit? }
 * @returns {Promise<{ data: Object[], pagination: Object }>}
 */
async function getClientDashboardJobs(clientId, filters = {}) {
  const { page, limit } = normalisePagination(filters);
  const { data, error, count } = await jobRepo.getJobsByClient(clientId, { ...filters, page, limit });
  if (error) throw new Error(`Failed to fetch client jobs: ${error.message}`);

  return {
    data: data || [],
    pagination: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) },
  };
}

module.exports = {
  createJob,
  getJob,
  listJobs,
  updateJob,
  deleteJob,
  getClientDashboardJobs,
};
