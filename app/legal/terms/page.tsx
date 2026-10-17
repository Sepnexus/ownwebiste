import type { Metadata } from "next";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";

export const metadata: Metadata = {
  title: "Terms",
  description: "Sepnexus terms of service.",
};

export default function TermsPage() {
  return (
    <>
      <Nav />
      <main id="main" className="page">
        <div className="page-narrow prose">
          <span className="page-eyebrow">Legal — Terms</span>
          <h1 className="page-title">Terms.</h1>
          <p className="page-lede">
            Plain-language terms for using Sepnexus. The full master services agreement is signed
            per engagement.
          </p>

          <h2>Subscriptions</h2>
          <p>
            Subscriptions are billed monthly or yearly in USD via Razorpay. You can cancel any
            time from your dashboard; cancellations take effect at the end of the current billing
            period.
          </p>

          <h2>Acceptable use</h2>
          <p>
            Don&apos;t use Sepnexus to host illegal content, send unsolicited bulk email, attack
            other systems, or violate the rights of others. We will suspend accounts that do.
          </p>

          <h2>Service availability</h2>
          <p>
            We target 99.9% uptime on shared services and 99.99% on dedicated. Specific SLAs and
            credits are defined in your engagement agreement.
          </p>

          <h2>Liability</h2>
          <p>
            Our liability for any subscription is capped at the fees paid in the 12 months
            preceding the incident. Custom builds carry their own caps in the project agreement.
          </p>

          <h2>Changes</h2>
          <p>
            We may update these terms; we&apos;ll email customers 30 days before any material
            change.
          </p>
          <p style={{ color: "var(--muted)", fontSize: 13 }}>Last updated: 2026-05-10.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
