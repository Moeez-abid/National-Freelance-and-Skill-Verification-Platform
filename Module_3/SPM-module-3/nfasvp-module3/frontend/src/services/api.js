/**
 * api.js — Frontend API Service Layer
 * National Freelance & Skill Verification Platform — Module 3
 *
 * Mirrors the backend's layered architecture:
 *   Presentation  → this file makes HTTP calls (routes)
 *   Application   → consumed by React components (services)
 *   Data Access   → handled by the backend (repositories + Supabase)
 *
 * All requests go through the Vite dev proxy:
 *   /api/v1/* → http://localhost:4003/api/v1/*
 *
 * Authentication:
 *   Pass a JWT (from Module 1 / dev token) via setAuthToken().
 *   The backend validates it with MODULE1_JWT_SECRET.
 */

// Base URL. In dev this defaults to Vite's /api/v1 proxy. In production,
// set VITE_API_BASE_URL when the backend is hosted on another origin.
const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '');

// ── Auth token store ──────────────────────────────────────────────────────────
let _authToken = null;

/**
 * Set the JWT token to be sent with every API request.
 * Call this after the user logs in (Module 1 integration).
 * @param {string|null} token
 */
export function setAuthToken(token) {
  _authToken = token;
  if (token) {
    sessionStorage.setItem('m3_auth_token', token);
  } else {
    sessionStorage.removeItem('m3_auth_token');
  }
}

/**
 * Load token from sessionStorage (persists across hot-reloads in dev).
 */
export function loadStoredToken() {
  const stored = sessionStorage.getItem('m3_auth_token');
  if (stored) _authToken = stored;
  return stored;
}

// ── Core HTTP helper ──────────────────────────────────────────────────────────
/**
 * Wrapped fetch that always:
 *  - attaches the Bearer token
 *  - sends/receives JSON
 *  - throws a descriptive Error on non-2xx responses
 *
 * @param {string} path      - e.g. '/gigs' or '/jobs/123'
 * @param {RequestInit} opts - standard fetch options
 * @returns {Promise<any>}   - parsed JSON body (the `data` field from the API)
 */
async function request(path, opts = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...opts.headers,
  };

  if (_authToken) {
    headers['Authorization'] = `Bearer ${_authToken}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...opts,
    headers,
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    let message = json?.error || json?.message || `API error ${response.status}: ${response.statusText}`;
    if (json?.details) {
      message += " | Details: " + JSON.stringify(json.details);
      console.error("API Validation Errors:", json.details);
    }
    throw new Error(message);
  }

  // Backend wraps responses as { success: true, data: ..., pagination: ... }
  return json;
}

// ─────────────────────────────────────────────────────────────────────────────
// HEALTH
// ─────────────────────────────────────────────────────────────────────────────
/** GET /api/v1/health — Check if the backend is running */
export async function checkHealth() {
  return request('/health');
}

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORIES  (mirrors CategoryService + categoryRoutes)
// ─────────────────────────────────────────────────────────────────────────────
export const categoryApi = {
  /** GET /api/v1/categories — Fetch all active categories (nested tree) */
  getAll: () => request('/categories'),

  /** GET /api/v1/categories/:id — Fetch a single category */
  getById: (id) => request(`/categories/${id}`),

  /** POST /api/v1/categories — Create a category (admin only) */
  create: (body) => request('/categories', { method: 'POST', body: JSON.stringify(body) }),

  /** PUT /api/v1/categories/:id — Update a category (admin only) */
  update: (id, body) => request(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
};

// ─────────────────────────────────────────────────────────────────────────────
// GIGS  (mirrors GigListingService + gigRoutes)
// ─────────────────────────────────────────────────────────────────────────────
export const gigApi = {
  /**
   * GET /api/v1/gigs — List marketplace gigs
   * @param {{ category_id?, min_rating?, is_featured?, page?, limit? }} filters
   */
  list: (filters = {}) => {
    const params = new URLSearchParams(
      Object.fromEntries(Object.entries(filters).filter(([, v]) => v != null && v !== ''))
    );
    return request(`/gigs${params.toString() ? `?${params}` : ''}`);
  },

  /**
   * GET /api/v1/gigs/search — Search gigs
   * @param {string} q
   * @param {{ category_id?, min_rating?, max_delivery_days?, price_min?, price_max?, is_featured?, sort? }} filters
   */
  search: (q, filters = {}) => {
    const params = new URLSearchParams({ q, ...filters });
    return request(`/gigs/search?${params}`);
  },

  /** GET /api/v1/gigs/my-gigs — Get logged-in freelancer's gigs */
  myGigs: (filters = {}) => {
    const params = new URLSearchParams(
      Object.fromEntries(Object.entries(filters).filter(([, v]) => v != null && v !== ''))
    );
    return request(`/gigs/my-gigs${params.toString() ? `?${params}` : ''}`);
  },

  /** GET /api/v1/gigs/:id — Get a specific gig */
  getById: (id) => request(`/gigs/${id}`),

  /** POST /api/v1/gigs — Create a new gig (freelancer only) */
  create: (body) => request('/gigs', { method: 'POST', body: JSON.stringify(body) }),

  /** PUT /api/v1/gigs/:id — Update a gig (freelancer only) */
  update: (id, body) => request(`/gigs/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

  /** DELETE /api/v1/gigs/:id — Deactivate a gig (freelancer only) */
  deactivate: (id) => request(`/gigs/${id}`, { method: 'DELETE' }),

  /** POST /api/v1/gigs/:id/samples — Upload portfolio sample (freelancer only) */
  uploadSample: (gigId, body) =>
    request(`/gigs/${gigId}/samples`, { method: 'POST', body: JSON.stringify(body) }),
};

