import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { db, schema } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import SubscribeForm from "./_components/SubscribeForm";

export const metadata: Metadata = { title: "Subscribe" };
export const dynamic = "force-dynamic";

export default async function SubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ planId?: string; period?: string }>;
}) {
  const sp = await searchParams;
  if (!sp.planId) redirect("/pricing");
  const period: "monthly" | "yearly" = sp.period === "yearly" ? "yearly" : "monthly";

  const [plan] = await db
    .select()
    .from(schema.pricingPlans)
    .where(
      and(
        eq(schema.pricingPlans.id, sp.planId),
        eq(schema.pricingPlans.visible, true),
        isNull(schema.pricingPlans.customForUserId),
      ),
    )
    .limit(1);
  if (!plan) notFound();

  const usd = period === "monthly" ? plan.priceMonthlyUsd : plan.priceYearlyUsd;
  const synced =
    period === "monthly" ? plan.razorpayPlanIdMonthly : plan.razorpayPlanIdYearly;
  const features = Array.isArray(plan.features) ? (plan.features as string[]) : [];

  return (
    <>
      <Nav />
      <main className="page">
        <div className="page-narrow">
          <Link
            href="/pricing"
            style={{
              fontFamily: "var(--mono)",
              fontSize: 12,
              color: "var(--muted)",
              textDecoration: "none",
            }}
          >
            ← All plans
          </Link>
          <span className="page-eyebrow reveal" style={{ marginTop: 14 }}>
            Subscribe — secure checkout via Razorpay
          </span>
          <h1 className="page-title reveal">
            Start your <em>{plan.name}</em>
            <br />
            subscription.
          </h1>
          <p className="page-lede reveal">
            Pay once with Razorpay. Your account materialises automatically — we&apos;ll email
            you a one-time link to set a password and access your dashboard.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 28,
              marginTop: 32,
            }}
            className="subscribe-grid"
          >
            {/* Plan summary */}
            <div
              className={`pricing-card ${plan.highlight ? "highlight" : ""}`}
              style={{ marginTop: 0 }}
            >
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 11,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                }}
              >
                {plan.category}
              </div>
              <div className="name" style={{ marginTop: 4 }}>
                {plan.name}
              </div>
              {plan.tagline && <div className="tagline">{plan.tagline}</div>}
              <div className="price">
                <span className="amount">${usd.toLocaleString()}</span>
                <span className="unit">
                  / {period === "monthly" ? "month" : "year"} · USD
                </span>
              </div>
              {plan.executionsIncluded != null && (
                <div className="footer-note">
                  {plan.executionsIncluded.toLocaleString()} executions
                  {plan.overageUsdPer1k != null
                    ? ` · then $${plan.overageUsdPer1k} / 1,000`
                    : ""}
                </div>
              )}
              <ul>
                {features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <p
                style={{
                  marginTop: 12,
                  fontSize: 12,
                  color: "var(--muted)",
                  fontFamily: "var(--mono)",
                  letterSpacing: "0.04em",
                }}
              >
                Switch period? <Link href={`/subscribe?planId=${plan.id}&period=${period === "monthly" ? "yearly" : "monthly"}`} style={{ color: "var(--ink)" }}>{period === "monthly" ? "View yearly" : "View monthly"}</Link>
              </p>
            </div>

            {/* Form */}
            <div>
              {!synced ? (
                <div
                  style={{
                    border: "1px solid var(--c-orange)",
                    background: "rgba(238,126,45,0.06)",
                    color: "var(--c-orange)",
                    padding: "16px 18px",
                    borderRadius: 14,
                    fontSize: 14,
                  }}
                >
                  This plan isn&apos;t configured for billing yet. Please{" "}
                  <Link href="/contact?type=request_access" style={{ color: "var(--ink)" }}>
                    contact us
                  </Link>{" "}
                  and we&apos;ll set it up.
                </div>
              ) : (
                <SubscribeForm
                  planId={plan.id}
                  planName={plan.name}
                  period={period}
                  amountUsd={usd}
                />
              )}

              <p
                style={{
                  marginTop: 18,
                  fontSize: 12,
                  color: "var(--muted)",
                  lineHeight: 1.6,
                }}
              >
                Already have an account?{" "}
                <Link href="/login" style={{ color: "var(--ink)" }}>
                  Sign in →
                </Link>
                <br />
                Cards are processed by Razorpay. Sepnexus never sees your payment details.
                You can cancel anytime from your dashboard. By subscribing you agree to our{" "}
                <Link href="/legal/terms" style={{ color: "var(--ink-2)" }}>
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="/legal/privacy" style={{ color: "var(--ink-2)" }}>
                  Privacy
                </Link>{" "}
                policy.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
