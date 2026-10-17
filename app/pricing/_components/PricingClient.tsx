"use client";

import { useState } from "react";
import Link from "next/link";
import type { PricingPlan } from "@/lib/db/schema";
import { currencySymbol, periodSuffix } from "@/lib/format";

const CATEGORY_META: Record<
  string,
  { title: string; subtitle: string; accent: string }
> = {
  n8n: {
    title: "Managed n8n automation",
    subtitle:
      "Built on the world's most flexible automation platform. Choose shared for cost, dedicated for isolation and queue mode.",
    accent: "var(--c-magenta)",
  },
  saas: {
    title: "Managed SaaS hosting",
    subtitle:
      "We deploy and operate the infrastructure your SaaS application runs on — managed databases, monitoring, deploys, on-call. You ship product.",
    accent: "var(--c-cyan)",
  },
  hosting: {
    title: "Managed web hosting",
    subtitle:
      "Websites and web apps hosted, secured and monitored by us — with SSL and updates handled for you.",
    accent: "var(--c-yellow)",
  },
};

const CATEGORY_ORDER = ["n8n", "saas", "hosting"];

function formatPriceWithSymbol(amount: number, currency: string) {
  return `${currencySymbol(currency)}${amount.toLocaleString("en-US")}`;
}

function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** A plan with at least a name AND one non-zero price has enough to render. */
function isRenderable(p: PricingPlan): boolean {
  if (!p.name || !p.name.trim()) return false;
  return (p.priceMonthlyUsd ?? 0) > 0 || (p.priceYearlyUsd ?? 0) > 0;
}

export default function PricingClient({ plans }: { plans: PricingPlan[] }) {
  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");

  // Group by category — but only plans with real content. Empty / partially-
  // configured rows used to render as ghost white cards on the public page.
  const grouped = new Map<string, PricingPlan[]>();
  for (const p of plans) {
    if (!isRenderable(p)) continue;
    if (!grouped.has(p.category)) grouped.set(p.category, []);
    grouped.get(p.category)!.push(p);
  }

  // Render known categories in their preferred order, then ANY other category
  // present in the data (e.g. "Hosting" if admin uses a custom label).
  const knownCategories = CATEGORY_ORDER.filter((c) => grouped.has(c));
  const extraCategories = Array.from(grouped.keys())
    .filter((c) => !CATEGORY_ORDER.includes(c))
    .sort();
  const allCategories = [...knownCategories, ...extraCategories];

  return (
    <>
      <div className="reveal" style={{ display: "flex", justifyContent: "flex-start" }}>
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

      {allCategories.map((category) => {
        const meta = CATEGORY_META[category] ?? {
          title: capitalize(category),
          subtitle: "",
          accent: "var(--ink)",
        };
        const list = (grouped.get(category) ?? []).sort(
          (a, b) => a.sortOrder - b.sortOrder,
        );
        return (
          <section key={category} className="pricing-category reveal">
            <div className="pricing-category-head">
              <h2>{meta.title}</h2>
              <p>{meta.subtitle}</p>
            </div>
            <div className="pricing-grid">
              {list.map((p) => {
                const price =
                  period === "monthly" ? p.priceMonthlyUsd : p.priceYearlyUsd;
                const features = Array.isArray(p.features) ? (p.features as string[]) : [];
                const sym = currencySymbol(p.currency);
                return (
                  <article
                    key={p.id}
                    className={`pricing-card ${p.highlight ? "highlight" : ""}`}
                    style={{ ["--accent" as string]: meta.accent }}
                  >
                    <div className="name">{p.name}</div>
                    {p.tagline && <div className="tagline">{p.tagline}</div>}
                    <div className="price">
                      <span className="amount">{formatPriceWithSymbol(price, p.currency)}</span>
                      <span className="unit">{periodSuffix(period, p.currency)}</span>
                    </div>
                    {p.executionsIncluded != null && (
                      <div className="footer-note">
                        {p.executionsIncluded.toLocaleString("en-US")} executions
                        {p.overageUsdPer1k != null
                          ? ` · then ${sym}${p.overageUsdPer1k} / 1,000`
                          : ""}
                      </div>
                    )}
                    <ul>
                      {features.map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                    <div className="plan-cta">
                      {(period === "monthly" ? p.razorpayPlanIdMonthly : p.razorpayPlanIdYearly) ? (
                        <Link
                          href={`/subscribe?planId=${p.id}&period=${period}`}
                          className={p.highlight ? "btn btn-solid" : "btn btn-outline"}
                        >
                          Subscribe → {sym}{price}
                        </Link>
                      ) : (
                        <Link
                          href={`/contact?type=request_access&plan=${encodeURIComponent(p.slug)}&period=${period}`}
                          className={p.highlight ? "btn btn-solid" : "btn btn-outline"}
                        >
                          Request invite
                        </Link>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}

      <section className="pricing-category reveal">
        <div className="pricing-category-head">
          <h2>Custom builds</h2>
          <p>
            AI agents, integrations, app development. Quoted per scope. Two-week paid pilots,
            production within 60 days.
          </p>
        </div>
        <div
          style={{
            border: "1px solid var(--line)",
            borderRadius: 18,
            padding: 28,
            background: "rgba(255,255,255,0.5)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
            <div>
              <div
                style={{
                  fontFamily: "var(--serif)",
                  fontStyle: "italic",
                  fontSize: 28,
                  color: "var(--ink)",
                }}
              >
                Project, retainer or hybrid
              </div>
              <div style={{ color: "var(--muted)", marginTop: 6, fontSize: 14, maxWidth: "60ch" }}>
                Most engagements start with a fixed-fee discovery, then a build sprint, then a
                managed-operate retainer. We&apos;ll size it after a 30-minute call.
              </div>
            </div>
            <Link href="/contact?type=project_inquiry" className="btn btn-solid">
              Request a quote
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
