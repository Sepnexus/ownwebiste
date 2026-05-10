import { z } from "zod";
import { authenticate, setSessionCookie } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  let parsed: z.infer<typeof Body>;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return Response.json({ error: "Invalid email or password" }, { status: 400 });
  }
  const user = await authenticate(parsed.email, parsed.password);
  if (!user) {
    return Response.json({ error: "Invalid email or password" }, { status: 401 });
  }
  if (user.role !== "admin" && user.role !== "customer") {
    return Response.json({ error: "Account role not permitted" }, { status: 403 });
  }
  await setSessionCookie({ uid: user.id, role: user.role });
  return Response.json({ ok: true, role: user.role });
}
