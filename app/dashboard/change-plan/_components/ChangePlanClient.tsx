"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { PricingPlan } from "@/lib/db/schema";
import { currencySymbol } from "@/lib/format";

export default function ChangePlanClient({
  subscriptionId,
  currentPlanId,
  currentPeriod,
  plans,
  customerId,
}: {
  subscriptionId: string;
  currentPlanId: string;
  currentPeriod: "monthly" | "yearly";
  plans: PricingPlan[];
  customerId: string;
}) {
  const router = useRouter();
  const [period, setPeriod] = useState<"monthly" | "yearly">(currentPeriod);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function pick(planId: string) {
    if (
      !confirm(
        "Schedule this plan change for your next billing date? You won't be charged today.",
      )
    ) {
      return;
    }
    setError(null);
    setPendingId(planId);
    startTransition(async () => {
      const r = await fetch("/api/billing/change-plan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ subscriptionId, newPlanId: planId, newPeriod: period }),
      });
      const body = (await r.json()) as { ok?: boolean; error?: string };
      if (!r.ok || !body.ok) {
        setError(body.error ?? "Plan change failed.");
        setPendingId(null);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    });
  }

  const filtered = plans.filter(
    (p) => !(p.id === currentPlanId && period === currentPeriod),
  );

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <div className="pricing-toggle" role="group" aria-label="Billing period">
          <button
            type="button"
            aria-pressed={period === "monthly"}
            onClick={() => setPeriod("monthly")}
          >
            Monthly
          </button>
          <button
            type="button"
            aria-pressed={period === "yearly"}
            onClick={() => setPeriod("yearly")}
          >
            Yearly
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            background: "rgba(232, 74, 79, 0.08)",
            border: "1px solid var(--c-red)",
            color: "var(--c-red-ink)",
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

      <div className="pricing-grid">
        {filtered.map((p) => {
          const usd = period === "monthly" ? p.priceMonthlyUsd : p.priceYearlyUsd;
          const sym = currencySymbol(p.currency);
          const synced =
            period === "monthly" ? !!p.razorpayPlanIdMonthly : !!p.razorpayPlanIdYearly;
          const features = Array.isArray(p.features) ? (p.features as string[]) : [];
          const isCustom = p.customForUserId === customerId;
          return (
            <article
              key={p.id}
              className={`pricing-card ${p.highlight ? "highlight" : ""}`}
            >
              {isCustom && (
                <span
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 10,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "var(--c-magenta-ink)",
                    background: "rgba(177,73,153,0.12)",
                    padding: "3px 8px",
                    borderRadius: 999,
                    alignSelf: "flex-start",
                  }}
                >
                  Custom for you
                </span>
              )}
              <div className="name">{p.name}</div>
              {p.tagline && <div className="tagline">{p.tagline}</div>}
              <div className="price">
                <span className="amount">{sym}{usd.toLocaleString()}</span>
                <span className="unit">/ {period === "monthly" ? "month" : "year"} · {p.currency}</span>
              </div>
              <ul>
                {features.slice(0, 8).map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <div className="plan-cta">
                <button
                  type="button"
                  className={p.highlight ? "btn btn-solid" : "btn btn-outline"}
                  style={{ width: "100%", justifyContent: "center" }}
                  onClick={() => pick(p.id)}
                  disabled={!synced || pendingId !== null}
                >
                  {pendingId === p.id
                    ? "Scheduling…"
                    : !synced
                      ? "Coming soon"
                      : "Switch on next renewal"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
