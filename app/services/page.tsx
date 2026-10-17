import type { Metadata } from "next";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import CTA from "@/components/sections/CTA";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Estate 360 AI agents for real estate investors, follow-up automation, comping and underwriting tools, KPI dashboards, managed hosting and custom web apps from Sepnexus.",
};

type Service = {
  id: string;
  n: string;
  color: string;
  title: string;
  body: string;
  bullets: string[];
  outcomes: string[];
  stack: string[];
};

const SERVICES: Service[] = [
  {
    id: "estate360",
    n: "01",
    color: "var(--c-magenta)",
    title: "Estate 360 agents",
    body:
      "A set of AI agents built for real estate investors and wholesalers. They work the top of your funnel around the clock: replying to sellers by text, calling leads, asking the questions your acquisitions team would ask, and booking the appointment. Your team only talks to people who are ready.",
    bullets: [
      "AI texting agents that reply to sellers in seconds, in a natural tone",
      "AI calling agents that qualify leads and book appointments on your calendar",
      "Qualification on the four things that matter: condition, timeline, motivation, price",
      "Hand-off to a human the moment a lead is hot, with a summary of the conversation",
      "Every message, call and outcome written back to your CRM",
      "Acquisitions coaching: call reviews and summaries that help reps improve",
    ],
    outcomes: [
      "No lead waits hours for a first reply",
      "Acquisitions reps spend their day on appointments, not cold follow-up",
      "A full record of every seller conversation, in one place",
      "Works with the lists, campaigns and CRM you already run",
    ],
    stack: ["GoHighLevel", "n8n", "OpenAI", "Claude", "Retell AI", "CloseBot"],
  },
  {
    id: "automation",
    n: "02",
    color: "var(--c-orange)",
    title: "Follow-up automation",
    body:
      "Most of the work that slips through the cracks doesn't need a person — it needs a workflow that runs the same way every time. We build those in GoHighLevel and n8n, and add AI only where a step genuinely needs judgement, like reading a seller's reply.",
    bullets: [
      "SMS and email campaigns by list and niche, with follow-up that never forgets",
      "AI reply sorting: interested, not interested, wrong number, call me later",
      "Speed-to-lead: instant replies, call tasks and alerts for new leads",
      "Pipeline updates, tags and tasks set automatically in your CRM",
      "Contract and document steps automated, including browser-based tools",
      "Hosted n8n on our servers, or on your own",
    ],
    outcomes: [
      "Hours of copy-paste and manual follow-up taken off your team each week",
      "Leads move through your pipeline without anyone pushing them",
      "Fewer dropped balls when someone is out sick or on vacation",
    ],
    stack: ["GoHighLevel", "n8n", "OpenAI", "Webhooks", "Skyvern"],
  },
  {
    id: "deals",
    n: "03",
    color: "var(--c-yellow)",
    title: "Deal tools & dashboards",
    body:
      "Software for the part of the business that decides what to offer and whether it's working. Comping and underwriting tools that turn an address into an offer range, and dashboards that show the whole business — from marketing spend to closed revenue — on one screen.",
    bullets: [
      "Comps, ARV and current market value from recent sales",
      "AI repair estimates based on the property's condition",
      "Offer calculators for each of your exit strategies, with your own formulas",
      "Numbers pushed straight to the deal record in your CRM",
      "KPI dashboards: leads by source, cost per lead, offers, contracts, revenue",
      "Sales, finance and marketing views per rep, per market, per month",
    ],
    outcomes: [
      "Consistent offers, no matter which rep runs the numbers",
      "Underwriting in minutes instead of a spreadsheet afternoon",
      "One number everyone agrees on, every Monday morning",
    ],
    stack: ["Next.js", "React", "Supabase", "Postgres", "OpenAI", "GoHighLevel API"],
  },
  {
    id: "hosting",
    n: "04",
    color: "var(--c-cyan)",
    title: "Managed hosting",
    body:
      "We host what we build, and we can host what you already have. Your automations, agents, dashboards and web apps run on servers we set up, secure and keep an eye on — so you have one team to call, not three.",
    bullets: [
      "Managed n8n: shared plans, or your own dedicated server in queue mode",
      "Hosting for websites, portals and SaaS apps, deployed straight from Git",
      "Free SSL on every site, renewed automatically",
      "Scheduled backups and monitoring with alerts",
      "Updates and security patches handled for you",
    ],
    outcomes: [
      "No servers for you or your team to look after",
      "Problems caught by us before your customers notice",
      "Simple monthly or yearly billing in USD",
    ],
    stack: ["Docker", "n8n", "Postgres", "Traefik", "Cloudflare", "Linux VPS"],
  },
  {
    id: "business",
    n: "05",
    color: "var(--c-purple)",
    title: "AI for any business",
    body:
      "Real estate is where we started, not where we stop. The same agents, automations and integrations work in any business with leads to answer, documents to produce or tools that don't talk to each other.",
    bullets: [
      "AI assistants for sales and customer support, trained on your own material",
      "Proposal, quote and document automation",
      "Connections between your CRM, inbox, calendar, payments and spreadsheets",
      "Custom tools that let AI assistants such as Claude work with your systems (MCP)",
      "Meeting and call summaries sent to the right place automatically",
    ],
    outcomes: [
      "The tools you already pay for start working together",
      "Routine questions answered without waiting for a person",
      "Less time on admin, more on the work that earns money",
    ],
    stack: ["Claude", "OpenAI", "n8n", "MCP", "REST APIs", "Fathom"],
  },
  {
    id: "apps",
    n: "06",
    color: "var(--c-red)",
    title: "Web apps & portals",
    body:
      "When an off-the-shelf tool doesn't fit, we build one that does. Websites, portals and full SaaS products, designed and built by the same team that runs your automations, so everything fits together.",
    bullets: [
      "Partner and JV portals for sharing deals with buyers and partners",
      "Hiring portals for acquisitions and dispositions roles",
      "Client dashboards and internal tools with sign-in and roles",
      "Full SaaS products, including billing and subscriptions",
      "Fast, mobile-friendly marketing sites",
    ],
    outcomes: [
      "Software shaped around your process, not the other way round",
      "One team for the app, the automations and the hosting",
      "Something you own, not another monthly seat",
    ],
    stack: ["Next.js", "React", "Supabase", "Postgres", "Express", "Docker"],
  },
];

