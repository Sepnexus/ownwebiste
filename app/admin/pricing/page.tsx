import type { Metadata } from "next";
import Link from "next/link";
import { db, schema } from "@/lib/db";
import { asc, eq, sql } from "drizzle-orm";
import { deletePlan, toggleVisibility } from "./_actions";
import SyncRazorpay from "./_components/SyncRazorpay";
import ConfirmDelete from "../_components/ConfirmDelete";
import SubmitButton from "../_components/SubmitButton";
import { currencySymbol } from "@/lib/format";

export const metadata: Metadata = { title: "Admin · Pricing" };
export const dynamic = "force-dynamic";

export default async function AdminPricingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const [rows, subCountRows] = await Promise.all([
    db
      .select({
        plan: schema.pricingPlans,
        customForEmail: schema.users.email,
      })
      .from(schema.pricingPlans)
      .leftJoin(schema.users, eq(schema.users.id, schema.pricingPlans.customForUserId))
      .orderBy(asc(schema.pricingPlans.category), asc(schema.pricingPlans.sortOrder)),
    // Subscriptions of ANY status per plan. subscriptions.plan_id is
    // ON DELETE RESTRICT, so a plan with even one (cancelled) sub can't be
    // deleted — the confirm dialog says so up front.
    db
      .select({
        planId: schema.subscriptions.planId,
        n: sql<number>`count(*)::int`,
      })
      .from(schema.subscriptions)
      .groupBy(schema.subscriptions.planId),
  ]);
  const plans = rows.map((r) => ({ ...r.plan, customForEmail: r.customForEmail }));
  const subCounts = new Map(subCountRows.map((r) => [r.planId, r.n]));

  return (
    <>
      <div className="toolbar">
        <div>
          <h1 style={{ marginBottom: 4 }}>Pricing</h1>
          <p className="admin-subtitle" style={{ margin: 0 }}>
            Plans shown on the public /pricing page. Hidden plans stay in the DB but are
            invisible to customers.
          </p>
        </div>
        <Link href="/admin/pricing/new" className="btn btn-solid">
          + New plan
        </Link>
      </div>
      {error && (
        <div className="form-error" role="alert" style={{ marginBottom: 20, maxWidth: 920 }}>
          {error}
        </div>
      )}
      <div
        style={{
          padding: "10px 14px",
          borderRadius: 10,
          background: "linear-gradient(90deg, rgba(177,73,153,0.06), rgba(43,182,224,0.06))",
          border: "1px solid var(--line)",
          fontSize: 13,
          color: "var(--ink-2)",
          marginBottom: 24,
        }}
      >
        <strong style={{ color: "var(--ink)" }}>Custom plans?</strong> Open the{" "}
        <Link href="/admin/customers" style={{ color: "var(--ink)" }}>
          customer
        </Link>{" "}
        you want to issue a private plan to and use the &ldquo;Custom plans&rdquo; section on
        their detail page. Custom plans are visible only on that customer&apos;s dashboard,
        never on the public site.
      </div>

      {plans.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>No plans yet. Create one to get started.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: 90 }}>Category</th>
              <th>Plan</th>
              <th style={{ width: 130, textAlign: "right" }}>Monthly</th>
              <th style={{ width: 130, textAlign: "right" }}>Yearly</th>
              <th style={{ width: 100 }}>Status</th>
              <th style={{ width: 130 }}>Razorpay</th>
              <th style={{ width: 320, textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((p) => {
              const subCount = subCounts.get(p.id) ?? 0;
              return (
                <tr key={p.id}>
                  <td>
                    <span className="pill">{p.category}</span>
                  </td>
                  <td>
                    <Link
                      href={`/admin/pricing/${p.id}`}
                      style={{ color: "var(--ink)", textDecoration: "none" }}
                    >
                      <strong>{p.name}</strong>{" "}
                      <span style={{ color: "var(--muted)", fontFamily: "var(--mono)", fontSize: 12 }}>
                        {p.slug}
                      </span>
                    </Link>
                    {p.highlight && (
                      <span className="pill" style={{ marginLeft: 8, color: "var(--ink)", background: "var(--c-yellow)", borderColor: "var(--c-yellow)" }}>
                        Featured
                      </span>
                    )}
                    {p.customForUserId && (
                      <span
                        className="pill"
                        style={{
                          marginLeft: 8,
                          color: "var(--c-magenta-ink)",
                          borderColor: "var(--c-magenta)",
                        }}
                        title={`Custom plan visible only to ${p.customForEmail ?? p.customForUserId}`}
                      >
                        Custom · {p.customForEmail?.split("@")[0] ?? "user"}
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: "right", fontFamily: "var(--mono)" }}>
                    {currencySymbol(p.currency)}{p.priceMonthlyUsd.toLocaleString()} {p.currency}
                  </td>
                  <td style={{ textAlign: "right", fontFamily: "var(--mono)" }}>
                    {currencySymbol(p.currency)}{p.priceYearlyUsd.toLocaleString()} {p.currency}
                  </td>
                  <td>
                    {p.visible ? (
                      <span className="pill live">Live</span>
                    ) : (
                      <span className="pill hidden">Hidden</span>
                    )}
                  </td>
                  <td>
                    {p.razorpayPlanIdMonthly && p.razorpayPlanIdYearly ? (
                      <span className="pill live">Synced</span>
                    ) : p.razorpayPlanIdMonthly || p.razorpayPlanIdYearly ? (
                      <span className="pill draft">Partial</span>
                    ) : (
                      <span className="pill draft">Not synced</span>
                    )}
                  </td>
                  <td>
                    <div className="row-actions">
                      <SyncRazorpay planId={p.id} />
                      <form action={toggleVisibility}>
                        <input type="hidden" name="id" value={p.id} />
                        <SubmitButton
                          className="btn btn-outline"
                          style={{ padding: "6px 10px", fontSize: 12 }}
                          pendingLabel={p.visible ? "Hiding…" : "Showing…"}
                        >
                          {p.visible ? "Hide" : "Show"}
                        </SubmitButton>
                      </form>
                      <Link
                        href={`/admin/pricing/${p.id}`}
                        className="btn btn-outline"
                        style={{ padding: "6px 10px", fontSize: 12 }}
                      >
                        Edit
                      </Link>
                      {subCount > 0 ? (
                        <ConfirmDelete
                          blocked
                          triggerLabel="Delete"
                          triggerStyle={{ padding: "6px 10px", fontSize: 12 }}
                          title={`Plan “${p.name}” can’t be deleted`}
                        >
                          {subCount === 1
                            ? "1 subscription (counting cancelled and expired ones) still points"
                            : `${subCount.toLocaleString()} subscriptions (counting cancelled and expired ones) still point`}{" "}
                          at this plan, so the database won&apos;t remove it.{" "}
                          {p.visible ? (
                            <>
                              Use <strong>Hide</strong> instead: new customers stop seeing it,
                              and existing subscribers keep their subscription and billing
                              unchanged.
                            </>
                          ) : (
                            <>
                              It&apos;s already hidden, so new customers can&apos;t pick it.
                              Existing subscribers keep their subscription and billing
                              unchanged.
                            </>
                          )}
                        </ConfirmDelete>
                      ) : (
                        <ConfirmDelete
                          action={deletePlan}
                          fields={{ id: p.id }}
                          triggerLabel="Delete"
                          triggerStyle={{ padding: "6px 10px", fontSize: 12 }}
                          title={`Delete plan “${p.name}”?`}
                          confirmLabel="Delete plan"
                        >
                          No customer has ever subscribed to it, so no one is affected.
                          {p.visible
                            ? p.customForUserId
                              ? " It disappears from the customer’s dashboard right away."
                              : " It disappears from the public /pricing page right away."
                            : ""}{" "}
                          This can&apos;t be undone.
                        </ConfirmDelete>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </>
  );
}
