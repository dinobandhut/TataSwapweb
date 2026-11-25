import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';

declare global {
  var _postgresPool: Pool | undefined;
}

const shouldUseSslForConnectionString = (connUrl?: string) => {
  if (process.env.DATABASE_SSL === 'false') return false;
  if (process.env.DATABASE_SSL === 'true') return { rejectUnauthorized: false };
  if (!connUrl) return false;
  try {
    const parsed = new URL(connUrl);
    const sslMode = parsed.searchParams.get('sslmode');
    if (sslMode === 'disable') return false;
    if (sslMode === 'require' || sslMode === 'verify-full' || sslMode === 'verify-ca') {
      return { rejectUnauthorized: false };
    }
    // Render Internal DB URLs use short hostnames without dots (e.g. dpg-xxx-a) and do not support SSL;
    // External DB URLs use full hostnames (e.g. dpg-xxx.oregon-postgres.render.com) and require SSL.
    return parsed.hostname.includes('.') && parsed.hostname !== 'localhost'
      ? { rejectUnauthorized: false }
      : false;
  } catch {
    return false;
  }
};

export const createPool = () => {
  if (!global._postgresPool) {
    const useConnectionString = !process.env.SQL_HOST && Boolean(process.env.DATABASE_URL);
    global._postgresPool = new Pool(
      useConnectionString
        ? {
            connectionString: process.env.DATABASE_URL,
            ssl: shouldUseSslForConnectionString(process.env.DATABASE_URL),
            max: 10,
            connectionTimeoutMillis: 15000,
          }
        : {
            host: process.env.SQL_HOST,
            user: process.env.SQL_USER,
            password: process.env.SQL_PASSWORD,
            database: process.env.SQL_DB_NAME,
            max: 10,
            connectionTimeoutMillis: 15000,
          }
    );

    global._postgresPool.on('error', (err) => {
      console.error('Unexpected error on idle SQL pool client:', err);
    });
  }
  return global._postgresPool;
};

const pool = createPool();

export const db = drizzle(pool, { schema });
