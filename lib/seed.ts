import { db, schema } from "./db";
import { hashPassword } from "./auth";
import { sql } from "drizzle-orm";

export async function seedAdminIfEmpty() {
  await seedAdmin();
  await seedPricingPlansIfEmpty();
}

async function seedAdmin() {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.users);
  if (count > 0) return;

  const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "";
  if (!email || !password) {
    console.log("[seed] skipping admin seed: ADMIN_EMAIL/ADMIN_PASSWORD not set");
    return;
  }

  const passwordHash = await hashPassword(password);
  await db.insert(schema.users).values({
    email,
    passwordHash,
    role: "admin",
    name: "Admin",
    emailVerifiedAt: new Date(),
  });
  console.log(`[seed] admin user created: ${email}`);
}

async function seedPricingPlansIfEmpty() {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.pricingPlans);
  if (count > 0) return;

  await db.insert(schema.pricingPlans).values([
    {
      slug: "n8n-starter",
      category: "n8n",
      name: "Starter",
      tagline: "For solo operators getting started with automation.",
      priceMonthlyUsd: 12,
      priceYearlyUsd: 120,
      executionsIncluded: 5_000,
      overageUsdPer1k: 2,
      features: [
        "Account on Sepnexus shared n8n",
        "5,000 executions / month",
        "5 active workflows",
        "Email support",
        "Daily backups",
      ],
      sortOrder: 10,
    },
    {
      slug: "n8n-pro",
      category: "n8n",
      name: "Pro",
      tagline: "For teams running production automations.",
      priceMonthlyUsd: 35,
      priceYearlyUsd: 350,
      executionsIncluded: 25_000,
      overageUsdPer1k: 1,
      features: [
        "Account on Sepnexus shared n8n",
        "25,000 executions / month",
        "25 active workflows",
        "Priority support",
        "Custom domain",
        "Webhook authentication",
      ],
      highlight: true,
      sortOrder: 20,
    },
    {
      slug: "n8n-dedicated",
      category: "n8n",
      name: "Dedicated",
      tagline: "Your own n8n VPS, queue mode, no shared neighbours.",
      priceMonthlyUsd: 99,
      priceYearlyUsd: 990,
      features: [
        "Dedicated VPS, isolated n8n",
        "Queue mode, unlimited workflows",
        "Unlimited executions",
        "99.9% uptime SLA",
        "1:1 onboarding session",
        "Direct Slack channel",
      ],
      sortOrder: 30,
    },
    {
      slug: "hosting-single",
      category: "hosting",
      name: "Single Site",
      tagline: "Park one site on managed infrastructure.",
      priceMonthlyUsd: 6,
      priceYearlyUsd: 60,
      features: [
        "1 site",
        "10 GB SSD storage",
        "100 GB bandwidth / month",
        "Free SSL via Let's Encrypt",
        "Daily backups",
      ],
      sortOrder: 10,
    },
    {
      slug: "hosting-unlimited",
      category: "hosting",
      name: "Unlimited",
      tagline: "Run every site you ship from one plan.",
      priceMonthlyUsd: 19,
      priceYearlyUsd: 190,
      features: [
        "Unlimited sites",
        "100 GB SSD storage",
        "1 TB bandwidth / month",
        "Free SSL via Let's Encrypt",
        "Staging environments",
        "Priority support",
      ],
      highlight: true,
      sortOrder: 20,
    },
  ]);
  console.log("[seed] pricing plans seeded (5 plans)");
}
