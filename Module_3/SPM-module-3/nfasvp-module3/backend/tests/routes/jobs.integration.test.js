'use strict';

const request = require('supertest');
const app = require('../../server'); // The express app

let globalMockUser = { id: 'client1', role: 'client' };

// Mock authMiddleware to control req.user
jest.mock('../../src/middleware/authMiddleware', () => {
  return {
    authMiddleware: jest.fn((req, res, next) => {
      if (req.headers.authorization === 'Bearer invalid') {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }
      if (!req.headers.authorization) {
        return res.status(401).json({ success: false, error: 'Unauthorized: No token provided' });
      }
      // Read from a custom header for testing roles dynamically
      if (req.headers['x-test-role']) {
        req.user = { id: 'test', role: req.headers['x-test-role'] };
      } else {
        req.user = { id: 'client1', role: 'client' };
      }
      next();
    }),
    requireRole: (role) => (req, res, next) => {
      if (req.user && req.user.role === role) {
        return next();
      }
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }
  };
});

// We need to mock the services because we don't have a real DB
jest.mock('../../src/layers/application/JobPostingService');
jest.mock('../../src/layers/application/SearchFilterService');
const jobService = require('../../src/layers/application/JobPostingService');
const searchService = require('../../src/layers/application/SearchFilterService');

describe('Jobs API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('1. POST /api/v1/jobs without Authorization header -> 401', async () => {
    const res = await request(app).post('/api/v1/jobs').send({});
    expect(res.status).toBe(401);
  });

  it('2. POST /api/v1/jobs with valid JWT but role=freelancer -> 403', async () => {
    const res = await request(app)
      .post('/api/v1/jobs')
      .set('Authorization', 'Bearer valid-token')
      .set('x-test-role', 'freelancer')
      .send({});
      
    expect(res.status).toBe(403);
  });

  it('3. POST /api/v1/jobs with valid JWT, role=client, valid body -> 201', async () => {
    // Valid body passing validators
    const validBody = {
      title: 'Need a dev',
      description: 'Build my app',
      category_id: 'e4990924-f7b7-4b1d-8fc3-84729f620bd1', // valid UUID
      budget_min: 100,
      budget_max: 200,
      expires_at: new Date(Date.now() + 86400000).toISOString()
    };

    jobService.createJob.mockResolvedValue({ id: 'job1', ...validBody });

    const res = await request(app)
      .post('/api/v1/jobs')
      .set('Authorization', 'Bearer valid-token')
      .set('x-test-role', 'client')
      .send(validBody);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('job1');
  });

  it('4. GET /api/v1/jobs -> 200 with paginated list', async () => {
    jobService.listJobs.mockResolvedValue({
      data: [{ id: 'job1' }],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 }
    });

    const res = await request(app)
      .get('/api/v1/jobs')
      .set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.meta).toBeDefined();
  });

  it('5. GET /api/v1/jobs/search?q=react -> 200 with results', async () => {
    searchService.searchJobs.mockResolvedValue({
      data: [{ id: 'job2' }],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 }
    });

    const res = await request(app)
      .get('/api/v1/jobs/search?q=react')
      .set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });
});
