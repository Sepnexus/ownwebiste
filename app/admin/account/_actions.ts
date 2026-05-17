"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { hashPassword, requireAdmin, verifyPassword } from "@/lib/auth";

const PasswordInput = z.object({
  current: z.string().min(1),
  next: z.string().min(8).max(200),
  confirm: z.string().min(1),
});

function bail(error: string): never {
  redirect(`/admin/account?error=${encodeURIComponent(error)}`);
}
function ok(message: string): never {
  redirect(`/admin/account?ok=${encodeURIComponent(message)}`);
}

export async function changePassword(formData: FormData) {
  const admin = await requireAdmin();
  const parsed = PasswordInput.safeParse({
    current: formData.get("current"),
    next: formData.get("next"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) bail("New password must be at least 8 characters.");

  if (parsed.data.next !== parsed.data.confirm) {
    bail("New passwords don't match.");
  }
  if (!admin.passwordHash) bail("This account has no password set.");

  const valid = await verifyPassword(parsed.data.current, admin.passwordHash);
  if (!valid) bail("Current password is incorrect.");

  const passwordHash = await hashPassword(parsed.data.next);
  await db
    .update(schema.users)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(schema.users.id, admin.id));

  ok("Password updated.");
}

const ProfileInput = z.object({
  name: z.string().trim().max(120).optional(),
});

export async function updateProfile(formData: FormData) {
  const admin = await requireAdmin();
  const parsed = ProfileInput.safeParse({
    name: formData.get("name"),
  });
  if (!parsed.success) bail("Couldn't update profile.");
  await db
    .update(schema.users)
    .set({
      name: parsed.data.name?.trim() || null,
      updatedAt: new Date(),
    })
    .where(eq(schema.users.id, admin.id));
  ok("Profile updated.");
}
