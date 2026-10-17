import type { Metadata } from "next";
import { Suspense } from "react";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import ContactForm from "./_components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Tell Sepnexus what you want automated or built — AI agents, lead follow-up, deal tools, dashboards or hosting. We reply within 48 hours.",
};

export default function ContactPage() {
  return (
    <>
      <Nav />
      <main id="main" className="page">
        <div className="page-narrow">
          <span className="page-eyebrow reveal">Contact — Get in touch</span>
          <h1 className="page-title reveal">
            Tell us about
            <br />
            <em>the loop you want closed.</em>
          </h1>
          <p className="page-lede reveal">
            Lead follow-up, AI calling, comping, reporting, hosting — or something we haven&apos;t
            listed. We read every message and reply within 48 hours from akshay@sepnexus.com.
          </p>
          <Suspense fallback={null}>
            <ContactForm />
          </Suspense>
          <div
            className="reveal"
            style={{
              marginTop: 60,
              paddingTop: 28,
              borderTop: "1px solid var(--line)",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 20,
              color: "var(--muted)",
              fontSize: 14,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 11,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--ink)",
                  marginBottom: 6,
                }}
              >
                Email
              </div>
              <a
                href="mailto:akshay@sepnexus.com"
                style={{ color: "var(--ink-2)" }}
              >
                akshay@sepnexus.com
              </a>
            </div>
            <div>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 11,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--ink)",
                  marginBottom: 6,
                }}
              >
                Hours
              </div>
              Mon–Fri, 9:00–18:00 IST. Async otherwise.
            </div>
            <div>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 11,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--ink)",
                  marginBottom: 6,
                }}
              >
                Existing customer?
              </div>
              <a href="/login" style={{ color: "var(--ink-2)" }}>
                Sign in to your dashboard →
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
