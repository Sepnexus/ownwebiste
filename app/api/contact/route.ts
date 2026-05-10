import { z } from "zod";
import { db, schema } from "@/lib/db";
import { sendEmail, emailLayout } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TYPES = ["contact", "request_access", "project_inquiry", "support"] as const;

const Body = z.object({
  type: z.enum(TYPES),
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254),
  company: z.string().trim().max(160).nullable().optional(),
  message: z.string().trim().min(10).max(5_000),
  consent: z.boolean(),
  meta: z.record(z.string(), z.unknown()).optional(),
  // honeypot
  website: z.string().optional(),
});

export async function POST(req: Request) {
  let parsed: z.infer<typeof Body>;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return Response.json({ error: "Invalid form data" }, { status: 400 });
  }
  if (!parsed.consent) {
    return Response.json({ error: "Consent is required." }, { status: 400 });
  }
  if (parsed.website && parsed.website.length > 0) {
    // Honeypot tripped — silently accept.
    return Response.json({ ok: true });
  }

  const headers = req.headers;
  const ipAddress =
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.get("x-real-ip") ??
    null;
  const userAgent = headers.get("user-agent") ?? null;

  let inserted: typeof schema.contacts.$inferSelect | undefined;
  try {
    const [row] = await db
      .insert(schema.contacts)
      .values({
        type: parsed.type,
        name: parsed.name,
        email: parsed.email.toLowerCase(),
        company: parsed.company ?? null,
        message: parsed.message,
        metadata: parsed.meta ?? null,
        ipAddress,
        userAgent,
        consent: parsed.consent,
      })
      .returning();
    inserted = row;
  } catch (e) {
    console.error("[contact] insert failed:", e);
    return Response.json(
      { error: "We couldn't save your message. Please try again or email akshay@sepnexus.com directly." },
      { status: 500 },
    );
  }

  // Fire-and-forget the notifications. We've already saved the message —
  // email failure shouldn't block the user.
  void notifyAdmin(inserted!).catch((e) => console.error("[contact] admin notify failed:", e));
  void confirmToSubmitter(inserted!).catch((e) =>
    console.error("[contact] submitter confirm failed:", e),
  );

  return Response.json({ ok: true, id: inserted?.id });
}

async function notifyAdmin(c: typeof schema.contacts.$inferSelect) {
  const adminTo = process.env.ADMIN_EMAIL;
  if (!adminTo) return;
  const subject = `[Sepnexus] New ${c.type} from ${c.name}`;
  const body = `
    <p style="margin:0 0 18px;font-size:13px;color:#98928a;font-family:ui-monospace,monospace;letter-spacing:0.06em;text-transform:uppercase;">
      ${escape(c.type.replaceAll("_", " "))}
    </p>
    <h2 style="margin:0 0 16px;font-family:Georgia,serif;font-size:22px;letter-spacing:-0.01em;color:#14110f;">
      ${escape(c.name)} &lt;${escape(c.email)}&gt;
    </h2>
    ${c.company ? `<p style="margin:0 0 12px;color:#6b6660;">Company: ${escape(c.company)}</p>` : ""}
    <p style="margin:0 0 16px;color:#2a2520;white-space:pre-wrap;line-height:1.6;">${escape(c.message)}</p>
    <p style="margin:24px 0 0;font-size:12px;color:#98928a;">
      Open in admin: <a href="${process.env.PUBLIC_BASE_URL ?? ""}/admin/contacts/${c.id}">${c.id}</a>
    </p>
  `;
  await sendEmail({
    to: adminTo,
    subject,
    html: emailLayout({ title: subject, bodyHtml: body }),
    replyTo: c.email,
  });
}

async function confirmToSubmitter(c: typeof schema.contacts.$inferSelect) {
  const subject =
    c.type === "request_access"
      ? "Your access request to Sepnexus"
      : c.type === "project_inquiry"
        ? "We received your project inquiry"
        : "Thanks — we got your message";
  const body = `
    <p style="margin:0 0 14px;">Hi ${escape(c.name.split(" ")[0] || c.name)},</p>
    <p style="margin:0 0 14px;">
      Thanks for reaching out to Sepnexus. We&rsquo;ve logged your message and one of us will reply
      within 48 hours from <a href="mailto:akshay@sepnexus.com">akshay@sepnexus.com</a>.
    </p>
    <p style="margin:0 0 14px;">A copy of what you sent, for your records:</p>
    <blockquote style="margin:0 0 16px;padding:14px 18px;border-left:3px solid #B14999;background:#faf7ef;color:#2a2520;font-size:14px;line-height:1.6;white-space:pre-wrap;border-radius:4px;">${escape(c.message)}</blockquote>
    <p style="margin:0;color:#6b6660;font-size:13px;">— Sepnexus</p>
  `;
  await sendEmail({
    to: c.email,
    subject,
    html: emailLayout({ title: subject, bodyHtml: body, preheader: "We got it. Reply within 48h." }),
  });
}

function escape(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
