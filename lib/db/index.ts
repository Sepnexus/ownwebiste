import { Pool, type PoolConfig } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

declare global {
  var __pgPool: Pool | undefined;
}

function makePool(): Pool {
  const config: PoolConfig = { max: 30 };
  if (process.env.DATABASE_URL) {
    config.connectionString = process.env.DATABASE_URL;
  }
  return new Pool(config);
}

export const pool = global.__pgPool ?? makePool();

if (process.env.NODE_ENV !== "production") {
  global.__pgPool = pool;
}

export const db = drizzle(pool, { schema });
export { schema };
