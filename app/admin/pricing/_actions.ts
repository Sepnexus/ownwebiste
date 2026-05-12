"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { ensureRazorpayPlanId } from "@/lib/billing";

/**
 * Push the plan's monthly + yearly prices to Razorpay so it has plan IDs ready
 * for checkout. Idempotent — ensureRazorpayPlanId only calls Razorpay if the
 * id is missing. Failures are swallowed (logged + returned) so a Razorpay outage
 * doesn't roll back the DB write; the admin can retry via the "Sync to Razorpay"
 * button on the plan page.
 */
async function syncPlanToRazorpay(
  planId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const [plan] = await db
    .select()
    .from(schema.pricingPlans)
    .where(eq(schema.pricingPlans.id, planId))
    .limit(1);
  if (!plan) return { ok: false, error: "Plan not found" };
  try {
    if (plan.priceMonthlyUsd > 0) await ensureRazorpayPlanId(plan, "monthly");
    if (plan.priceYearlyUsd > 0) await ensureRazorpayPlanId(plan, "yearly");
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Razorpay sync failed";
    console.warn(`[pricing] auto-sync failed for ${planId}: ${msg}`);
    return { ok: false, error: msg };
  }
}

const PlanInput = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/, "lowercase letters, numbers and dashes only"),
  category: z.string().trim().min(1).max(40),
  name: z.string().trim().min(1).max(80),
  tagline: z.string().trim().max(240).optional().nullable(),
  priceMonthlyUsd: z.coerce.number().int().min(0).max(100_000),
  priceYearlyUsd: z.coerce.number().int().min(0).max(1_000_000),
  executionsIncluded: z.coerce.number().int().min(0).max(100_000_000).optional().nullable(),
  overageUsdPer1k: z.coerce.number().int().min(0).max(10_000).optional().nullable(),
  features: z.string(), // newline-separated, parsed to array
  highlight: z.coerce.boolean().optional(),
  visible: z.coerce.boolean().optional(),
  sortOrder: z.coerce.number().int().default(0),
  razorpayPlanIdMonthly: z.string().trim().max(120).optional().nullable(),
  razorpayPlanIdYearly: z.string().trim().max(120).optional().nullable(),
  customForUserId: z.string().uuid().optional().nullable(),
  currency: z.enum(["USD", "INR"]).optional(),
});

function normalize(formData: FormData) {
  const raw = Object.fromEntries(formData) as Record<string, FormDataEntryValue>;
  const obj: Record<string, unknown> = { ...raw };
  obj.highlight = formData.get("highlight") === "on";
  obj.visible = formData.get("visible") === "on";
  obj.tagline = (raw.tagline as string)?.trim() || null;
  obj.executionsIncluded = raw.executionsIncluded === "" ? null : raw.executionsIncluded;
  obj.overageUsdPer1k = raw.overageUsdPer1k === "" ? null : raw.overageUsdPer1k;
  obj.razorpayPlanIdMonthly =
    (raw.razorpayPlanIdMonthly as string)?.trim() || null;
  obj.razorpayPlanIdYearly = (raw.razorpayPlanIdYearly as string)?.trim() || null;
  const cfu = (raw.customForUserId as string)?.trim();
  obj.customForUserId = cfu && cfu.length > 0 ? cfu : null;
  return obj;
}

function bail(path: string, error: string): never {
  redirect(`${path}?error=${encodeURIComponent(error)}`);
}

