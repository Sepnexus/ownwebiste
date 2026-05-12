import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { currentUser } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import DashboardShell from "@/components/dashboard/DashboardShell";

export const metadata: Metadata = { title: "Billing" };
export const dynamic = "force-dynamic";

function fmtMoney(cents: number, currency: string) {
  const amount = (cents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${currency === "USD" ? "$" : ""}${amount} ${currency}`;
}

export default async function BillingPage() {
  const user = await currentUser();
  if (!user) redirect("/login?next=/dashboard/billing");
  if (user.role === "admin") redirect("/admin");

  const invoices = await db
    .select({
      inv: schema.invoices,
      plan: schema.pricingPlans,
      sub: schema.subscriptions,
    })
    .from(schema.invoices)
    .leftJoin(schema.subscriptions, eq(schema.subscriptions.id, schema.invoices.subscriptionId))
    .leftJoin(schema.pricingPlans, eq(schema.pricingPlans.id, schema.subscriptions.planId))
    .where(eq(schema.invoices.userId, user.id))
    .orderBy(desc(schema.invoices.createdAt))
    .limit(60);

  return (
    <DashboardShell user={{ email: user.email, name: user.name }}>
      <h1>Billing</h1>
      <p className="lede-row">
        Invoice history and payment status. Payments are processed by Razorpay — we never see
        your card details — and we issue Sepnexus-branded invoices for your records.
      </p>

      {invoices.length === 0 ? (
        <div
          style={{
            border: "1px dashed var(--line-strong)",
            borderRadius: 16,
            padding: "40px 28px",
            textAlign: "center",
            background: "rgba(255,255,255,0.4)",
          }}
        >
          <h3
            style={{
              fontFamily: "var(--serif)",
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: 24,
              margin: "0 0 8px",
              color: "var(--ink)",
            }}
          >
            No invoices yet.
          </h3>
          <p style={{ margin: 0, color: "var(--muted)", fontSize: 14 }}>
            Once you subscribe and your first payment goes through, your invoices will appear
            here.
          </p>
          <Link
            href="/dashboard"
            style={{ display: "inline-block", marginTop: 16, color: "var(--ink)" }}
          >
            ← Back to dashboard
          </Link>
        </div>
      ) : (
        <table className="admin-table" style={{ marginTop: 8 }}>
          <thead>
            <tr>
              <th style={{ width: 160 }}>Date</th>
              <th>Plan</th>
              <th style={{ width: 130 }}>Period</th>
              <th style={{ width: 130 }}>Status</th>
              <th style={{ width: 140, textAlign: "right" }}>Amount</th>
              <th style={{ width: 120, textAlign: "right" }}>Invoice</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(({ inv, plan, sub }) => (
              <tr key={inv.id}>
                <td style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--muted)" }}>
                  {new Date(inv.createdAt).toLocaleDateString()}
                </td>
                <td>{plan?.name ?? "—"}</td>
                <td style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--muted)" }}>
                  {sub?.period ?? "—"}
                </td>
                <td>
                  <span
                    className={`pill ${
                      inv.status === "paid"
                        ? "live"
                        : inv.status === "failed"
                          ? "hidden"
                          : "draft"
                    }`}
                  >
                    {inv.status}
                  </span>
                </td>
                <td style={{ textAlign: "right", fontFamily: "var(--mono)" }}>
                  {fmtMoney(inv.amountCents, inv.currency)}
                </td>
                <td style={{ textAlign: "right" }}>
                  <Link
                    href={`/dashboard/invoices/${inv.id}`}
                    className="btn btn-outline"
                    style={{ padding: "5px 10px", fontSize: 11 }}
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p
        style={{
          fontSize: 12,
          color: "var(--muted)",
          marginTop: 16,
          maxWidth: 720,
          lineHeight: 1.6,
        }}
      >
        Click <strong>View</strong> to open the Sepnexus invoice page where you can download a
        PDF or forward it to your accounts team. Need a different billing name or address on the
        invoice? Reply to your receipt email and we&apos;ll reissue.
      </p>
    </DashboardShell>
  );
}
