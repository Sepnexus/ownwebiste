import type { Metadata } from "next";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import CTA from "@/components/sections/CTA";
import PricingClient from "./_components/PricingClient";
import { db, schema } from "@/lib/db";
import { eq, asc } from "drizzle-orm";
import type { PricingPlan } from "@/lib/db/schema";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Subscription plans for Sepnexus managed n8n automation and managed web hosting. USD billing, monthly or yearly.",
};

export const dynamic = "force-dynamic";

// Fallback used when the DB hasn't been migrated/seeded yet (e.g. preview / first build).
const FALLBACK_PLANS: PricingPlan[] = [
  {
    id: "fallback-n8n-starter",
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
    ] as never,
    highlight: false,
    razorpayPlanIdMonthly: null,
    razorpayPlanIdYearly: null,
    sortOrder: 10,
    visible: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "fallback-n8n-pro",
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
    ] as never,
    highlight: true,
    razorpayPlanIdMonthly: null,
    razorpayPlanIdYearly: null,
    sortOrder: 20,
    visible: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "fallback-n8n-dedicated",
    slug: "n8n-dedicated",
    category: "n8n",
    name: "Dedicated",
    tagline: "Your own n8n VPS, queue mode, no shared neighbours.",
    priceMonthlyUsd: 99,
    priceYearlyUsd: 990,
    executionsIncluded: null,
    overageUsdPer1k: null,
    features: [
      "Dedicated VPS, isolated n8n",
      "Queue mode, unlimited workflows",
      "Unlimited executions",
      "99.9% uptime SLA",
      "1:1 onboarding session",
    ] as never,
    highlight: false,
    razorpayPlanIdMonthly: null,
    razorpayPlanIdYearly: null,
    sortOrder: 30,
    visible: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "fallback-saas-launch",
    slug: "saas-launch",
    category: "saas",
    name: "Launch",
    tagline: "Run a single SaaS app on managed infrastructure — your MVP without the ops.",
    priceMonthlyUsd: 39,
    priceYearlyUsd: 390,
    executionsIncluded: null,
    overageUsdPer1k: null,
    features: [
      "1 SaaS application (any stack)",
      "2 GB RAM · 2 vCPU · 40 GB SSD",
      "Managed Postgres (5 GB)",
      "Auto-deploy from Git",
      "Daily off-host backups",
      "Application monitoring + alerts",
      "Email support, business hours",
    ] as never,
    highlight: false,
    razorpayPlanIdMonthly: null,
    razorpayPlanIdYearly: null,
    sortOrder: 10,
    visible: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "fallback-saas-grow",
    slug: "saas-grow",
    category: "saas",
    name: "Grow",
    tagline:
      "For SaaS apps with paying customers — staging, scheduled jobs, more headroom.",
    priceMonthlyUsd: 99,
    priceYearlyUsd: 990,
    executionsIncluded: null,
    overageUsdPer1k: null,
    features: [
      "Up to 3 SaaS applications",
      "8 GB RAM · 4 vCPU · 100 GB SSD",
      "Managed Postgres (25 GB) + Redis",
      "Staging environments + preview deploys",
      "Background workers + scheduled jobs",
      "Cloudflare CDN + DDoS protection",
      "Zero-downtime rolling deploys",
      "Priority support",
    ] as never,
    highlight: true,
    razorpayPlanIdMonthly: null,
    razorpayPlanIdYearly: null,
    sortOrder: 20,
    visible: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "fallback-saas-scale",
    slug: "saas-scale",
    category: "saas",
    name: "Scale",
    tagline:
      "Production SaaS at scale — autoscale, dedicated DB, audit-ready environment.",
    priceMonthlyUsd: 249,
    priceYearlyUsd: 2490,
    executionsIncluded: null,
    overageUsdPer1k: null,
    features: [
      "Unlimited SaaS applications",
      "Auto-scaling app tier (16+ GB pool)",
      "Dedicated Postgres (100 GB) + Redis",
      "Multi-region failover-ready",
      "SOC 2-aligned environment, audit log",
      "VPC isolation + private networking",
      "Sub-1 hr support response, on-call shared",
      "Quarterly architecture review",
    ] as never,
    highlight: false,
    razorpayPlanIdMonthly: null,
    razorpayPlanIdYearly: null,
    sortOrder: 30,
    visible: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default async function PricingPage() {
  let plans: PricingPlan[] = FALLBACK_PLANS;
  try {
    const rows = await db
      .select()
      .from(schema.pricingPlans)
      .where(eq(schema.pricingPlans.visible, true))
      .orderBy(asc(schema.pricingPlans.sortOrder));
    if (rows.length > 0) plans = rows;
  } catch {
    // Use fallbacks; surfaced when DB unreachable.
  }

  return (
    <>
      <Nav />
      <main className="page">
        <div className="page-narrow">
          <span className="page-eyebrow reveal">Pricing — USD only</span>
          <h1 className="page-title reveal">
            Honest plans
            <br />
            <em>that compound.</em>
          </h1>
          <p className="page-lede reveal">
            Built to undercut hosted n8n cloud and most managed-hosting offerings while including
            actual support, deterministic backups and on-call. Editable from the admin panel —
            switch billing periods to compare.
          </p>
          <PricingClient plans={plans} />
        </div>
      </main>
      <CTA />
      <Footer />
    </>
  );
}
