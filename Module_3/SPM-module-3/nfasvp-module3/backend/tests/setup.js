'use strict';

// Setup file for Jest environment variables
process.env.NODE_ENV = 'test';
process.env.SUPABASE_URL = 'http://localhost:54321';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
process.env.MODULE1_JWT_SECRET = 'test-secret';
process.env.MODULE6_BASE_URL = 'http://localhost:4006';
process.env.MODULE6_API_KEY = 'test-key';
process.env.MODULE7_BASE_URL = 'http://localhost:4007';
process.env.MODULE7_API_KEY = 'test-key';
process.env.MODULE4_API_KEY = 'test-key';
