import type { Metadata } from "next";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How Sepnexus handles your data.",
};

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main className="page">
        <div className="page-narrow prose">
          <span className="page-eyebrow">Legal — Privacy</span>
          <h1 className="page-title">Privacy.</h1>
          <p className="page-lede">
            We collect the minimum we need to do the work. We don&apos;t sell or share your data.
            Below is the full picture.
          </p>

          <h2>What we collect</h2>
          <ul>
            <li>
              <strong>From the contact form:</strong> name, email, company, message, plus IP and
              user-agent for spam prevention.
            </li>
            <li>
              <strong>From customer accounts:</strong> email, name, hashed password (we never see
              the plaintext), and metadata required to operate your subscription.
            </li>
            <li>
              <strong>Payments:</strong> handled entirely by Razorpay. We store a subscription ID,
              not your card.
            </li>
            <li>
              <strong>Operational data:</strong> server logs (kept 30 days), audit log of admin
              actions on your account.
            </li>
          </ul>

          <h2>How we use it</h2>
          <ul>
            <li>To deliver the service you subscribed to.</li>
            <li>To send transactional email (account, billing, security).</li>
            <li>To investigate abuse, fraud or security incidents.</li>
          </ul>

          <h2>Your rights (GDPR &amp; equivalents)</h2>
          <ul>
            <li>Access — request a copy of your data: email akshay@sepnexus.com.</li>
            <li>Deletion — close your account from the dashboard or email us.</li>
            <li>Rectification — edit your details from the dashboard.</li>
            <li>Portability — we&apos;ll export your data as JSON on request.</li>
          </ul>

          <h2>Data residency</h2>
          <p>
            Primary infrastructure runs on EU-based VPS providers. Backups are encrypted. Sub-
            processors: Razorpay (payments), Resend (transactional email), the cloud hosts where
            we run agents and applications you&apos;ve commissioned.
          </p>

          <h2>Contact</h2>
          <p>
            Questions or requests:{" "}
            <a href="mailto:akshay@sepnexus.com">akshay@sepnexus.com</a>.
          </p>
          <p style={{ color: "var(--muted)", fontSize: 13 }}>Last updated: 2026-05-10.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
