import { Pool } from 'pg';

/**
 * Single shared pg.Pool for the entire backend.
 *  - max:20 means up to 20 simultaneous DB queries. Tune based on your
 *    PostgreSQL server's max_connections setting.
 *  - idleTimeoutMillis: connections idle for 30 s are closed to free
 *    server resources without requiring an explicit disconnect everywhere.
 *  - connectionTimeoutMillis: if no connection is free within 5 s the
 *    query throws instead of hanging forever.
 */
let pool: Pool;

export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is not set in environment variables');
    }
    pool = new Pool({
      connectionString,
      max: 20,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
      // ssl: { rejectUnauthorized: false }, // Uncomment for cloud Postgres (e.g. Supabase, Neon)
    });

    pool.on('error', (err) => {
      console.error('[DB POOL] Unexpected error on idle client', err);
    });

    console.log('[DB POOL] PostgreSQL pool created');
  }
  return pool;
}

/**
 * Convenience wrapper – runs a single parameterized query.
 *
 * Usage:
 *   const { rows } = await query('SELECT * FROM users WHERE id = $1', [userId]);
 * Always use parameterized queries ($1, $2 …) to prevent SQL injection.
 */
export async function query(text: string, params?: unknown[]) {
  const start = Date.now();
  const result = await getPool().query(text, params);
  const duration = Date.now() - start;
  console.log(`[DB] query executed in ${duration}ms | rows: ${result.rowCount}`);
  return result;
}

/**
 * Checks the pool can reach the database.
 * Called in main.ts on startup so you know immediately if the DB is unreachable.
 */
export async function testConnection(): Promise<void> {
  const { rows } = await query('SELECT NOW() AS now');
  console.log('[DB] Connected to PostgreSQL. Server time:', rows[0].now);
}
