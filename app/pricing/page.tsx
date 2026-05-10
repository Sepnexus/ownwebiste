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
    id: "fallback-hosting-single",
    slug: "hosting-single",
    category: "hosting",
    name: "Single Site",
    tagline: "Park one site on managed infrastructure.",
    priceMonthlyUsd: 6,
    priceYearlyUsd: 60,
    executionsIncluded: null,
    overageUsdPer1k: null,
    features: [
      "1 site",
      "10 GB SSD storage",
      "100 GB bandwidth / month",
      "Free SSL via Let's Encrypt",
      "Daily backups",
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
    id: "fallback-hosting-unlimited",
    slug: "hosting-unlimited",
    category: "hosting",
    name: "Unlimited",
    tagline: "Run every site you ship from one plan.",
    priceMonthlyUsd: 19,
    priceYearlyUsd: 190,
    executionsIncluded: null,
    overageUsdPer1k: null,
    features: [
      "Unlimited sites",
      "100 GB SSD storage",
      "1 TB bandwidth / month",
      "Free SSL via Let's Encrypt",
      "Staging environments",
    ] as never,
    highlight: true,
    razorpayPlanIdMonthly: null,
    razorpayPlanIdYearly: null,
    sortOrder: 20,
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
