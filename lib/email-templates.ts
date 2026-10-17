import { sendEmail, emailLayout } from "./email";

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/**
 * Sent during the public /subscribe checkout to confirm the visitor
 * controls the email they entered. The 6-digit code is displayed prominently.
 */
export async function sendOtpEmail(args: {
  to: string;
  code: string;
  expiresInMinutes?: number;
}) {
  const minutes = args.expiresInMinutes ?? 10;
  const body = `
    <p style="margin:0 0 14px;">Use this code to verify your email and continue with checkout:</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 16px;width:100%;">
      <tr><td align="center" style="padding:18px;background:#faf7ef;border:1px solid rgba(20,17,16,0.08);border-radius:12px;">
        <span style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:36px;letter-spacing:0.18em;color:#14110f;font-weight:500;">
          ${escapeHtml(args.code)}
        </span>
      </td></tr>
    </table>
    <p style="margin:0 0 14px;font-size:13px;color:#6b6660;">
      Code expires in ${minutes} minutes. If you didn't request this, ignore the email — no
      account is created until the code is verified <em>and</em> payment is authorised.
    </p>
  `;
  return sendEmail({
    to: args.to,
    subject: `Your Sepnexus verification code — ${args.code}`,
    html: emailLayout({
      title: "Your verification code",
      preheader: `Use ${args.code} to continue checkout. Expires in ${minutes} min.`,
      bodyHtml: body,
    }),
  });
}

function adminEmail(): string | null {
  const e = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!e) return null;
  return e;
}

/* ============== Admin notifications ============== */

export async function notifyAdminInviteSent(args: {
  customerEmail: string;
  customerName: string | null;
}) {
  const to = adminEmail();
  if (!to) return;
  const body = `
    <p style="margin:0 0 14px;">Heads up — you just invited a new customer.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="background:#faf7ef;border-radius:12px;padding:16px 18px;width:100%;">
      <tr><td>
        <strong style="color:#14110f;">${escapeHtml(args.customerName ?? args.customerEmail.split("@")[0])}</strong><br>
        <span style="color:#6b6660;font-family:ui-monospace,monospace;font-size:13px;">${escapeHtml(args.customerEmail)}</span>
      </td></tr>
    </table>
    <p style="margin:18px 0 0;font-size:13px;color:#6b6660;">They'll have 7 days to accept. You'll be notified when they do.</p>
  `;
  return sendEmail({
    to,
    subject: `[Sepnexus] Invite sent · ${args.customerEmail}`,
    html: emailLayout({
      title: "Invite sent",
      preheader: `${args.customerEmail} invited`,
      bodyHtml: body,
    }),
  });
}

export async function notifyAdminInviteAccepted(args: {
  customerEmail: string;
  customerName: string | null;
}) {
  const to = adminEmail();
  if (!to) return;
  const body = `
    <p style="margin:0 0 14px;">A customer just accepted their invite and signed in.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="background:#faf7ef;border-radius:12px;padding:16px 18px;width:100%;">
      <tr><td>
        <strong style="color:#14110f;">${escapeHtml(args.customerName ?? args.customerEmail.split("@")[0])}</strong><br>
        <span style="color:#6b6660;font-family:ui-monospace,monospace;font-size:13px;">${escapeHtml(args.customerEmail)}</span>
      </td></tr>
    </table>
  `;
  return sendEmail({
    to,
    subject: `[Sepnexus] Invite accepted · ${args.customerEmail}`,
    html: emailLayout({
      title: "Invite accepted",
      preheader: `${args.customerEmail} accepted their invite`,
      bodyHtml: body,
    }),
  });
}

