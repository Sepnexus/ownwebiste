import type { Metadata } from "next";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import CTA from "@/components/sections/CTA";

export const metadata: Metadata = {
  title: "About",
  description:
    "Sepnexus is a small studio of senior engineers, designers and AI researchers building autonomous systems for teams that refuse the status quo.",
};

const PRINCIPLES = [
  {
    n: "01",
    title: "Systems, not scripts.",
    body: "We build durable systems with versioning, observability, rollbacks and SLAs — not one-shot prototypes that rot the moment the demo ends.",
  },
  {
    n: "02",
    title: "Operate what we ship.",
    body: "If something we built is on fire at 3 a.m., we're already on it. We don't hand off to an in-house team that has never seen the code.",
  },
  {
    n: "03",
    title: "Right-sized intelligence.",
    body: "80% of work is deterministic — we automate it deterministically. Agents are reserved for the genuinely fuzzy 20% where reasoning earns its cost.",
  },
  {
    n: "04",
    title: "Plain language, plain pricing.",
    body: "Subscriptions billed monthly or yearly, USD, no surprise overages. Custom builds quoted up front. No retainers that quietly creep.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Nav />
      <main className="page">
        <div className="page-narrow">
          <span className="page-eyebrow reveal">About — Sepnexus</span>
          <h1 className="page-title reveal">
            We build the <em>quiet machines</em>
            <br /> that keep modern businesses running.
          </h1>
          <p className="page-lede reveal">
            Sepnexus is a studio of senior engineers, designers and AI researchers. We deploy
            autonomous agents, automate the operations that drain your team, and run the cloud
            those systems live on. We are small on purpose — most engagements are led by the
            people writing the code.
          </p>

          <div className="prose reveal">
            <h2>What we do, in plain language</h2>
            <p>
              Most teams already know where they bleed: the inbox triage that swallows mornings,
              the spreadsheet ritual that nobody trusts, the dashboard that doesn&apos;t reflect
              reality. We build the things that close those loops and then we run them.
            </p>
            <p>
              Concretely, that means autonomous AI agents wired into your stack, deterministic
              automation pipelines for the boring 80%, data infrastructure that surfaces decisions
              instead of charts, and the cloud platform that hosts all of it under a contract your
              CTO can sign.
            </p>

            <h2>How we work</h2>
            <p>
              We embed for two weeks before we propose anything. We map the workflow, watch the
              humans, and walk away with a blueprint that says exactly what gets built, what
              doesn&apos;t, and what it costs. Then we ship — usually in two-week iterations,
              demoed live — and we keep operating it after the launch.
            </p>
            <p>
              We&apos;ll happily say no to projects that should be a SaaS subscription. The work
              we take is the work that needs us specifically.
            </p>

            <h2>Principles</h2>
          </div>

          <div className="reveal" style={{ display: "grid", gap: 18, marginTop: 8 }}>
            {PRINCIPLES.map((p) => (
              <div
                key={p.n}
                style={{
                  display: "grid",
                  gridTemplateColumns: "60px 1fr",
                  gap: 24,
                  padding: "24px 0",
                  borderTop: "1px solid var(--line)",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 13,
                    color: "var(--muted)",
                    letterSpacing: "0.06em",
                  }}
                >
                  {p.n}
                </span>
                <div>
                  <h3
                    style={{
                      fontFamily: "var(--serif)",
                      fontWeight: 400,
                      fontSize: 26,
                      letterSpacing: "-0.01em",
                      margin: "0 0 8px",
                      color: "var(--ink)",
                    }}
                  >
                    {p.title}
                  </h3>
                  <p style={{ margin: 0, color: "var(--ink-2)", lineHeight: 1.6 }}>{p.body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="prose reveal" style={{ marginTop: 56 }}>
            <h2>Where we are</h2>
            <p>
              Sepnexus operates remotely with a core team across the EU and Asia-Pacific. We take
              a limited number of engagements at any one time so the people who scoped your work
              are the people who do it.
            </p>

            <h2>Want to work with us?</h2>
            <p>
              Engagements are invitation-based — start with the{" "}
              <a href="/contact?type=request_access">access request form</a>. Tell us about the
              loop you want closed and we&apos;ll come back within 48 hours.
            </p>
          </div>
        </div>
      </main>
      <CTA />
      <Footer />
    </>
  );
}
