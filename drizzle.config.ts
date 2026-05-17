import { config } from "dotenv";
import type { Config } from "drizzle-kit";

// Prefer .env.local for dev (matches Next.js convention), fall back to .env.
config({ path: ".env.local" });
config({ path: ".env" });

export default {
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
