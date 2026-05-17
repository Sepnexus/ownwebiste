import { z } from "zod";
import { and, eq, isNull } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { issueAuthToken } from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/email-templates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({ email: z.string().trim().email() });

export async function POST(req: Request) {
  let parsed: z.infer<typeof Body>;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return Response.json({ error: "Invalid email" }, { status: 400 });
  }

  const email = parsed.email.toLowerCase();
  const [user] = await db
    .select()
    .from(schema.users)
    .where(and(eq(schema.users.email, email), isNull(schema.users.deletedAt)))
    .limit(1);

  // Always succeed — don't reveal whether the email is registered.
  if (!user) return Response.json({ ok: true });

  const { plain } = await issueAuthToken({ userId: user.id, kind: "password_reset" });
  const base = process.env.PUBLIC_BASE_URL ?? "http://localhost:3000";
  await sendPasswordResetEmail({
    to: user.email,
    name: user.name,
    resetUrl: `${base}/reset/${plain}`,
  });

  return Response.json({ ok: true });
}
