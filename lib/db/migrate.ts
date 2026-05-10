import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "./index";
import path from "node:path";

export async function runMigrations() {
  const migrationsFolder = path.join(process.cwd(), "drizzle");
  console.log("[migrate] running migrations from", migrationsFolder);
  await migrate(db, { migrationsFolder });
  console.log("[migrate] done");
}
