import type { Metadata } from "next";
import Link from "next/link";
import { db, schema } from "@/lib/db";
import { asc } from "drizzle-orm";
import { deletePlan, toggleVisibility } from "./_actions";

export const metadata: Metadata = { title: "Admin · Pricing" };
export const dynamic = "force-dynamic";

export default async function AdminPricingPage() {
  const plans = await db
    .select()
    .from(schema.pricingPlans)
    .orderBy(asc(schema.pricingPlans.category), asc(schema.pricingPlans.sortOrder));

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
              <th style={{ width: 220, textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((p) => (
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
                    <span className="pill" style={{ marginLeft: 8, color: "var(--c-yellow)", borderColor: "var(--c-yellow)" }}>
                      Featured
                    </span>
                  )}
                </td>
                <td style={{ textAlign: "right", fontFamily: "var(--mono)" }}>
                  ${p.priceMonthlyUsd}
                </td>
                <td style={{ textAlign: "right", fontFamily: "var(--mono)" }}>
                  ${p.priceYearlyUsd}
                </td>
                <td>
                  {p.visible ? (
                    <span className="pill live">Live</span>
                  ) : (
                    <span className="pill hidden">Hidden</span>
                  )}
                </td>
                <td>
                  <div className="row-actions">
                    <form action={toggleVisibility}>
                      <input type="hidden" name="id" value={p.id} />
                      <button type="submit" className="btn btn-outline" style={{ padding: "6px 10px", fontSize: 12 }}>
                        {p.visible ? "Hide" : "Show"}
                      </button>
                    </form>
                    <Link
                      href={`/admin/pricing/${p.id}`}
                      className="btn btn-outline"
                      style={{ padding: "6px 10px", fontSize: 12 }}
                    >
                      Edit
                    </Link>
                    <form action={deletePlan}>
                      <input type="hidden" name="id" value={p.id} />
                      <button
                        type="submit"
                        className="btn btn-outline"
                        style={{
                          padding: "6px 10px",
                          fontSize: 12,
                          color: "var(--c-red)",
                          borderColor: "var(--c-red)",
                        }}
                        formNoValidate
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
