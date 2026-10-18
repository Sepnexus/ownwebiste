import type { Metadata } from "next";
import { BUSINESS } from "@/lib/business";
import DocHead from "../_components/DocHead";

export const metadata: Metadata = {
  title: "Terms",
  description: "Sepnexus terms of service.",
  alternates: { canonical: "/legal/terms" },
};

// Design: Legal.dc.html, "Terms of Service" tab. Section text is our own terms.
export default function TermsPage() {
  return (
    <>
      <DocHead title="Terms of Service" updated="2026-05-10" />
      <p>
        These terms govern your use of the Sepnexus website, client dashboard and services
        provided by {BUSINESS.legalName}. The full master services agreement is signed per
        engagement.
      </p>

      <h2>Service availability</h2>
      <p>
        We target 99.9% uptime on shared services and 99.99% on dedicated. Specific SLAs and
        credits are defined in your engagement agreement.
      </p>

      <h2>Acceptable use</h2>
      <p>
        Don’t use Sepnexus to host illegal content, send unsolicited bulk email, attack other
        systems, or violate the rights of others. We will suspend accounts that do.
      </p>

      <h2>Subscriptions &amp; billing</h2>
      <p>
        Subscriptions are billed monthly or yearly in USD via Razorpay. Custom builds are quoted
        in writing before work starts.
      </p>
      <p>
        You can cancel any time from your dashboard; cancellations take effect at the end of the
        current billing period.
      </p>

      <h2>Liability</h2>
      <p>
        Our liability for any subscription is capped at the fees paid in the 12 months preceding
        the incident. Custom builds carry their own caps in the project agreement.
      </p>

      <h2>Changes</h2>
      <p>We may update these terms; we’ll email customers 30 days before any material change.</p>
    </>
  );
}
