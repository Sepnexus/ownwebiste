import type { Metadata } from "next";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";

export const metadata: Metadata = {
  title: "DPA",
  description: "Data processing agreement for Sepnexus customers.",
};

export default function DpaPage() {
  return (
    <>
      <Nav />
      <main className="page">
        <div className="page-narrow prose">
          <span className="page-eyebrow">Legal — Data Processing</span>
          <h1 className="page-title">Data processing agreement.</h1>
          <p className="page-lede">
            For EU and EU-customer-facing engagements we sign a standard DPA built on the
            European Commission&apos;s Standard Contractual Clauses.
          </p>

          <h2>Roles</h2>
          <p>
            For data your customers entrust to you, you are the controller and Sepnexus is the
            processor. For data you create with us (account credentials, billing), Sepnexus is
            the controller.
          </p>

          <h2>Sub-processors</h2>
          <ul>
            <li>Razorpay — payments processing.</li>
            <li>Resend — transactional email.</li>
            <li>Hetzner / Hostinger / AWS / GCP — infrastructure hosting (per engagement).</li>
            <li>Cloudflare — CDN and DDoS protection (where enabled).</li>
          </ul>
          <p>
            We give you 30 days&apos; notice before adding a new sub-processor that handles
            customer data.
          </p>

          <h2>Request the DPA</h2>
          <p>
            Email <a href="mailto:akshay@sepnexus.com">akshay@sepnexus.com</a> and we&apos;ll
            send the latest signed version within one business day.
          </p>
          <p style={{ color: "var(--muted)", fontSize: 13 }}>Last updated: 2026-05-10.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
