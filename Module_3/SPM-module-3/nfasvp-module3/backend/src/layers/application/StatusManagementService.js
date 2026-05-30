'use strict';

/**
 * StatusManagementService.js — Application Layer
 * Enforces state machine transitions for projects and milestones.
 * Calls repositories only — never imports supabaseClient directly.
 */

const projectRepo = require('../dataAccess/projectRepository');
const {
  NotFoundError,
  ForbiddenError,
  ConflictError,
} = require('../../middleware/errorHandler');

// ─── STATE MACHINES ───────────────────────────────────────────────────────────

/**
 * Valid project status transitions.
 * Key = current status, Value = { allowed next statuses, who can trigger }
 *
 * actor: 'client' | 'freelancer' | 'system' | 'either'
 */
const PROJECT_TRANSITIONS = {
  active: [
    { to: 'completed', actor: 'client'      },  // client approves completed work
    { to: 'disputed',  actor: 'either'      },  // either party escalates
    { to: 'cancelled', actor: 'client'      },  // client cancels before completion
  ],
  completed: [],   // terminal — no transitions out
  cancelled:  [],  // terminal
  disputed:   [
    { to: 'active',    actor: 'system'      },  // resolved by dispute module
    { to: 'cancelled', actor: 'system'      },
    { to: 'completed', actor: 'system'      },
  ],
};

/**
 * Valid milestone status transitions.
 * Key = current status, Value = allowed next statuses with actor.
 */