export async function notifyAdminSubscriptionStarted(args: {
  customerEmail: string;
  customerName: string | null;
  planName: string;
  period: string;
  amountUsd: number;
}) {
  const to = adminEmail();
  if (!to) return;
  const body = `
    <p style="margin:0 0 14px;">New subscription started.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="background:#faf7ef;border-radius:12px;padding:16px 18px;width:100%;font-size:14px;">
      <tr><td style="padding-bottom:8px;">
        <strong style="color:#14110f;">${escapeHtml(args.customerName ?? args.customerEmail.split("@")[0])}</strong>
        <span style="color:#6b6660;"> &middot; ${escapeHtml(args.customerEmail)}</span>
      </td></tr>
      <tr><td style="padding-top:8px;border-top:1px solid rgba(20,17,16,0.08);color:#2a2520;">
        <strong>${escapeHtml(args.planName)}</strong> &middot; ${escapeHtml(args.period)} &middot; $${args.amountUsd.toLocaleString()} USD
      </td></tr>
    </table>
  `;
  return sendEmail({
    to,
    subject: `[Sepnexus] New subscription · ${args.planName} for ${args.customerEmail}`,
    html: emailLayout({
      title: "New subscription",
      preheader: `${args.planName} · ${args.period}`,
      bodyHtml: body,
    }),
  });
}

export async function notifyAdminSubscriptionCancelled(args: {
  customerEmail: string;
  customerName: string | null;
  planName: string;
}) {
  const to = adminEmail();
  if (!to) return;
  const body = `
    <p style="margin:0 0 14px;">A subscription was cancelled.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="background:#faf7ef;border-radius:12px;padding:16px 18px;width:100%;font-size:14px;">
      <tr><td>
        <strong style="color:#14110f;">${escapeHtml(args.customerName ?? args.customerEmail.split("@")[0])}</strong> &middot; ${escapeHtml(args.customerEmail)}<br>
        <span style="color:#6b6660;">${escapeHtml(args.planName)}</span>
      </td></tr>
    </table>
  `;
  return sendEmail({
    to,
    subject: `[Sepnexus] Cancellation · ${args.planName} · ${args.customerEmail}`,
    html: emailLayout({
      title: "Subscription cancelled",
      preheader: `${args.customerEmail} cancelled`,
      bodyHtml: body,
    }),
  });
}