// ─────────────────────────────────────────────────────────────────────────────
// JOBS  (mirrors JobPostingService + jobRoutes)
// ─────────────────────────────────────────────────────────────────────────────
export const jobApi = {
  /**
   * GET /api/v1/jobs — List marketplace jobs
   * @param {{ status?, category_id?, project_type?, budget_min?, budget_max?, page?, limit? }} filters
   */
  list: (filters = {}) => {
    const params = new URLSearchParams(
      Object.fromEntries(Object.entries(filters).filter(([, v]) => v != null && v !== ''))
    );
    return request(`/jobs${params.toString() ? `?${params}` : ''}`);
  },

  /**
   * GET /api/v1/jobs/search — Search jobs
   * @param {string} q
   * @param {{ category_id?, project_type?, budget_min?, budget_max?, sort? }} filters
   */
  search: (q, filters = {}) => {
    const params = new URLSearchParams({ q, ...filters });
    return request(`/jobs/search?${params}`);
  },

  /** GET /api/v1/jobs/dashboard — Get client's own posted jobs */
  dashboard: (filters = {}) => {
    const params = new URLSearchParams(
      Object.fromEntries(Object.entries(filters).filter(([, v]) => v != null && v !== ''))
    );
    return request(`/jobs/dashboard${params.toString() ? `?${params}` : ''}`);
  },

  /** GET /api/v1/jobs/:id — Get a specific job */
  getById: (id) => request(`/jobs/${id}`),

  /** POST /api/v1/jobs — Create a new job (client only) */
  create: (body) => request('/jobs', { method: 'POST', body: JSON.stringify(body) }),

  /** PUT /api/v1/jobs/:id — Update a job (client only) */
  update: (id, body) => request(`/jobs/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

  /** DELETE /api/v1/jobs/:id — Delete/cancel a job (client only) */
  delete: (id) => request(`/jobs/${id}`, { method: 'DELETE' }),

  /** GET /api/v1/jobs/:id/bids — Get bids on a job (client only) */
  getBids: (jobId) => request(`/jobs/${jobId}/bids`),
};

// ─────────────────────────────────────────────────────────────────────────────
// BIDS  (mirrors BiddingService + bidRoutes)
// ─────────────────────────────────────────────────────────────────────────────
export const bidApi = {
  /** GET /api/v1/bids/my-bids — Get logged-in freelancer's bids */
  myBids: (filters = {}) => {
    const params = new URLSearchParams(
      Object.fromEntries(Object.entries(filters).filter(([, v]) => v != null && v !== ''))
    );
    return request(`/bids/my-bids${params.toString() ? `?${params}` : ''}`);
  },

  /** POST /api/v1/bids — Submit a bid on a job (freelancer only) */
  submit: (body) => request('/bids', { method: 'POST', body: JSON.stringify(body) }),

  /** PUT /api/v1/bids/:id/withdraw — Withdraw a bid (freelancer only) */
  withdraw: (bidId) => request(`/bids/${bidId}/withdraw`, { method: 'PUT' }),

  /** PUT /api/v1/bids/:id/accept — Accept a bid (client only) */
  accept: (bidId, jobId) =>
    request(`/bids/${bidId}/accept`, { method: 'PUT', body: JSON.stringify({ job_id: jobId }) }),

  /** GET /api/v1/bids/:id — Get a specific bid detail */
  getById: (bidId) => request(`/bids/${bidId}`),

  /** PUT /api/v1/bids/:id/reject — Reject a bid (client only) */
  reject: (bidId) => request(`/bids/${bidId}/reject`, { method: 'PUT' }),
};

// ─────────────────────────────────────────────────────────────────────────────
// SEARCH  (mirrors SearchFilterService + searchRoutes)
// ─────────────────────────────────────────────────────────────────────────────
export const searchApi = {
  /** GET /api/v1/search?q=... — Global search across gigs and jobs */
  global: (q, filters = {}) => {
    const params = new URLSearchParams({ q, ...filters });
    return request(`/search?${params}`);
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// PROJECTS  (mirrors projectRoutes)
// ─────────────────────────────────────────────────────────────────────────────
export const projectApi = {
  /** GET /api/v1/projects/:id — Get a specific project */
  getById: (id) => request(`/projects/${id}`),

  /** GET /api/v1/projects — Get logged-in user's projects */
  myProjects: (filters = {}) => {
    const params = new URLSearchParams(
      Object.fromEntries(Object.entries(filters).filter(([, v]) => v != null && v !== ''))
    );
    return request(`/projects${params.toString() ? `?${params}` : ''}`);
  },

  /** POST /api/v1/projects — Create a project */
  create: (body) => request('/projects', { method: 'POST', body: JSON.stringify(body) }),

  /** PUT /api/v1/projects/:id — Update a project */
  update: (id, body) => request(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
};
