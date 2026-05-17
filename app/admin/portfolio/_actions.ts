"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const EntryInput = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/, "lowercase letters, numbers and dashes only"),
  title: z.string().trim().min(1).max(160),
  client: z.string().trim().max(120).optional().nullable(),
  year: z.coerce.number().int().min(2000).max(2100).optional().nullable(),
  summary: z.string().trim().max(500).optional().nullable(),
  body: z.string().trim().max(20_000).optional().nullable(),
  coverImageUrl: z.string().trim().max(500).optional().nullable(),
  tags: z.string(), // comma-separated
  metrics: z.string(), // comma-separated, "label:value" pairs
  sortOrder: z.coerce.number().int().default(0),
  published: z.coerce.boolean().optional(),
});

function normalize(formData: FormData) {
  const obj: Record<string, unknown> = Object.fromEntries(formData);
  obj.published = formData.get("published") === "on";
  ["client", "summary", "body", "coverImageUrl"].forEach((k) => {
    const v = formData.get(k);
    obj[k] = typeof v === "string" && v.trim() !== "" ? v.trim() : null;
  });
  obj.year = formData.get("year") === "" ? null : formData.get("year");
  return obj;
}

function bail(path: string, error: string): never {
  redirect(`${path}?error=${encodeURIComponent(error)}`);
}

function tagsFromText(text: string): string[] {
  return text
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

function metricsFromText(text: string): { label: string; value: string }[] {
  return text
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean)
    .map((m) => {
      const [label, ...rest] = m.split(":");
      return { label: label.trim(), value: rest.join(":").trim() };
    })
    .filter((m) => m.label && m.value);
}

export async function createEntry(formData: FormData) {
  await requireAdmin();
  const parsed = EntryInput.safeParse(normalize(formData));
  if (!parsed.success)
    bail("/admin/portfolio/new", parsed.error.issues[0]?.message ?? "Invalid input");

  try {
    await db.insert(schema.portfolioEntries).values({
      slug: parsed.data.slug,
      title: parsed.data.title,
      client: parsed.data.client ?? null,
      year: parsed.data.year ?? null,
      summary: parsed.data.summary ?? null,
      body: parsed.data.body ?? null,
      coverImageUrl: parsed.data.coverImageUrl ?? null,
      tags: tagsFromText(parsed.data.tags),
      metrics: metricsFromText(parsed.data.metrics),
      sortOrder: parsed.data.sortOrder,
      published: parsed.data.published ?? false,
    });
  } catch (e) {
    const msg = (e as Error).message ?? "";
    if (msg.includes("portfolio_entries_slug_uniq") || msg.includes("duplicate")) {
      bail("/admin/portfolio/new", `An entry with slug "${parsed.data.slug}" already exists.`);
    }
    bail("/admin/portfolio/new", `Failed to create: ${msg}`);
  }

  revalidatePath("/admin/portfolio");
  revalidatePath("/portfolio");
  redirect("/admin/portfolio");
}

export async function updateEntry(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) bail("/admin/portfolio", "Missing entry id.");

  const parsed = EntryInput.safeParse(normalize(formData));
  if (!parsed.success)
    bail(`/admin/portfolio/${id}`, parsed.error.issues[0]?.message ?? "Invalid input");

  try {
    await db
      .update(schema.portfolioEntries)
      .set({
        slug: parsed.data.slug,
        title: parsed.data.title,
        client: parsed.data.client ?? null,
        year: parsed.data.year ?? null,
        summary: parsed.data.summary ?? null,
        body: parsed.data.body ?? null,
        coverImageUrl: parsed.data.coverImageUrl ?? null,
        tags: tagsFromText(parsed.data.tags),
        metrics: metricsFromText(parsed.data.metrics),
        sortOrder: parsed.data.sortOrder,
        published: parsed.data.published ?? false,
        updatedAt: new Date(),
      })
      .where(eq(schema.portfolioEntries.id, id));
  } catch (e) {
    const msg = (e as Error).message ?? "";
    if (msg.includes("portfolio_entries_slug_uniq") || msg.includes("duplicate")) {
      bail(`/admin/portfolio/${id}`, `An entry with slug "${parsed.data.slug}" already exists.`);
    }
    bail(`/admin/portfolio/${id}`, `Failed to update: ${msg}`);
  }

  revalidatePath("/admin/portfolio");
  revalidatePath("/portfolio");
  redirect("/admin/portfolio");
}

export async function deleteEntry(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await db.delete(schema.portfolioEntries).where(eq(schema.portfolioEntries.id, id));
  revalidatePath("/admin/portfolio");
  revalidatePath("/portfolio");
}

export async function togglePublished(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const [row] = await db
    .select({ published: schema.portfolioEntries.published })
    .from(schema.portfolioEntries)
    .where(eq(schema.portfolioEntries.id, id))
    .limit(1);
  if (!row) return;
  await db
    .update(schema.portfolioEntries)
    .set({ published: !row.published, updatedAt: new Date() })
    .where(eq(schema.portfolioEntries.id, id));
  revalidatePath("/admin/portfolio");
  revalidatePath("/portfolio");
}