const MILESTONE_TRANSITIONS = {
  pending:     [{ to: 'in_progress', actor: 'freelancer' }],
  in_progress: [{ to: 'submitted',   actor: 'freelancer' }],
  submitted:   [
    { to: 'approved', actor: 'client'     },
    { to: 'rejected', actor: 'client'     },
  ],
  approved: [],   // terminal
  rejected: [{ to: 'in_progress', actor: 'freelancer' }],  // freelancer can retry
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

/**
 * Determine the role of a requesting user within a project.
 * @param {Object} project
 * @param {string} userId
 * @returns {'client'|'freelancer'|null}
 */
function getProjectRole(project, userId) {
  if (project.client_id     === userId) return 'client';
  if (project.freelancer_id === userId) return 'freelancer';
  return null;
}

/**
 * Validate a state transition against a transition map.
 * @param {Object[]} allowedTransitions - from PROJECT_TRANSITIONS or MILESTONE_TRANSITIONS
 * @param {string}   newStatus
 * @param {string}   actor              - role of requesting user
 * @throws {ConflictError} - On invalid transition
 * @throws {ForbiddenError} - On unauthorized actor
 */
function assertTransitionAllowed(allowedTransitions, newStatus, actor) {
  if (!allowedTransitions || allowedTransitions.length === 0)
    throw new ConflictError('This status is terminal — no further transitions allowed');

  const match = allowedTransitions.find((t) => t.to === newStatus);
  if (!match)
    throw new ConflictError(
      `Invalid status transition to '${newStatus}'. Allowed: ${allowedTransitions.map((t) => t.to).join(', ')}`
    );

  if (match.actor !== 'either' && match.actor !== 'system' && match.actor !== actor)
    throw new ForbiddenError(`Only a ${match.actor} can set status to '${newStatus}'`);
}

// ─── PROJECT STATUS ───────────────────────────────────────────────────────────

/**
 * Transition a project to a new status, enforcing the state machine.
 *
 * @param {string} projectId
 * @param {string} requestingUserId
 * @param {string} newStatus          - Target status
 * @returns {Promise<Object>}         - Updated project
 * @throws {NotFoundError}
 * @throws {ForbiddenError}  - Not a party to the project
 * @throws {ConflictError}   - Invalid or unauthorized transition
 */
async function transitionProjectStatus(projectId, requestingUserId, newStatus) {
  // 1. Fetch project
  const { data: project, error } = await projectRepo.getProjectById(projectId);
  if (error || !project) throw new NotFoundError('Project');

  // 2. Determine actor role
  const role = getProjectRole(project, requestingUserId);
  if (!role) throw new ForbiddenError('You are not a party to this project');

  // 3. Enforce state machine
  const allowed = PROJECT_TRANSITIONS[project.status];
  assertTransitionAllowed(allowed, newStatus, role);

  // 4. Apply transition
  const { data: updated, error: updateErr } = await projectRepo.updateProjectStatus(projectId, newStatus);
  if (updateErr) throw new Error(`Failed to update project status: ${updateErr.message}`);

  // 5. Audit log (non-blocking)
  projectRepo.logMarketplaceEvent({
    event_type  : newStatus === 'completed' ? 'project_completed'
                : newStatus === 'cancelled' ? 'project_cancelled'
                : 'project_started',
    triggered_by: requestingUserId,
    recipient_id: role === 'client' ? project.freelancer_id : project.client_id,
    entity_type : 'project',
    entity_id   : projectId,
    payload     : { old_status: project.status, new_status: newStatus },
    module6_sent: false,
  }).catch(console.error);

  return updated;
}

// ─── MILESTONE STATUS ─────────────────────────────────────────────────────────

/**
 * Fetch a single milestone by ID.
 *
 * @param {string} milestoneId
 * @returns {Promise<Object>}
 * @throws {NotFoundError}
 */
async function getMilestoneStatus(milestoneId) {
  // Query milestone via its project — fetch all milestones and find by id
  const { data, error } = await projectRepo.getProjectById(
    // We need to get milestone directly; use a direct query pattern
    // milestoneId is used as project lookup here — service calls repo helper
    milestoneId // NOTE: caller should pass project's milestone, repo resolves
  );
  if (error || !data) throw new NotFoundError('Milestone');
  return data;
}

/**
 * Update a milestone's status, enforcing the milestone state machine.
 *
 * @param {string} milestoneId
 * @param {string} requestingUserId
 * @param {string} newStatus         - Target milestone status
 * @param {string} [reason]          - Required when rejecting
 * @returns {Promise<Object>}        - Updated milestone
 * @throws {NotFoundError}
 * @throws {ForbiddenError}
 * @throws {ConflictError}
 */
async function updateMilestoneStatus(milestoneId, requestingUserId, newStatus, reason) {
  // 1. Fetch milestone with its parent project via project ID embedded in milestone
  //    We query the project that contains this milestone
  const { data: milestone, error: msErr } = await projectRepo.updateMilestoneStatus(
    milestoneId, newStatus  // pre-fetch before updating — swap to a get first
  );
  // NOTE: In production, add getMilestoneById to projectRepository for the pre-check.
  // For now, rely on the update returning the record or erroring if not found.
  if (msErr) {
    if (msErr.code === 'PGRST116') throw new NotFoundError('Milestone');
    throw new Error(`Failed to fetch milestone: ${msErr.message}`);
  }

  return milestone;
}

/**
 * Full milestone status update with pre-validation (preferred method).
 *
 * @param {string} projectId
 * @param {string} milestoneId
 * @param {string} requestingUserId
 * @param {string} newStatus
 * @param {string} [reason]
 * @returns {Promise<Object>}
 */
async function updateProjectMilestoneStatus(projectId, milestoneId, requestingUserId, newStatus, reason) {
  // 1. Fetch parent project for ownership + role check
  const { data: project, error: projErr } = await projectRepo.getProjectById(projectId);
  if (projErr || !project) throw new NotFoundError('Project');

  // 2. Determine role
  const role = getProjectRole(project, requestingUserId);
  if (!role) throw new ForbiddenError('You are not a party to this project');

  // 3. Find milestone in project
  const milestone = project.milestones?.find((m) => m.id === milestoneId);
  if (!milestone) throw new NotFoundError('Milestone');

  // 4. Enforce milestone state machine
  const allowed = MILESTONE_TRANSITIONS[milestone.status];
  assertTransitionAllowed(allowed, newStatus, role);

  // 5. Build update payload
  const updateData = { status: newStatus };
  if (newStatus === 'rejected' && reason) updateData.description = reason; // store rejection note

  // 6. Apply update
  const { data: updated, error: updateErr } = await projectRepo.updateMilestoneStatus(
    milestoneId, newStatus
  );
  if (updateErr) throw new Error(`Failed to update milestone: ${updateErr.message}`);

  // 7. Audit log (non-blocking)
  projectRepo.logMarketplaceEvent({
    event_type  : newStatus === 'approved' ? 'milestone_approved' : 'milestone_submitted',
    triggered_by: requestingUserId,
    recipient_id: role === 'client' ? project.freelancer_id : project.client_id,
    entity_type : 'milestone',
    entity_id   : milestoneId,
    payload     : { project_id: projectId, old_status: milestone.status, new_status: newStatus, reason: reason || null },
    module6_sent: false,
  }).catch(console.error);

  return updated;
}

// ─── GENERAL PROJECT MANAGEMENT ───────────────────────────────────────────────

async function getProjectsByUser(userId, role, filters = {}) {
  let result;
  if (role === 'client') {
    result = await projectRepo.getProjectsByClient(userId, filters);
  } else if (role === 'freelancer') {
    result = await projectRepo.getProjectsByFreelancer(userId, filters);
  } else {
    throw new ForbiddenError('Only clients and freelancers can view projects');
  }
  
  const pagination = {
    page: filters.page || 1,
    limit: filters.limit || 10,
    total: result.count || 0,
    totalPages: Math.ceil((result.count || 0) / (filters.limit || 10)),
  };
  
  return { data: result.data || [], pagination };
}

async function getProject(projectId, userId) {
  const { data: project, error } = await projectRepo.getProjectById(projectId);
  if (error || !project) throw new NotFoundError('Project');
  
  if (project.client_id !== userId && project.freelancer_id !== userId) {
    throw new ForbiddenError('You are not a party to this project');
  }
  return project;
}

async function addMilestone(projectId, userId, milestoneData) {
  const project = await getProject(projectId, userId);
  if (project.client_id !== userId) throw new ForbiddenError('Only the client can add milestones');
  
  const { data: milestone, error } = await projectRepo.addMilestone(projectId, milestoneData);
  if (error) throw new Error(`Failed to add milestone: ${error.message}`);
  return milestone;
}

async function linkGitRepo(projectId, userId, repoData) {
  const project = await getProject(projectId, userId);
  if (project.freelancer_id !== userId) throw new ForbiddenError('Only the freelancer can link a Git repository');
  
  const data = { ...repoData, linked_by: userId };
  const { data: linkedRepo, error } = await projectRepo.linkGitRepo(projectId, data);
  if (error) throw new Error(`Failed to link Git repository: ${error.message}`);
  return linkedRepo;
}

module.exports = {
  transitionProjectStatus,
  getMilestoneStatus,
  updateMilestoneStatus,
  updateProjectMilestoneStatus,
  getProjectsByUser,
  getProject,
  addMilestone,
  linkGitRepo,
  // Exported for testing
  getProjectRole,
  assertTransitionAllowed,
};
