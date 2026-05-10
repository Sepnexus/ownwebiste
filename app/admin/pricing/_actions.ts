"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

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
  await requireAdmin();
  const parsed = PlanInput.safeParse(normalize(formData));
  if (!parsed.success) bail("/admin/pricing/new", parsed.error.issues[0]?.message ?? "Invalid input");

  const features = featuresFromText(parsed.data.features);

  try {
    await db.insert(schema.pricingPlans).values({
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
    });
  } catch (e) {
    const msg = (e as Error).message ?? "";
    if (msg.includes("pricing_plans_slug_uniq") || msg.includes("duplicate")) {
      bail("/admin/pricing/new", `A plan with slug "${parsed.data.slug}" already exists.`);
    }
    bail("/admin/pricing/new", `Failed to create plan: ${msg}`);
  }

  revalidatePath("/admin/pricing");
  revalidatePath("/pricing");
  redirect("/admin/pricing");
}

export async function updatePlan(formData: FormData) {
  await requireAdmin();
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

  revalidatePath("/admin/pricing");
  revalidatePath("/pricing");
  redirect("/admin/pricing");
}

export async function deletePlan(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await db.delete(schema.pricingPlans).where(eq(schema.pricingPlans.id, id));
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
