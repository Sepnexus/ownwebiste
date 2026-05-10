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
      slug: "saas-launch",
      category: "saas",
      name: "Launch",
      tagline: "Run a single SaaS app on managed infrastructure — your MVP without the ops.",
      priceMonthlyUsd: 39,
      priceYearlyUsd: 390,
      features: [
        "1 SaaS application (any stack)",
        "2 GB RAM · 2 vCPU · 40 GB SSD",
        "Managed Postgres (5 GB)",
        "Auto-deploy from Git",
        "Daily off-host backups",
        "Application monitoring + alerts",
        "Email support, business hours",
      ],
      sortOrder: 10,
    },
    {
      slug: "saas-grow",
      category: "saas",
      name: "Grow",
      tagline: "For SaaS apps with paying customers — staging, scheduled jobs, more headroom.",
      priceMonthlyUsd: 99,
      priceYearlyUsd: 990,
      features: [
        "Up to 3 SaaS applications",
        "8 GB RAM · 4 vCPU · 100 GB SSD",
        "Managed Postgres (25 GB) + Redis",
        "Staging environments + preview deploys",
        "Background workers + scheduled jobs",
        "Cloudflare CDN + DDoS protection",
        "Zero-downtime rolling deploys",
        "Priority support",
      ],
      highlight: true,
      sortOrder: 20,
    },
    {
      slug: "saas-scale",
      category: "saas",
      name: "Scale",
      tagline: "Production SaaS at scale — autoscale, dedicated DB, audit-ready environment.",
      priceMonthlyUsd: 249,
      priceYearlyUsd: 2490,
      features: [
        "Unlimited SaaS applications",
        "Auto-scaling app tier (16+ GB pool)",
        "Dedicated Postgres (100 GB) + Redis",
        "Multi-region failover-ready",
        "SOC 2-aligned environment, audit log",
        "VPC isolation + private networking",
        "Sub-1 hr support response, on-call shared",
        "Quarterly architecture review",
      ],
      sortOrder: 30,
    },
  ]);
  console.log("[seed] pricing plans seeded");
}
