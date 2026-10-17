import type { Metadata } from "next";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import CTA from "@/components/sections/CTA";

export const metadata: Metadata = {
  title: "About",
  description:
    "Sepnexus builds AI agents, automation and custom software for real estate investors and growing businesses. Based in Chandigarh, India, working with clients in the US and worldwide.",
};

const PRINCIPLES = [
  {
    n: "01",
    title: "Systems, not scripts.",
    body: "We build things that keep working after the demo: logged, monitored and easy to change. Not one-off scripts that break the first time a lead replies in a way nobody expected.",
  },
  {
    n: "02",
    title: "Operate what we ship.",
    body: "If something we built stops working, we're the ones who fix it. We don't hand over the code and disappear.",
  },
  {
    n: "03",
    title: "AI where it earns its keep.",
    body: "Most work just needs a reliable workflow. We use AI where judgement matters — reading a seller's reply, qualifying a lead, estimating repairs — and plain automation everywhere else.",
  },
  {
    n: "04",
    title: "Plain language, plain pricing.",
    body: "Subscriptions billed monthly or yearly in USD. Custom builds quoted in writing before work starts. No retainers that quietly creep.",
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
            Sepnexus builds AI agents, automation and custom software for real estate investors
            and growing businesses. Most of our work is in real estate investing — lead
            follow-up, AI calling, comping and KPI tracking — and the same tools work for any team
            that wants more done without adding headcount. We&apos;re small on purpose: the
            people who scope your project are the people who build it.
          </p>

          <div className="prose reveal">
            <h2>What we do, in plain language</h2>
            <p>
              Most investors already know where deals leak: leads that wait hours for a reply,
              follow-up that stops after the second text, offers worked out differently by every
              rep, and numbers nobody trusts on Monday morning. We build the things that fix those
              leaks, and then we keep them running.
            </p>
            <p>
              In practice, that means Estate 360 agents that text and call sellers and book
              appointments, follow-up automation in GoHighLevel and n8n, comping and underwriting
              tools, KPI dashboards, partner and hiring portals, and the hosting all of it runs
              on. Outside real estate, the same toolkit powers AI assistants, document automation
              and integrations for other kinds of businesses.
            </p>

            <h2>How we work</h2>
            <p>
              We start with a call to map how leads, deals and data move through your business
              today. Then we send a written plan: what gets built, what doesn&apos;t, what it costs
              and how long it takes. We build in short steps you can see and try, connect
              everything to the tools you already use, and keep it running after launch if you
              want us to.
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
              Sepnexus OPC Pvt Ltd is registered in Chandigarh, India. We work remotely with real
              estate investors across the US and with businesses worldwide, and we take a limited
              number of projects at a time so the person who scoped your work is the one building
              it.
            </p>

            <h2>Want to work with us?</h2>
            <p>
              Start with the <a href="/contact?type=project_inquiry">project form</a>. Tell us
              what you want automated or built and we&apos;ll come back within 48 hours.
            </p>
          </div>
        </div>
      </main>
      <CTA />
      <Footer />
    </>
  );
}
