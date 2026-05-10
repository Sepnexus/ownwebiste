import { z } from "zod";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import {
  consumeAuthToken,
  setUserPassword,
  setSessionCookie,
} from "@/lib/auth";
import { notifyAdminInviteAccepted } from "@/lib/email-templates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  token: z.string().min(10),
  name: z.string().trim().max(120).nullable().optional(),
  password: z.string().min(8).max(200),
});

export async function POST(req: Request) {
  let parsed: z.infer<typeof Body>;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return Response.json({ error: "Invalid input" }, { status: 400 });
  }

  const consumed = await consumeAuthToken({ plain: parsed.token, kind: "invite" });
  if (!consumed) {
    return Response.json({ error: "This invite is invalid or expired." }, { status: 400 });
  }

  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, consumed.userId))
    .limit(1);
  if (!user) {
    return Response.json({ error: "Account not found." }, { status: 404 });
  }
  if (user.role !== "admin" && user.role !== "customer") {
    return Response.json({ error: "Account role not permitted." }, { status: 403 });
  }

  await setUserPassword(user.id, parsed.password);
  await db
    .update(schema.users)
    .set({
      name: parsed.name?.trim() || user.name,
      inviteAcceptedAt: new Date(),
      emailVerifiedAt: user.emailVerifiedAt ?? new Date(),
      lastLoginAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(schema.users.id, user.id));

  await setSessionCookie({ uid: user.id, role: user.role });
  void notifyAdminInviteAccepted({
    customerEmail: user.email,
    customerName: parsed.name?.trim() || user.name,
  }).catch((e) => console.error("[invite/accept] admin notify failed:", e));
  return Response.json({ ok: true });
}
