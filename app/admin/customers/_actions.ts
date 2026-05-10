"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { issueAuthToken, requireAdmin } from "@/lib/auth";
import { sendInviteEmail } from "@/lib/email-templates";

const InviteInput = z.object({
  email: z.string().trim().email().max(254),
  name: z.string().trim().max(120).optional().nullable(),
});

function bail(error: string): never {
  redirect(`/admin/customers?error=${encodeURIComponent(error)}`);
}
function ok(message: string): never {
  redirect(`/admin/customers?ok=${encodeURIComponent(message)}`);
}

export async function inviteCustomer(formData: FormData) {
  const admin = await requireAdmin();
  const parsed = InviteInput.safeParse({
    email: formData.get("email"),
    name: formData.get("name"),
  });
  if (!parsed.success) bail(parsed.error.issues[0]?.message ?? "Invalid email.");

  const email = parsed.data.email.toLowerCase();
  const name = parsed.data.name?.trim() || null;

  // Look up existing user. Reuse if customer (re-invite); refuse if admin.
  const [existing] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .limit(1);

  let userId: string;
  if (existing) {
    if (existing.role === "admin") {
      bail("That email belongs to an admin and can't be invited as a customer.");
    }
    if (existing.inviteAcceptedAt) {
      bail("That customer has already accepted an invite. Use password reset instead.");
    }
    userId = existing.id;
    await db
      .update(schema.users)
      .set({
        name: name ?? existing.name,
        invitedAt: new Date(),
        invitedByUserId: admin.id,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, existing.id));
  } else {
    const [created] = await db
      .insert(schema.users)
      .values({
        email,
        name,
        role: "customer",
        invitedAt: new Date(),
        invitedByUserId: admin.id,
      })
      .returning({ id: schema.users.id });
    userId = created.id;
  }

  const { plain } = await issueAuthToken({ userId, kind: "invite" });
  const base = process.env.PUBLIC_BASE_URL ?? "http://localhost:3000";
  const acceptUrl = `${base}/invite/${plain}`;

  const sent = await sendInviteEmail({
    to: email,
    name,
    acceptUrl,
    invitedByName: admin.name ?? admin.email,
  });

  revalidatePath("/admin/customers");

  if (!sent.ok) {
    // We've already issued the token. Surface the link to the admin so the invite isn't lost.
    redirect(
      `/admin/customers?ok=${encodeURIComponent(
        `Email failed (${sent.error ?? "unknown"}). Share this link manually: ${acceptUrl}`,
      )}`,
    );
  }
  ok(`Invite sent to ${email}.`);
}

export async function resendInvite(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) bail("Missing user id.");

  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, id))
    .limit(1);
  if (!user) bail("User not found.");
  if (user.inviteAcceptedAt) bail("Invite already accepted.");

  await db
    .update(schema.users)
    .set({ invitedAt: new Date(), updatedAt: new Date() })
    .where(eq(schema.users.id, id));

  const { plain } = await issueAuthToken({ userId: user.id, kind: "invite" });
  const base = process.env.PUBLIC_BASE_URL ?? "http://localhost:3000";
  const acceptUrl = `${base}/invite/${plain}`;
  const sent = await sendInviteEmail({
    to: user.email,
    name: user.name,
    acceptUrl,
  });
  if (!sent.ok) {
    redirect(
      `/admin/customers?ok=${encodeURIComponent(
        `Email failed (${sent.error ?? "unknown"}). Share this link manually: ${acceptUrl}`,
      )}`,
    );
  }
  ok(`Invite re-sent to ${user.email}.`);
}

export async function deleteCustomer(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  // Soft-delete only; we may want to retain the row for audit.
  await db
    .update(schema.users)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(schema.users.id, id));
  revalidatePath("/admin/customers");
}
