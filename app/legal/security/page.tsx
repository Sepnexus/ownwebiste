import type { Metadata } from "next";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";

export const metadata: Metadata = {
  title: "Security",
  description: "How Sepnexus secures your account and data.",
};

export default function SecurityPage() {
  return (
    <>
      <Nav />
      <main className="page">
        <div className="page-narrow prose">
          <span className="page-eyebrow">Legal — Security</span>
          <h1 className="page-title">Security.</h1>
          <p className="page-lede">
            We treat security as a precondition, not a feature. Below is what we do today.
          </p>

          <h2>Authentication</h2>
          <ul>
            <li>Passwords hashed with scrypt — we never see plaintext.</li>
            <li>HttpOnly, Secure, SameSite=lax session cookies signed with HMAC-SHA256.</li>
            <li>Sessions expire after 30 days of inactivity.</li>
            <li>Brute-force protection on login (rate limited).</li>
          </ul>

          <h2>Transport</h2>
          <ul>
            <li>TLS 1.2+ enforced on every endpoint via Traefik.</li>
            <li>HSTS preload-eligible.</li>
            <li>Strict CSP on admin and customer dashboards.</li>
          </ul>

          <h2>Data</h2>
          <ul>
            <li>Postgres on encrypted volumes, daily off-host backups, monthly restore drills.</li>
            <li>No card data on our servers — payments delegated entirely to Razorpay.</li>
            <li>Audit log of admin actions on customer accounts, retained 12 months.</li>
          </ul>

          <h2>Reporting issues</h2>
          <p>
            Found a vulnerability? Please email{" "}
            <a href="mailto:security@sepnexus.com">security@sepnexus.com</a>. We&apos;ll
            acknowledge within 24 hours.
          </p>
          <p style={{ color: "var(--muted)", fontSize: 13 }}>Last updated: 2026-05-10.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