export default function ServicesPage() {
  return (
    <>
      <Nav />
      <main className="page">
        <div className="page-narrow">
          <span className="page-eyebrow reveal">Services — Capabilities</span>
          <h1 className="page-title reveal">
            Built for real estate.
            <br />
            <em>Useful in</em> any business.
          </h1>
          <p className="page-lede reveal">
            Most of what we build started with real estate investors: AI agents that work
            leads, automation that follows up, tools that run the numbers and dashboards that
            show the business. Below is everything we can put together for you.
          </p>
        </div>

        <div className="page-narrow" style={{ display: "grid", gap: 80, marginTop: 56 }}>
          {SERVICES.map((s) => (
            <article
              key={s.id}
              id={s.id}
              className="reveal"
              style={{
                display: "grid",
                gap: 24,
                paddingTop: 24,
                borderTop: "1px solid var(--line)",
                scrollMarginTop: 100,
              }}
            >
              <header
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr",
                  gap: 20,
                  alignItems: "baseline",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 13,
                    letterSpacing: "0.06em",
                    color: s.color,
                  }}
                >
                  {s.n}
                </span>
                <h2
                  style={{
                    fontFamily: "var(--serif)",
                    fontWeight: 400,
                    fontSize: "clamp(32px, 4vw, 48px)",
                    letterSpacing: "-0.018em",
                    lineHeight: 1.05,
                    margin: 0,
                    color: "var(--ink)",
                  }}
                >
                  {s.title}
                </h2>
              </header>

              <p style={{ margin: 0, fontSize: 17, lineHeight: 1.6, color: "var(--ink-2)", maxWidth: "70ch" }}>
                {s.body}
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: 28,
                  marginTop: 12,
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: 11,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--muted)",
                      marginBottom: 12,
                    }}
                  >
                    What we build
                  </div>
                  <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 8 }}>
                    {s.bullets.map((b) => (
                      <li
                        key={b}
                        style={{
                          fontSize: 14,
                          lineHeight: 1.55,
                          color: "var(--ink-2)",
                          paddingLeft: 18,
                          position: "relative",
                        }}
                      >
                        <span
                          style={{
                            position: "absolute",
                            left: 0,
                            top: 4,
                            color: s.color,
                            fontFamily: "var(--mono)",
                            fontSize: 11,
                          }}
                        >
                          ▸
                        </span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: 11,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--muted)",
                      marginBottom: 12,
                    }}
                  >
                    Outcomes
                  </div>
                  <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 8 }}>
                    {s.outcomes.map((b) => (
                      <li
                        key={b}
                        style={{ fontSize: 14, lineHeight: 1.55, color: "var(--ink-2)" }}
                      >
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                {s.stack.map((t) => (
                  <span
                    key={t}
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: 11,
                      letterSpacing: "0.04em",
                      padding: "4px 10px",
                      border: "1px solid var(--line)",
                      borderRadius: 999,
                      color: "var(--muted)",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </main>
      <CTA />
      <Footer />
    </>
  );
}
