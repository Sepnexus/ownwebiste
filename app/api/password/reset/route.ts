import { z } from "zod";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { consumeAuthToken, setSessionCookie, setUserPassword } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  token: z.string().min(10),
  password: z.string().min(8).max(200),
});

export async function POST(req: Request) {
  let parsed: z.infer<typeof Body>;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return Response.json({ error: "Invalid input" }, { status: 400 });
  }

  const consumed = await consumeAuthToken({
    plain: parsed.token,
    kind: "password_reset",
  });
  if (!consumed) {
    return Response.json({ error: "This reset link is invalid or expired." }, { status: 400 });
  }
  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, consumed.userId))
    .limit(1);
  if (!user) return Response.json({ error: "Account not found." }, { status: 404 });

  await setUserPassword(user.id, parsed.password);
  await db
    .update(schema.users)
    .set({ lastLoginAt: new Date(), updatedAt: new Date() })
    .where(eq(schema.users.id, user.id));
  await setSessionCookie({ uid: user.id, role: user.role as "admin" | "customer" });
  return Response.json({ ok: true, role: user.role });
}