export async function notifyAdminPaymentReceived(args: {
  customerEmail: string;
  customerName: string | null;
  planName: string;
  amountCents: number;
  currency: string;
  invoiceId: string | null;
}) {
  const to = adminEmail();
  if (!to) return;
  const amount = `${args.currency === "USD" ? "$" : ""}${(args.amountCents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const body = `
    <p style="margin:0 0 14px;">Payment received.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="background:#faf7ef;border-radius:12px;padding:16px 18px;width:100%;font-size:14px;">
      <tr><td>
        <span style="font-family:Georgia,serif;font-size:32px;color:#14110f;letter-spacing:-0.01em;">${amount}</span>
        <span style="color:#6b6660;font-family:ui-monospace,monospace;font-size:11px;letter-spacing:0.06em;text-transform:uppercase;"> &nbsp;${escapeHtml(args.currency)}</span>
      </td></tr>
      <tr><td style="padding-top:10px;border-top:1px solid rgba(20,17,16,0.08);margin-top:10px;color:#2a2520;">
        <strong>${escapeHtml(args.customerName ?? args.customerEmail.split("@")[0])}</strong>
        <span style="color:#6b6660;"> &middot; ${escapeHtml(args.customerEmail)}</span><br>
        <span style="color:#6b6660;">${escapeHtml(args.planName)}</span>
      </td></tr>
      ${args.invoiceId ? `<tr><td style="padding-top:8px;color:#98928a;font-family:ui-monospace,monospace;font-size:11px;">Razorpay invoice: ${escapeHtml(args.invoiceId)}</td></tr>` : ""}
    </table>
  `;
  return sendEmail({
    to,
    subject: `[Sepnexus] Payment received · ${amount} · ${args.customerEmail}`,
    html: emailLayout({
      title: "Payment received",
      preheader: `${amount} from ${args.customerEmail}`,
      bodyHtml: body,
    }),
  });
}

export async function notifyAdminPaymentFailed(args: {
  customerEmail: string;
  customerName: string | null;
  planName: string;
  amountCents: number;
  currency: string;
}) {
  const to = adminEmail();
  if (!to) return;
  const amount = `${args.currency === "USD" ? "$" : ""}${(args.amountCents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const body = `
    <p style="margin:0 0 14px;color:#E84A4F;"><strong>Payment failed.</strong></p>
    <p style="margin:0 0 14px;">Razorpay couldn't charge the customer's payment method.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="background:#fef0f0;border-radius:12px;padding:16px 18px;width:100%;font-size:14px;">
      <tr><td>
        <strong style="color:#14110f;">${escapeHtml(args.customerName ?? args.customerEmail.split("@")[0])}</strong>
        <span style="color:#6b6660;"> &middot; ${escapeHtml(args.customerEmail)}</span><br>
        <span style="color:#6b6660;">${escapeHtml(args.planName)} &middot; ${amount} ${escapeHtml(args.currency)}</span>
      </td></tr>
    </table>
    <p style="margin:18px 0 0;font-size:13px;color:#6b6660;">Razorpay will retry automatically. If the subscription enters <code>halted</code>, reach out to the customer.</p>
  `;
  return sendEmail({
    to,
    subject: `[Sepnexus] ⚠ Payment failed · ${args.customerEmail}`,
    html: emailLayout({
      title: "Payment failed",
      preheader: `${amount} ${args.currency} failed`,
      bodyHtml: body,
    }),
  });
}

/**
 * Sent after a customer pays via the public /subscribe flow. Their account
 * exists but has no password yet — this magic link is the activation step.
 */
export async function sendWelcomePostPaymentEmail(args: {
  to: string;
  name: string | null;
  acceptUrl: string;
  planName: string;
  amountUsd: number;
  period: string;
  currency?: string;
}) {
  const greeting = args.name ? `Hi ${escapeHtml(args.name.split(" ")[0] || args.name)},` : "Hi,";
  const sym = args.currency === "INR" ? "₹" : "$";
  const cur = args.currency ?? "USD";
  const body = `
    <p style="margin:0 0 14px;">${greeting}</p>
    <p style="margin:0 0 16px;">
      Welcome to Sepnexus. Your <strong>${escapeHtml(args.planName)}</strong> subscription is
      active — you were charged <strong>${sym}${args.amountUsd.toLocaleString()} ${escapeHtml(args.period)} (${cur})</strong>.
    </p>
    <p style="margin:0 0 16px;">
      One last step: click below to set a password and log in to your dashboard. The link is
      good for 7 days.
    </p>
    <p style="margin:0 0 24px;">
      <a href="${args.acceptUrl}" style="display:inline-block;background:#14110f;color:#f6f3ec;text-decoration:none;padding:12px 22px;border-radius:999px;font-family:-apple-system,sans-serif;font-size:14px;font-weight:500;">
        Set password &amp; sign in →
      </a>
    </p>
    <p style="margin:0 0 12px;font-size:13px;color:#6b6660;">
      Or paste this link into your browser:<br>
      <span style="font-family:ui-monospace,monospace;font-size:12px;color:#2a2520;word-break:break-all;">${escapeHtml(args.acceptUrl)}</span>
    </p>
    <p style="margin:24px 0 0;font-size:13px;color:#6b6660;">
      Receipt and invoice will arrive separately from Razorpay.
    </p>
  `;
  return sendEmail({
    to: args.to,
    subject: "Welcome to Sepnexus — set your password",
    html: emailLayout({
      title: "Welcome to Sepnexus",
      preheader: `Set your password — ${args.planName} active.`,
      bodyHtml: body,
    }),
  });
}

/**
 * Sent to the customer when a payment lands (subscription.charged or
 * invoice.paid). Separate from Razorpay's own receipt — this one carries
 * Sepnexus branding and a direct link to the invoice page.
 */
export async function sendPaymentReceivedEmail(args: {
  to: string;
  name: string | null;
  planName: string;
  amountCents: number;
  currency: string;
  /** Internal invoice ID — drives the PDF render + the View invoice link. */
  invoiceId: string;
  periodEnd: Date | null;
}) {
  const greeting = args.name ? `Hi ${escapeHtml(args.name.split(" ")[0] || args.name)},` : "Hi,";
  const sym = args.currency === "INR" ? "₹" : "$";
  const amount = `${sym}${(args.amountCents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const periodEndStr = args.periodEnd
    ? args.periodEnd.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
    : null;

  // Render the Sepnexus-branded PDF + load its number so we can show it in the email.
  // We do this here (not in billing.ts) so the template owns its own attachments.
  const { loadInvoicePdfData, renderInvoicePdf, invoiceFilename, invoicePublicUrl } =
    await import("./invoice-pdf");
  const data = await loadInvoicePdfData(args.invoiceId);
  const pdfBuffer = data ? await renderInvoicePdf(data) : null;
  const pdfFilename = data ? invoiceFilename(data) : null;
  const invoiceUrl = invoicePublicUrl(args.invoiceId);
  const invoiceNumber = data?.invoiceNumber ?? null;

  const body = `
    <p style="margin:0 0 14px;">${greeting}</p>
    <p style="margin:0 0 18px;">Thanks — we received your payment for <strong>${escapeHtml(args.planName)}</strong>. Your Sepnexus invoice is attached to this email and also available in your dashboard.</p>

    <table role="presentation" cellpadding="0" cellspacing="0" style="background:#faf7ef;border-radius:12px;padding:18px 20px;width:100%;font-size:14px;">
      <tr><td style="padding-bottom:10px;">
        <div style="font-family:ui-monospace,monospace;font-size:10px;letter-spacing:0.08em;text-transform:uppercase;color:#98928a;">Amount</div>
        <div style="font-family:Georgia,serif;font-size:32px;color:#14110f;letter-spacing:-0.01em;margin-top:2px;">${amount} <span style="font-size:12px;color:#98928a;letter-spacing:0.06em;text-transform:uppercase;">${escapeHtml(args.currency)}</span></div>
      </td></tr>
      <tr><td style="padding-top:10px;border-top:1px solid rgba(20,17,16,0.08);">
        <div style="font-family:ui-monospace,monospace;font-size:10px;letter-spacing:0.08em;text-transform:uppercase;color:#98928a;">Plan</div>
        <div style="color:#2a2520;font-size:14px;margin-top:2px;">${escapeHtml(args.planName)}</div>
      </td></tr>
      ${
        periodEndStr
          ? `<tr><td style="padding-top:10px;border-top:1px solid rgba(20,17,16,0.08);">
        <div style="font-family:ui-monospace,monospace;font-size:10px;letter-spacing:0.08em;text-transform:uppercase;color:#98928a;">Next renewal</div>
        <div style="color:#2a2520;font-size:14px;margin-top:2px;">${escapeHtml(periodEndStr)}</div>
      </td></tr>`
          : ""
      }
      ${
        invoiceNumber
          ? `<tr><td style="padding-top:10px;border-top:1px solid rgba(20,17,16,0.08);">
        <div style="font-family:ui-monospace,monospace;font-size:10px;letter-spacing:0.08em;text-transform:uppercase;color:#98928a;">Invoice</div>
        <div style="font-family:ui-monospace,monospace;font-size:13px;color:#2a2520;margin-top:2px;">${escapeHtml(invoiceNumber)}</div>
      </td></tr>`
          : ""
      }
    </table>

    <p style="margin:24px 0 0;">
      <a href="${invoiceUrl}" style="display:inline-block;background:#14110f;color:#f6f3ec;text-decoration:none;padding:12px 22px;border-radius:999px;font-family:-apple-system,sans-serif;font-size:14px;font-weight:500;">
        View invoice →
      </a>
    </p>

    <p style="margin:24px 0 0;font-size:13px;color:#6b6660;">
      Manage your subscription or download past invoices from
      <a href="${process.env.PUBLIC_BASE_URL ?? "https://sepnexus.com"}/dashboard/billing" style="color:#2a2520;border-bottom:1px solid rgba(20,17,16,0.2);text-decoration:none;">your dashboard</a>.
      Need a different billing address or company name on this invoice? Just reply to this email.
    </p>
  `;

  // BCC akshay@sepnexus.com on every customer receipt — that's the audit trail.
  const adminBcc = process.env.EMAIL_ADMIN ?? "akshay@sepnexus.com";

  return sendEmail({
    to: args.to,
    bcc: adminBcc,
    subject: `Receipt: ${amount} ${args.currency}${invoiceNumber ? ` · ${invoiceNumber}` : ""}`,
    html: emailLayout({
      title: "Payment received",
      preheader: `${amount} for ${args.planName}. Invoice attached.`,
      bodyHtml: body,
    }),
    attachments:
      pdfBuffer && pdfFilename
        ? [
            {
              filename: pdfFilename,
              content: pdfBuffer,
              contentType: "application/pdf",
            },
          ]
        : undefined,
  });
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
      This link is yours alone and expires in 7 days.
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

export async function sendUsage80Warning(args: {
  to: string;
  name: string | null;
  used: number;
  included: number;
  periodEnd: Date;
}) {
  const greeting = args.name ? `Hi ${escapeHtml(args.name.split(" ")[0] || args.name)},` : "Hi,";
  const pct = Math.round((args.used / args.included) * 100);
  const body = `
    <p style="margin:0 0 16px;">${greeting}</p>
    <p style="margin:0 0 16px;">
      You're at <strong>${pct}%</strong> of your execution allowance for the current billing
      period — ${args.used.toLocaleString()} of ${args.included.toLocaleString()} executions used.
    </p>
    <p style="margin:0 0 16px;">
      Period ends <strong>${args.periodEnd.toUTCString()}</strong>. If you'd rather not pay
      overage, consider upgrading from your dashboard.
    </p>
    <p style="margin:0 0 24px;">
      <a href="${process.env.PUBLIC_BASE_URL ?? ""}/dashboard" style="display:inline-block;background:#14110f;color:#f6f3ec;text-decoration:none;padding:10px 18px;border-radius:999px;font-family:-apple-system,sans-serif;font-size:14px;font-weight:500;">
        Open dashboard →
      </a>
    </p>
  `;
  return sendEmail({
    to: args.to,
    subject: "You're at 80% of your monthly executions",
    html: emailLayout({
      title: "80% used",
      preheader: `${args.used.toLocaleString()} of ${args.included.toLocaleString()} this period.`,
      bodyHtml: body,
    }),
  });
}

export async function sendUsage100Warning(args: {
  to: string;
  name: string | null;
  used: number;
  included: number;
  overageUsdPer1k: number;
  periodEnd: Date;
}) {
  const greeting = args.name ? `Hi ${escapeHtml(args.name.split(" ")[0] || args.name)},` : "Hi,";
  const over = args.used - args.included;
  const projectedCents = Math.ceil(over / 1000) * args.overageUsdPer1k * 100;
  const body = `
    <p style="margin:0 0 16px;">${greeting}</p>
    <p style="margin:0 0 16px;">
      You've used your full monthly allowance of
      <strong>${args.included.toLocaleString()}</strong> executions for this period.
    </p>
    <p style="margin:0 0 16px;">
      Your workflows continue to run. Each additional 1,000 executions are billed at
      <strong>$${args.overageUsdPer1k}</strong>, added to your next invoice.
      ${over > 0 ? `So far this period you're <strong>${over.toLocaleString()}</strong> over — projected overage today: <strong>$${(projectedCents / 100).toFixed(2)}</strong>.` : ""}
    </p>
    <p style="margin:0 0 24px;">Period ends <strong>${args.periodEnd.toUTCString()}</strong>.</p>
    <p style="margin:0 0 24px;">
      <a href="${process.env.PUBLIC_BASE_URL ?? ""}/dashboard" style="display:inline-block;background:#14110f;color:#f6f3ec;text-decoration:none;padding:10px 18px;border-radius:999px;font-family:-apple-system,sans-serif;font-size:14px;font-weight:500;">
        Open dashboard →
      </a>
    </p>
  `;
  return sendEmail({
    to: args.to,
    subject: "You've hit your monthly execution allowance",
    html: emailLayout({
      title: "Allowance reached",
      preheader: "Workflows still running. Overage billing kicks in.",
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
