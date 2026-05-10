import type { Metadata } from "next";
import Link from "next/link";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import PlanForm from "../_components/PlanForm";
import { createPlan } from "../_actions";

export const metadata: Metadata = { title: "Admin · New plan" };
export const dynamic = "force-dynamic";

export default async function NewPlanPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; customForUserId?: string }>;
}) {
  const { error, customForUserId } = await searchParams;

  let customEmail: string | null = null;
  if (customForUserId) {
    const [u] = await db
      .select({ email: schema.users.email })
      .from(schema.users)
      .where(eq(schema.users.id, customForUserId))
      .limit(1);
    customEmail = u?.email ?? null;
  }

  return (
    <>
      <Link
        href={customForUserId ? `/admin/customers/${customForUserId}` : "/admin/pricing"}
        style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--muted)", textDecoration: "none" }}
      >
        ← {customForUserId ? "Customer" : "Pricing"}
      </Link>
      <h1 style={{ marginTop: 14 }}>{customForUserId ? "New custom plan" : "New plan"}</h1>
      <p className="admin-subtitle">
        {customForUserId
          ? "Tailored for one customer. Hidden from the public /pricing page."
          : "A new subscription tier customers can request."}
      </p>
      <PlanForm
        action={createPlan}
        error={error}
        customForUserId={customForUserId ?? null}
        customForUserEmail={customEmail}
      />
    </>
  );
}
