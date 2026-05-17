import { z } from "zod";
import { eq, and, isNull } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { ingestExecutionEvent } from "@/lib/usage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Receives one execution event from a Sepnexus-operated n8n instance.
 * Authenticates via Bearer USAGE_INGEST_SECRET — strictly server-to-server.
 *
 * Customer association is provided via either:
 *  - body.customerId (uuid), OR
 *  - body.customerEmail
 */
const Body = z.object({
  // Either customerId or customerEmail must be present.
  customerId: z.string().uuid().optional().nullable(),
  customerEmail: z.string().email().optional().nullable(),

  source: z.enum(["shared-n8n", "dedicated-n8n", "manual"]).default("shared-n8n"),
  externalId: z.string().max(160).optional().nullable(),
  workflowId: z.string().max(120).optional().nullable(),
  workflowName: z.string().max(240).optional().nullable(),
  status: z.enum(["success", "error", "canceled"]).optional().nullable(),
  durationMs: z.number().int().min(0).max(24 * 60 * 60 * 1000).optional().nullable(),
  occurredAt: z.string().datetime().optional(),
  meta: z.record(z.string(), z.unknown()).optional().nullable(),
});

export async function POST(req: Request) {
  const expected = process.env.USAGE_INGEST_SECRET;
  if (!expected || expected.length < 16) {
    return Response.json(
      { error: "USAGE_INGEST_SECRET not configured" },
      { status: 503 },
    );
  }
  const auth = req.headers.get("authorization") ?? "";
  const presented = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (presented !== expected) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Bad request";
    return Response.json({ error: msg }, { status: 400 });
  }
  if (!body.customerId && !body.customerEmail) {
    return Response.json(
      { error: "customerId or customerEmail required" },
      { status: 400 },
    );
  }

  // Resolve user.
  let userId: string | null = null;
  if (body.customerId) userId = body.customerId;
  else if (body.customerEmail) {
    const [u] = await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(
        and(
          eq(schema.users.email, body.customerEmail.toLowerCase()),
          isNull(schema.users.deletedAt),
        ),
      )
      .limit(1);
    userId = u?.id ?? null;
  }
  if (!userId) {
    return Response.json({ error: "Customer not found" }, { status: 404 });
  }

  const occurredAt = body.occurredAt ? new Date(body.occurredAt) : new Date();

  try {
    const result = await ingestExecutionEvent({
      userId,
      externalId: body.externalId ?? null,
      source: body.source,
      workflowId: body.workflowId ?? null,
      workflowName: body.workflowName ?? null,
      status: body.status ?? null,
      durationMs: body.durationMs ?? null,
      occurredAt,
      meta: body.meta ?? null,
    });
    return Response.json({ ok: true, duplicate: result.duplicate });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ingest failed";
    console.error("[usage/exec] ingest failed:", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}
