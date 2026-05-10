import type { Metadata } from "next";
import Link from "next/link";
import PlanForm from "../_components/PlanForm";
import { createPlan } from "../_actions";

export const metadata: Metadata = { title: "Admin · New plan" };
export const dynamic = "force-dynamic";

export default async function NewPlanPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <>
      <Link
        href="/admin/pricing"
        style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--muted)", textDecoration: "none" }}
      >
        ← Pricing
      </Link>
      <h1 style={{ marginTop: 14 }}>New plan</h1>
      <p className="admin-subtitle">A new subscription tier customers can request.</p>
      <PlanForm action={createPlan} error={error} />
    </>
  );
}
