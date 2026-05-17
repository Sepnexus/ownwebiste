import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { generateTotpSecret, totpQrPng } from "@/lib/totp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Issues a fresh TOTP secret + QR code for the current user. The secret is
 * stored on the user row but `totp_enabled` stays false until they confirm
 * with a working code via /api/account/2fa/enable.
 */
export async function POST() {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Sign in first." }, { status: 401 });

  const secret = generateTotpSecret();
  await db
    .update(schema.users)
    .set({ totpSecret: secret, totpEnabled: false, updatedAt: new Date() })
    .where(eq(schema.users.id, user.id));

  const qrDataUrl = await totpQrPng({ email: user.email, secret });
  return Response.json({ ok: true, secret, qrDataUrl });
}
