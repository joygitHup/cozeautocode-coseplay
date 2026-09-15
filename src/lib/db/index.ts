import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

export type AppDb = ReturnType<typeof drizzle<typeof schema>>;

let pool: Pool | null = null;
let db: AppDb | null = null;

/**
 * PostgreSQL + Drizzle 客户端（可选）
 * 设置 DATABASE_URL 后执行: pnpm db:push
 * 计费 store 会自动走 PG，避免多实例 JSON 丢单。
 */
export function createDb(): AppDb | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  if (db) return db;
  pool = new Pool({ connectionString: url });
  db = drizzle(pool, { schema });
  return db;
}

export function isPostgresBillingEnabled(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export * from './schema';
