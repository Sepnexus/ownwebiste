"use client";

import { useState, useTransition } from "react";
import Script from "next/script";
import type { PricingPlan } from "@/lib/db/schema";

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => { open: () => void };
  }
}

type RazorpayCheckoutOptions = {
  key: string;
  subscription_id: string;
  name: string;
  description: string;
  prefill?: { name?: string; email?: string };
  theme?: { color?: string };
  handler?: (resp: {
    razorpay_payment_id: string;
    razorpay_subscription_id: string;
    razorpay_signature: string;
  }) => void;
  modal?: { ondismiss?: () => void };
};

export default function PlansGrid({
  plans,
  customer,
}: {
  plans: PricingPlan[];
  customer: { name: string | null; email: string };
}) {
  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const grouped = new Map<string, PricingPlan[]>();
  for (const p of plans) {
    if (!grouped.has(p.category)) grouped.set(p.category, []);
    grouped.get(p.category)!.push(p);
  }

  function subscribe(plan: PricingPlan) {
    setError(null);
    setPendingPlanId(plan.id);
    startTransition(async () => {
      try {
        const r = await fetch("/api/billing/subscribe", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ planId: plan.id, period }),
        });
        const body = (await r.json()) as {
          ok?: boolean;
          razorpaySubscriptionId?: string;
          razorpayKeyId?: string;
          shortUrl?: string | null;
          error?: string;
        };
        if (!r.ok || !body.ok || !body.razorpaySubscriptionId || !body.razorpayKeyId) {
          setError(body.error ?? "Could not create subscription.");
          setPendingPlanId(null);
          return;
        }

        if (typeof window === "undefined" || !window.Razorpay) {
          // Fallback: open Razorpay's hosted page if the SDK didn't load.
          if (body.shortUrl) {
            window.open(body.shortUrl, "_blank", "noopener");
            setPendingPlanId(null);
            return;
          }
          setError("Razorpay Checkout failed to load. Reload and try again.");
          setPendingPlanId(null);
          return;
        }

        const rzp = new window.Razorpay({
          key: body.razorpayKeyId,
          subscription_id: body.razorpaySubscriptionId,
          name: "Sepnexus",
          description: `${plan.name} (${period})`,
          prefill: { name: customer.name ?? "", email: customer.email },
          theme: { color: "#14110f" },
          handler: () => {
            // Payment succeeded — webhook will reconcile state. Reload to show new state.
            window.location.href = "/dashboard?subscribed=1";
          },
          modal: {
            ondismiss: () => {
              setPendingPlanId(null);
            },
          },
        });
        rzp.open();
      } catch {
        setError("Network error. Please try again.");
        setPendingPlanId(null);
      }
    });
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div style={{ marginBottom: 24 }}>
        <div className="pricing-toggle" role="tablist">
          <button
            role="tab"
            aria-pressed={period === "monthly"}
            onClick={() => setPeriod("monthly")}
          >
            Monthly
          </button>
          <button
            role="tab"
            aria-pressed={period === "yearly"}
            onClick={() => setPeriod("yearly")}
          >
            Yearly <span className="save">~2 months free</span>
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            background: "rgba(232, 74, 79, 0.08)",
            border: "1px solid var(--c-red)",
            color: "var(--c-red)",
            padding: "12px 16px",
            borderRadius: 12,
            marginBottom: 24,
            fontSize: 14,
            maxWidth: 720,
          }}
        >
          {error}
        </div>
      )}

      {Array.from(grouped.entries()).map(([category, list]) => (
        <section key={category} style={{ marginBottom: 40 }}>
          <h2
            style={{
              fontFamily: "var(--serif)",
              fontWeight: 400,
              fontSize: 24,
              letterSpacing: "-0.012em",
              textTransform: "capitalize",
              margin: "0 0 16px",
              color: "var(--ink)",
            }}
          >
            {category === "n8n" ? "Managed n8n automation" : "Managed SaaS hosting"}
          </h2>
          <div className="pricing-grid">
            {list
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((p) => {
                const usd = period === "monthly" ? p.priceMonthlyUsd : p.priceYearlyUsd;
                const features = Array.isArray(p.features) ? (p.features as string[]) : [];
                const synced =
                  period === "monthly"
                    ? !!p.razorpayPlanIdMonthly
                    : !!p.razorpayPlanIdYearly;
                return (
                  <article
                    key={p.id}
                    className={`pricing-card ${p.highlight ? "highlight" : ""}`}
                  >
                    <div className="name">{p.name}</div>
                    {p.tagline && <div className="tagline">{p.tagline}</div>}
                    <div className="price">
                      <span className="amount">${usd.toLocaleString()}</span>
                      <span className="unit">/ {period === "monthly" ? "month" : "year"} · USD</span>
                    </div>
                    {p.executionsIncluded != null && (
                      <div className="footer-note">
                        {p.executionsIncluded.toLocaleString()} executions
                        {p.overageUsdPer1k != null
                          ? ` · then $${p.overageUsdPer1k} / 1,000`
                          : ""}
                      </div>
                    )}
                    <ul>
                      {features.slice(0, 6).map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                    <div className="cta">
                      <button
                        type="button"
                        className={p.highlight ? "btn btn-solid" : "btn btn-outline"}
                        style={{ width: "100%", justifyContent: "center" }}
                        onClick={() => subscribe(p)}
                        disabled={!synced || pendingPlanId === p.id}
                        title={!synced ? "Plan not yet synced to Razorpay" : ""}
                      >
                        {pendingPlanId === p.id
                          ? "Opening checkout…"
                          : !synced
                            ? "Coming soon"
                            : `Subscribe → $${usd}`}
                      </button>
                    </div>
                  </article>
                );
              })}
          </div>
        </section>
      ))}
    </>
  );
}
