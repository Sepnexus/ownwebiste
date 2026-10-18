import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import SiteShell from "@/components/site/SiteShell";
import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";
import ContactForm, { ContactFormFromQuery } from "./_components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Tell us about the loop you want closed. Lead follow-up, AI calling, comping, reporting, hosting — or something we haven’t listed. We read every message and reply within 48 hours.",
  alternates: { canonical: "/contact" },
};

// Ported from the Claude Design file Contact.dc.html. Markup, classes and wording
// match the design exactly; styles live in styles/site/base.css + contact.css.
export default function ContactPage() {
  return (
    <SiteShell page="contact">
      <SiteNav current="contact" />
      <main id="main">
        <section className="phero" style={{ paddingBottom: "120px" }}>
          <div className="phero-glow" aria-hidden="true" />
          <div className="wrap split split-top">
            <div className="phero-in">
              <span className="eyebrow mono in d1">
                <span className="live" aria-hidden="true" />
                Contact · Taking new projects
              </span>
              <h1 className="h-l in d2">
                Tell us about the loop you want <span className="grad">closed.</span>
              </h1>
              <p className="lede in d3">
                Lead follow-up, AI calling, comping, reporting, hosting — or something we haven’t
                listed. We read every message and reply within 48 hours.
              </p>
              <div className="info in d4" style={{ marginTop: "12px" }}>
                <div>
                  <span className="mono">Email</span>
                  <a href="mailto:akshay@sepnexus.com">akshay@sepnexus.com</a>
                </div>
                <div>
                  <span className="mono">Hours</span>
                  <span>Mon–Fri, 9:00–18:00 IST. Async otherwise.</span>
                </div>
                <div>
                  <span className="mono">Based in</span>
                  <span>Chandigarh, India · working with the US and worldwide</span>
                </div>
              </div>
            </div>

            <div className="form-card in d3">
              {/* The query (?type=…) is read on the client; until then the
                  default form shows, so the card is never empty. */}
              <Suspense fallback={<ContactForm />}>
                <ContactFormFromQuery />
              </Suspense>
            </div>
          </div>
        </section>

        <section className="sec sec-light" style={{ paddingTop: "120px" }}>
          <div className="wrap">
            <div className="sec-head rv">
              <span className="mono" style={{ color: "#86868b" }}>
                What happens next
              </span>
              <h2 className="h-l">From message to plan.</h2>
            </div>
            <div className="next">
              <div className="pstep rv">
                <span className="mono">Within 48 hours</span>
                <h3>We reply</h3>
                <p>A real person reads your message and suggests a next step.</p>
              </div>
              <div className="pstep rv">
                <span className="mono">Discovery call</span>
                <h3>We learn your pipeline</h3>
                <p>Your tools, your numbers and where things leak.</p>
              </div>
              <div className="pstep rv">
                <span className="mono">Written plan</span>
                <h3>You see it in writing</h3>
                <p>Scope, cost and timeline — before any work starts.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="sec-s">
          <div className="wrap">
            <div className="exist rv">
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <span className="mono dim">Existing customer?</span>
                <b style={{ fontSize: "22px", fontWeight: "600", letterSpacing: "-.02em" }}>
                  Your dashboard has everything in one place.
                </b>
              </div>
              <Link className="btn btn-ghost" href="/login">
                Sign in to your dashboard
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </SiteShell>
  );
}
