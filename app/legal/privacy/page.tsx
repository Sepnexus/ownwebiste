import type { Metadata } from "next";
import { BUSINESS } from "@/lib/business";
import DocHead from "../_components/DocHead";
import Checks from "../_components/Checks";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How Sepnexus handles your data.",
  alternates: { canonical: "/legal/privacy" },
};

const email = BUSINESS.supportEmail;

// Design: Legal.dc.html, "Privacy Policy" tab. Section text is our own policy.
export default function PrivacyPage() {
  return (
    <>
      <DocHead title="Privacy Policy" updated="2026-05-10" />
      <p>
        This policy explains how {BUSINESS.legalName} (“Sepnexus”), registered in{" "}
        {BUSINESS.address.city}, {BUSINESS.address.country}, collects and uses personal
        information when you visit our website, contact us or use our services.
      </p>
      <p>
        We collect the minimum we need to do the work. We don’t sell or share your data. Below
        is the full picture.
      </p>

      <h2>What we collect</h2>
      <p>
        <strong>From the contact form:</strong> name, email, company, message, plus IP and
        user-agent for spam prevention.
      </p>
      <p>
        <strong>From customer accounts:</strong> email, name, hashed password (we never see the
        plaintext), and metadata required to operate your subscription.
      </p>
      <p>
        <strong>Payments:</strong> handled entirely by Razorpay. We store a subscription ID, not
        your card.
      </p>
      <p>
        <strong>Operational data:</strong> server logs (kept 30 days), audit log of admin actions
        on your account.
      </p>

      <h2>How we use it</h2>
      <Checks
        items={[
          "To deliver the service you subscribed to.",
          "To send transactional email (account, billing, security).",
          "To investigate abuse, fraud or security incidents.",
        ]}
      />

      <h2>Who we share it with</h2>
      <p>
        Sub-processors: Razorpay (payments), Resend (transactional email), the cloud hosts where
        we run agents and applications you’ve commissioned.
      </p>

      <h2>Data residency</h2>
      <p>Primary infrastructure runs on EU-based VPS providers. Backups are encrypted.</p>

      <h2>How long we keep it</h2>
      <p>
        Server logs are kept 30 days. The audit log of admin actions on your account is retained
        12 months.
      </p>

      <h2>Your rights (GDPR &amp; equivalents)</h2>
      <p>
        <strong>Access</strong> — request a copy of your data: email{" "}
        <a href={`mailto:${email}`}>{email}</a>.
      </p>
      <p>
        <strong>Deletion</strong> — close your account from the dashboard or email us.
      </p>
      <p>
        <strong>Rectification</strong> — edit your details from the dashboard.
      </p>
      <p>
        <strong>Portability</strong> — we’ll export your data as JSON on request.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about privacy? Email <a href={`mailto:${email}`}>{email}</a>.
      </p>
    </>
  );
}