function featuresFromText(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

export async function createPlan(formData: FormData) {
  const admin = await requireAdmin();
  const parsed = PlanInput.safeParse(normalize(formData));
  if (!parsed.success) bail("/admin/pricing/new", parsed.error.issues[0]?.message ?? "Invalid input");

  const features = featuresFromText(parsed.data.features);

  let createdPlanId: string | null = null;
  try {
    const [row] = await db
      .insert(schema.pricingPlans)
      .values({
        slug: parsed.data.slug,
        category: parsed.data.category,
        name: parsed.data.name,
        tagline: parsed.data.tagline ?? null,
        priceMonthlyUsd: parsed.data.priceMonthlyUsd,
        priceYearlyUsd: parsed.data.priceYearlyUsd,
        executionsIncluded: parsed.data.executionsIncluded ?? null,
        overageUsdPer1k: parsed.data.overageUsdPer1k ?? null,
        features,
        highlight: parsed.data.highlight ?? false,
        visible: parsed.data.visible ?? true,
        sortOrder: parsed.data.sortOrder,
        razorpayPlanIdMonthly: parsed.data.razorpayPlanIdMonthly ?? null,
        razorpayPlanIdYearly: parsed.data.razorpayPlanIdYearly ?? null,
        customForUserId: parsed.data.customForUserId ?? null,
        currency: parsed.data.currency ?? "USD",
      })
      .returning({ id: schema.pricingPlans.id });
    createdPlanId = row.id;
  } catch (e) {
    const msg = (e as Error).message ?? "";
    if (msg.includes("pricing_plans_slug_uniq") || msg.includes("duplicate")) {
      bail("/admin/pricing/new", `A plan with slug "${parsed.data.slug}" already exists.`);
    }
    bail("/admin/pricing/new", `Failed to create plan: ${msg}`);
  }

  // Push to Razorpay immediately so the plan is ready for checkout. Failure
  // here doesn't roll back — the plan still exists, admin can retry via the
  // "Sync to Razorpay" button. But we DO surface the error to the redirect.
  let syncErr: string | null = null;
  if (createdPlanId) {
    const result = await syncPlanToRazorpay(createdPlanId);
    if (!result.ok) syncErr = result.error;
  }

  void audit({
    actor: { userId: admin.id, email: admin.email },
    action: "plan.create",
    targetType: "pricing_plan",
    targetId: createdPlanId ?? undefined,
    details: {
      slug: parsed.data.slug,
      name: parsed.data.name,
      currency: parsed.data.currency ?? "USD",
      customForUserId: parsed.data.customForUserId ?? null,
      razorpaySyncOk: !syncErr,
      razorpaySyncError: syncErr,
    },
  });

  revalidatePath("/admin/pricing");
  revalidatePath("/pricing");
  if (parsed.data.customForUserId) {
    revalidatePath(`/admin/customers/${parsed.data.customForUserId}`);
    const flag = syncErr
      ? `error=${encodeURIComponent(`Custom plan saved, but Razorpay sync failed: ${syncErr}. Use the Sync button on the plan page.`)}`
      : `ok=${encodeURIComponent("Custom plan created and synced to Razorpay.")}`;
    redirect(`/admin/customers/${parsed.data.customForUserId}?${flag}`);
  }
  if (createdPlanId) {
    const q = syncErr
      ? `?error=${encodeURIComponent(`Razorpay sync failed: ${syncErr}`)}`
      : `?ok=${encodeURIComponent("Plan saved and synced to Razorpay.")}`;
    redirect(`/admin/pricing/${createdPlanId}${q}`);
  }
  redirect("/admin/pricing");
}

export async function updatePlan(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) bail("/admin/pricing", "Missing plan id.");

  const parsed = PlanInput.safeParse(normalize(formData));
  if (!parsed.success)
    bail(`/admin/pricing/${id}`, parsed.error.issues[0]?.message ?? "Invalid input");

  const features = featuresFromText(parsed.data.features);

  try {
    await db
      .update(schema.pricingPlans)
      .set({
        slug: parsed.data.slug,
        category: parsed.data.category,
        name: parsed.data.name,
        tagline: parsed.data.tagline ?? null,
        priceMonthlyUsd: parsed.data.priceMonthlyUsd,
        priceYearlyUsd: parsed.data.priceYearlyUsd,
        executionsIncluded: parsed.data.executionsIncluded ?? null,
        overageUsdPer1k: parsed.data.overageUsdPer1k ?? null,
        features,
        highlight: parsed.data.highlight ?? false,
        visible: parsed.data.visible ?? true,
        sortOrder: parsed.data.sortOrder,
        razorpayPlanIdMonthly: parsed.data.razorpayPlanIdMonthly ?? null,
        razorpayPlanIdYearly: parsed.data.razorpayPlanIdYearly ?? null,
        customForUserId: parsed.data.customForUserId ?? null,
        currency: parsed.data.currency ?? "USD",
        updatedAt: new Date(),
      })
      .where(eq(schema.pricingPlans.id, id));
  } catch (e) {
    const msg = (e as Error).message ?? "";
    if (msg.includes("pricing_plans_slug_uniq") || msg.includes("duplicate")) {
      bail(`/admin/pricing/${id}`, `A plan with slug "${parsed.data.slug}" already exists.`);
    }
    bail(`/admin/pricing/${id}`, `Failed to update: ${msg}`);
  }

  // Push price/name changes to Razorpay — idempotent, only acts if a plan ID
  // is missing (Razorpay doesn't allow editing existing plans, so this just
  // catches the case where the admin filled in pricing for the first time).
  const sync = await syncPlanToRazorpay(id);

  revalidatePath("/admin/pricing");
  revalidatePath("/pricing");
  const q = !sync.ok
    ? `?error=${encodeURIComponent(`Plan saved, but Razorpay sync failed: ${sync.error}`)}`
    : `?ok=${encodeURIComponent("Plan saved.")}`;
  redirect(`/admin/pricing/${id}${q}`);
}

export async function deletePlan(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await db.delete(schema.pricingPlans).where(eq(schema.pricingPlans.id, id));
  void audit({
    actor: { userId: admin.id, email: admin.email },
    action: "plan.delete",
    targetType: "pricing_plan",
    targetId: id,
  });
  revalidatePath("/admin/pricing");
  revalidatePath("/pricing");
}

export async function toggleVisibility(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const [row] = await db
    .select({ visible: schema.pricingPlans.visible })
    .from(schema.pricingPlans)
    .where(eq(schema.pricingPlans.id, id))
    .limit(1);
  if (!row) return;
  await db
    .update(schema.pricingPlans)
    .set({ visible: !row.visible, updatedAt: new Date() })
    .where(eq(schema.pricingPlans.id, id));
  revalidatePath("/admin/pricing");
  revalidatePath("/pricing");
}
