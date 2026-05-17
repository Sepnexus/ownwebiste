export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  if (process.env.RUN_MIGRATIONS_ON_BOOT === "1") {
    const { runMigrations } = await import("./lib/db/migrate");
    try {
      await runMigrations();
    } catch (e) {
      console.error("[instrumentation] migration failed:", e);
      throw e;
    }
  }

  try {
    const { seedAdminIfEmpty } = await import("./lib/seed");
    await seedAdminIfEmpty();
  } catch (e) {
    console.error("[instrumentation] seed failed:", e);
  }
}
