import { sendEmail, emailLayout } from "./email";

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export async function sendInviteEmail(args: {
  to: string;
  name: string | null;
  acceptUrl: string;
  invitedByName?: string | null;
}) {
  const greeting = args.name ? `Hi ${escapeHtml(args.name.split(" ")[0] || args.name)},` : "Hi,";
  const inviter = args.invitedByName ? `${escapeHtml(args.invitedByName)} from ` : "";
  const body = `
    <p style="margin:0 0 16px;">${greeting}</p>
    <p style="margin:0 0 16px;">
      ${inviter}Sepnexus has invited you to create an account.
      Sepnexus is invitation-only — this link is yours alone and expires in 7 days.
    </p>
    <p style="margin:0 0 24px;">
      <a href="${args.acceptUrl}" style="display:inline-block;background:#14110f;color:#f6f3ec;text-decoration:none;padding:12px 22px;border-radius:999px;font-family:-apple-system,sans-serif;font-size:14px;font-weight:500;">
        Accept invite &amp; set password →
      </a>
    </p>
    <p style="margin:0 0 12px;font-size:13px;color:#6b6660;">
      Or paste this link into your browser:<br>
      <span style="font-family:ui-monospace,monospace;font-size:12px;color:#2a2520;word-break:break-all;">${escapeHtml(args.acceptUrl)}</span>
    </p>
    <p style="margin:24px 0 0;font-size:13px;color:#6b6660;">
      If you weren't expecting this, ignore the email — the link won't activate anything until you click it.
    </p>
  `;
  return sendEmail({
    to: args.to,
    subject: "You're invited to Sepnexus",
    html: emailLayout({
      title: "You're invited to Sepnexus",
      preheader: "Accept your invite — link expires in 7 days.",
      bodyHtml: body,
    }),
  });
}

export async function sendPasswordResetEmail(args: {
  to: string;
  name: string | null;
  resetUrl: string;
}) {
  const greeting = args.name ? `Hi ${escapeHtml(args.name.split(" ")[0] || args.name)},` : "Hi,";
  const body = `
    <p style="margin:0 0 16px;">${greeting}</p>
    <p style="margin:0 0 16px;">
      Someone (probably you) requested a password reset for your Sepnexus account.
      The link below is good for 1 hour.
    </p>
    <p style="margin:0 0 24px;">
      <a href="${args.resetUrl}" style="display:inline-block;background:#14110f;color:#f6f3ec;text-decoration:none;padding:12px 22px;border-radius:999px;font-family:-apple-system,sans-serif;font-size:14px;font-weight:500;">
        Set a new password →
      </a>
    </p>
    <p style="margin:24px 0 0;font-size:13px;color:#6b6660;">
      If this wasn't you, ignore this email and your password will stay unchanged.
    </p>
  `;
  return sendEmail({
    to: args.to,
    subject: "Reset your Sepnexus password",
    html: emailLayout({
      title: "Reset your Sepnexus password",
      preheader: "Reset link valid for 1 hour.",
      bodyHtml: body,
    }),
  });
}
