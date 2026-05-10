import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import PlanForm from "../_components/PlanForm";
import { updatePlan } from "../_actions";

export const metadata: Metadata = { title: "Admin · Edit plan" };
export const dynamic = "force-dynamic";

export default async function EditPlanPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const [plan] = await db
    .select()
    .from(schema.pricingPlans)
    .where(eq(schema.pricingPlans.id, id))
    .limit(1);
  if (!plan) notFound();

  return (
    <>
      <Link
        href="/admin/pricing"
        style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--muted)", textDecoration: "none" }}
      >
        ← Pricing
      </Link>
      <h1 style={{ marginTop: 14 }}>Edit · {plan.name}</h1>
      <p className="admin-subtitle">
        Last updated {new Date(plan.updatedAt).toLocaleString()}
      </p>
      <PlanForm plan={plan} action={updatePlan} error={error} />
    </>
  );
}
