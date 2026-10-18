import type { Metadata } from "next";
import { BUSINESS } from "@/lib/business";
import DocHead from "../_components/DocHead";
import Checks from "../_components/Checks";

export const metadata: Metadata = {
  title: "Security",
  description: "How Sepnexus secures your account and data.",
  alternates: { canonical: "/legal/security" },
};

const email = BUSINESS.supportEmail;

// Design: Legal.dc.html, "Security" tab. Section text is our own security page.
export default function SecurityPage() {
  return (
    <>
      <DocHead title="Security" updated="2026-05-10" />
      <p>
        We operate what we ship. Every system we build and host is logged, monitored and
        maintained by the same team that built it.
      </p>
      <p>We treat security as a precondition, not a feature. Below is what we do today.</p>
      <div className="sec-grid">
        <div>
          <b>Encryption in transit</b>
          <span>Free SSL on every site, renewed automatically.</span>
        </div>
        <div>
          <b>Backups</b>
          <span>Scheduled backups with a tested restore path.</span>
        </div>
        <div>
          <b>Monitoring</b>
          <span>Alerts route to Sepnexus first, so issues are caught early.</span>
        </div>
        <div>
          <b>Patching</b>
          <span>Updates and security patches handled by us.</span>
        </div>
        <div>
          <b>Access control</b>
          <span>Sign-in and role permissions on dashboards and portals.</span>
        </div>
        <div>
          <b>Isolation</b>
          <span>Dedicated servers available for workloads that need them.</span>
        </div>
      </div>

      <h2>Authentication</h2>
      <Checks
        items={[
          "Passwords hashed with scrypt — we never see plaintext.",
          "HttpOnly, Secure, SameSite=lax session cookies signed with HMAC-SHA256.",
          "Sessions expire after 30 days of inactivity.",
          "Brute-force protection on login (rate limited).",
        ]}
      />

      <h2>Transport</h2>
      <Checks
        items={[
          "TLS 1.2+ enforced on every endpoint via Traefik.",
          "HSTS preload-eligible.",
          "Strict CSP on admin and customer dashboards.",
        ]}
      />

      <h2>Infrastructure</h2>
      <p>Primary infrastructure runs on EU-based VPS providers. Backups are encrypted.</p>
      <Checks
        items={[
          "Postgres on encrypted volumes, daily off-host backups, monthly restore drills.",
          "No card data on our servers — payments delegated entirely to Razorpay.",
          "Audit log of admin actions on customer accounts, retained 12 months.",
        ]}
      />

      <h2>Reporting a vulnerability</h2>
      <p>
        Found a security issue? Email <a href={`mailto:${email}`}>{email}</a> and we’ll
        acknowledge within 24 hours.
      </p>
    </>
  );
}
