import type { Metadata } from "next";
import Link from "next/link";
import { BUSINESS } from "@/lib/business";
import DocHead from "../_components/DocHead";

export const metadata: Metadata = {
  title: "DPA",
  description: "Data processing agreement for Sepnexus customers.",
  alternates: { canonical: "/legal/dpa" },
};

const email = BUSINESS.supportEmail;

// Design: Legal.dc.html, "Data Processing (DPA)" tab. Section text is our own DPA page.
export default function DpaPage() {
  return (
    <>
      <DocHead title="Data Processing Agreement" updated="2026-05-10" />
      <p>
        This agreement applies where Sepnexus processes personal data on behalf of a client as
        part of the services.
      </p>
      <p>
        For EU and EU-customer-facing engagements we sign a standard DPA built on the European
        Commission’s Standard Contractual Clauses.
      </p>

      <h2>Scope &amp; roles</h2>
      <p>
        For data your customers entrust to you, you are the controller and Sepnexus is the
        processor. For data you create with us (account credentials, billing), Sepnexus is the
        controller.
      </p>

      <h2>Sub-processors</h2>
      <p>
        <strong>Razorpay</strong> — payments processing.
      </p>
      <p>
        <strong>Resend</strong> — transactional email.
      </p>
      <p>
        <strong>Hetzner / Hostinger / AWS / GCP</strong> — infrastructure hosting (per
        engagement).
      </p>
      <p>
        <strong>Cloudflare</strong> — CDN and DDoS protection (where enabled).
      </p>
      <p>
        We give you 30 days’ notice before adding a new sub-processor that handles customer data.
      </p>

      <h2>Security measures</h2>
      <p>
        See our <Link href="/legal/security">Security page</Link> for the measures we apply to
        every system.
      </p>

      <h2>Request the DPA</h2>
      <p>
        Email <a href={`mailto:${email}`}>{email}</a> and we’ll send the latest signed version
        within one business day.
      </p>
    </>
  );
}
