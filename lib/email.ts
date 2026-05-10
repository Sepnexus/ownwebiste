import { Resend } from "resend";

let _client: Resend | null = null;
function client(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key || key === "re_change_me") return null;
  if (!_client) _client = new Resend(key);
  return _client;
}

export type SendArgs = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
};

/**
 * Send a transactional email via Resend.
 * If RESEND_API_KEY isn't configured, logs the email and returns ok:false silently —
 * the rest of the app continues to work in development without keys.
 */
export async function sendEmail(args: SendArgs): Promise<{ ok: boolean; id?: string; error?: string }> {
  const c = client();
  const from = process.env.EMAIL_FROM ?? "Sepnexus <noreply@sepnexus.com>";
  const replyTo = args.replyTo ?? process.env.EMAIL_REPLY_TO ?? undefined;

  if (!c) {
    console.warn("[email] Resend not configured — would have sent:", {
      to: args.to,
      subject: args.subject,
    });
    return { ok: false, error: "Resend API key not configured" };
  }

  try {
    const result = await c.emails.send({
      from,
      to: args.to,
      subject: args.subject,
      html: args.html,
      text: args.text,
      replyTo,
    });
    if (result.error) return { ok: false, error: result.error.message };
    return { ok: true, id: result.data?.id };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
}

/** Shared header used by every transactional email. */
export function emailLayout(args: { title: string; preheader?: string; bodyHtml: string }) {
  const preheader = args.preheader ?? "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(args.title)}</title>
</head>
<body style="margin:0;padding:0;background:#f6f3ec;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#14110f;">
  <span style="display:none;font-size:0;line-height:0;color:transparent;opacity:0;height:0;width:0;">${escapeHtml(preheader)}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f3ec;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid rgba(20,17,16,0.08);border-radius:16px;overflow:hidden;">
        <tr><td style="padding:28px 32px 0;">
          <span style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:22px;letter-spacing:-0.01em;color:#14110f;">Sepnexus</span>
        </td></tr>
        <tr><td style="padding:24px 32px 32px;font-size:15px;line-height:1.6;color:#2a2520;">
          ${args.bodyHtml}
        </td></tr>
        <tr><td style="padding:0 32px 28px;font-size:12px;line-height:1.5;color:#98928a;border-top:1px solid rgba(20,17,16,0.06);padding-top:16px;">
          Sepnexus &middot; The infrastructure of intelligent work.<br>
          You're receiving this because you contacted us through sepnexus.com. If this wasn't you, ignore this email.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
