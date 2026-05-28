'use strict';

/**
 * server.js — Module 3 Entry Point
 * National Freelance & Skill Verification Platform
 * Module 3: Project & Gig Marketplace REST API
 */

// ── 1. Load environment variables FIRST (before any other import reads process.env)
require('dotenv').config();

// ── 2. Validate all required env vars — throws on startup if anything is missing
const env = require('./src/config/env');

// ── 3. Core dependencies
const express = require('express');
const helmet  = require('helmet');
const cors    = require('cors');
const morgan  = require('morgan');

// ── 4. Middleware
const rateLimiter                    = require('./src/middleware/rateLimiter');
const { sanitizerMiddleware }        = require('./src/middleware/sanitizerMiddleware');
const { errorHandler }               = require('./src/middleware/errorHandler');

// ── 5. Initialise Express app
const app = express();

// ── 6. Security & utility middleware ─────────────────────────────────────────

// Helmet: sets secure HTTP response headers
app.use(helmet());

// CORS
const corsOptions = {
  origin: env.isProduction
    ? (origin, callback) => {
        const allowed = ['http://localhost:3000', 'http://localhost:5173'];
        if (!origin || allowed.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`CORS policy: origin ${origin} not allowed`));
        }
      }
    : true,
  methods      : ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials  : true,
};
app.use(cors(corsOptions));

// Morgan: HTTP request logging
app.use(morgan(env.isProduction ? 'combined' : 'dev'));

// Body parsers (must come before sanitizer)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));

// ── 7. Global middleware: rate limiter + input sanitizer ──────────────────────
// Rate limiter — applied before routes (health check is exempt inside the limiter)
app.use(rateLimiter);

// Sanitizer — strips XSS & SQL injection patterns from req.body / req.query
// Must run AFTER express.json() so the body is already parsed
app.use(sanitizerMiddleware);

// ── 8. Health check route ─────────────────────────────────────────────────────
// No auth required — used by load balancers and monitoring
app.get('/api/v1/health', (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: "ok",
      module: "module3-marketplace",
      version: "1.0.0",
      timestamp: new Date().toISOString()
    }
  });
});

// ── 9. Business routes ────────────────────────────────────────────────────────
// authMiddleware is applied PER ROUTER, not globally.
const categoryRoutes = require('./src/layers/presentation/routes/categoryRoutes');
const jobRoutes      = require('./src/layers/presentation/routes/jobRoutes');
const bidRoutes      = require('./src/layers/presentation/routes/bidRoutes');
const gigRoutes      = require('./src/layers/presentation/routes/gigRoutes');
const projectRoutes  = require('./src/layers/presentation/routes/projectRoutes');
const searchRoutes   = require('./src/layers/presentation/routes/searchRoutes');
const module4Routes  = require('./src/layers/presentation/routes/module4Routes');

app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/jobs',       jobRoutes);
app.use('/api/v1/bids',       bidRoutes);
app.use('/api/v1/gigs',       gigRoutes);
app.use('/api/v1/projects',   projectRoutes);
app.use('/api/v1/search',     searchRoutes);
app.use('/api/v1/internal/module4', module4Routes);

// ── 10. 404 handler — catches any unmatched route ─────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success : false,
    error   : 'Route not found',
    code    : 'NOT_FOUND',
  });
});

// ── 11. Global error handler — MUST be last ───────────────────────────────────
// Receives errors thrown/passed from all routes, services, and middleware above.
app.use(errorHandler);

// ── 12. Start server ──────────────────────────────────────────────────────────
if (require.main === module) {
  const server = app.listen(env.port, () => {
    console.log(`✅  Module 3 API running on port ${env.port} [${env.nodeEnv}]`);
    console.log(`   Health: http://localhost:${env.port}/api/v1/health`);
  });

  // Graceful shutdown on SIGTERM (Docker / process managers)
  process.on('SIGTERM', () => {
    console.log('⚠️  SIGTERM received — shutting down gracefully');
    server.close(() => {
      console.log('🔴  HTTP server closed');
      process.exit(0);
    });
  });
}

module.exports = app; // exported for supertest in integration tests
