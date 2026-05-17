import type { Metadata } from "next";
import { Suspense } from "react";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import ContactForm from "./_components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Tell Sepnexus about the loop you want closed. Engagements are invitation-based; we respond within 48 hours.",
};

export default function ContactPage() {
  return (
    <>
      <Nav />
      <main className="page">
        <div className="page-narrow">
          <span className="page-eyebrow reveal">Contact — Get in touch</span>
          <h1 className="page-title reveal">
            Tell us about
            <br />
            <em>the loop you want closed.</em>
          </h1>
          <p className="page-lede reveal">
            Sepnexus is invitation-based. Drop us a line — we read every message and reply within
            48 hours from akshay@sepnexus.com.
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
