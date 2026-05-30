'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const rootDir = path.resolve(__dirname, '..', '..');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME || 'nfasvp_module3',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  connectionTimeoutMillis: 5000,
});

const summarySql = `
  SELECT 'categories' AS table_name, COUNT(*) AS rows FROM marketplace_categories
  UNION ALL SELECT 'tags', COUNT(*) FROM marketplace_tags
  UNION ALL SELECT 'jobs', COUNT(*) FROM jobs
  UNION ALL SELECT 'job_skills', COUNT(*) FROM job_required_skills
  UNION ALL SELECT 'gigs', COUNT(*) FROM gigs
  UNION ALL SELECT 'gig_tiers', COUNT(*) FROM gig_pricing_tiers
  UNION ALL SELECT 'gig_skills', COUNT(*) FROM gig_required_skills
  UNION ALL SELECT 'bids', COUNT(*) FROM bids
  UNION ALL SELECT 'projects', COUNT(*) FROM projects
  UNION ALL SELECT 'milestones', COUNT(*) FROM project_milestones
`;

async function runSqlFile(relativePath) {
  const filePath = path.join(rootDir, relativePath);
  process.stdout.write(`\nRunning ${relativePath}...\n`);
  await pool.query(fs.readFileSync(filePath, 'utf8'));
}

async function main() {
  try {
    await runSqlFile(path.join('database', 'init.sql'));
    await runSqlFile(path.join('database', 'seed.sql'));

    const { rows } = await pool.query(summarySql);
    process.stdout.write('\nSeed complete. Current row counts:\n');
    for (const row of rows) {
      process.stdout.write(`${row.table_name.padEnd(12)} ${row.rows}\n`);
    }
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error('\nCould not seed the local database.');
  console.error(error.stack || error.message || error);
  process.exit(1);
});
