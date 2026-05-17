import type { Metadata } from "next";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import CTA from "@/components/sections/CTA";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Autonomous AI agents, process automation, data pipelines, managed hosting, custom integrations and product development from Sepnexus.",
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
    id: "agents",
    n: "01",
    color: "var(--c-magenta)",
    title: "Autonomous AI agents",
    body:
      "We design and operate autonomous agents that run inside your stack — researching, deciding and acting on real work without a human in the loop on every step. Each agent is paired with an evaluation harness, observable memory and explicit guardrails so you know what it does, why, and how often.",
    bullets: [
      "Multi-step reasoning with planning + tool use, on Claude, GPT or Gemini",
      "Persistent memory: episodic + semantic, with vector + relational backends",
      "RAG pipelines over your private knowledge with provenance",
      "Eval harness — every release is graded against a frozen test bench",
      "Guardrails: input filters, action allow-lists, audit trail per decision",
      "Human-in-the-loop checkpoints for high-impact actions",
    ],
    outcomes: [
      "Tier-1 support handled end-to-end with measurable CSAT",
      "Sales research + outbound drafted, never sent without approval",
      "Finance reconciliation, anomaly flagging, draft journal entries",
      "Inbox triage, meeting prep, follow-up automation",
    ],
    stack: ["Claude", "OpenAI", "Gemini", "LangGraph", "Postgres + pgvector", "Temporal"],
  },
  {
    id: "automation",
    n: "02",
    color: "var(--c-orange)",
    title: "Process automation",
    body:
      "Most workflows don't need an LLM — they need a deterministic pipeline that runs the same way every time. We build those, instrument them, and operate them. When a step genuinely benefits from an agent, we drop one in; the rest stays predictable.",
    bullets: [
      "n8n on Sepnexus shared cloud or your own dedicated VPS",
      "Temporal for workflows that span days and need durable retries",
      "Webhook ingest with replay, dedupe, and signed payload validation",
      "Human-in-the-loop steps with Slack / email approval flows",
      "Versioned deployments, blue/green rollouts, complete audit log",
    ],
    outcomes: [
      "Eliminate copy-paste between SaaS tools that should already talk",
      "Replace fragile cron jobs with observable, retried workflows",
      "Onboard new team members without retraining a tribal-knowledge process",
    ],
    stack: ["n8n", "Temporal", "Cloudflare Workers", "Postgres", "Redis"],
  },
  {
    id: "data",
    n: "03",
    color: "var(--c-yellow)",
    title: "Data pipelines & analytics",
    body:
      "From ingestion to decision. We design the warehouse, build the pipelines, and ship the dashboards your team will actually open. Every metric has a single source of truth and a query you can read.",
    bullets: [
      "Streaming + batch ingestion from your operational DBs and SaaS",
      "Modeled with dbt — every metric defined once, tested, documented",
      "Self-serve analytics: Metabase / Hex / Superset, your call",
      "Reverse-ETL back into the tools your team already uses",
      "PII-aware: row-level security, masked test envs, EU-pinning",
    ],
    outcomes: [
      "One number, one definition, agreed by finance + ops + product",
      "Sub-minute freshness on the metrics that actually matter",
      "An analytics layer your AI agents can query as a tool",
    ],
    stack: ["Postgres", "ClickHouse", "dbt", "Airflow", "Metabase"],
  },
  {
    id: "hosting",
    n: "04",
    color: "var(--c-cyan)",
    title: "Cloud & managed hosting",
    body:
      "We design, deploy and operate the infrastructure your agents and apps run on. You ship product; we run the cloud — under SLAs that hold up under enterprise scrutiny, with the on-call rotation so your team doesn't need one.",
    bullets: [
      "Managed n8n hosting — shared (Sepnexus-operated) or dedicated VPS",
      "Web hosting for marketing sites and apps with free SSL + CDN",
      "Single-tenant deployments with VPC isolation for enterprise tier",
      "Observable: logs, metrics, traces, cost guards, on-call alerts",
      "Backups (daily), disaster recovery (tested), runbooks (versioned)",
    ],
    outcomes: [
      "99.99% uptime SLA on managed agents",
      "Region pinning for EU, US and APAC data sovereignty",
      "Predictable, USD-denominated billing — no Reserved Instance lottery",
    ],
    stack: ["AWS", "GCP", "Hetzner", "Kubernetes", "Terraform", "Traefik"],
  },
  {
    id: "integrations",
    n: "05",
    color: "var(--c-purple)",
    title: "Custom AI integrations",
    body:
      "Slot intelligence into the systems you already use. CRMs, ERPs, comms, ticketing — we wire agents and automations into Salesforce, HubSpot, Slack, Zendesk and the rest, without ripping anything out.",
    bullets: [
      "Direct API integrations with idempotency, rate-limit awareness, retries",
      "Two-way sync with conflict resolution and audit logs",
      "Action-grade plugins for Slack / Teams / Discord with approvals",
      "OAuth-based multi-tenant auth flows for customer-facing integrations",
    ],
    outcomes: [
      "Your existing tools become richer instead of being replaced",
      "Fewer logins, fewer dashboards, less context-switching",
      "Integrations that survive vendor API churn — we monitor + adapt",
    ],
    stack: ["Salesforce", "HubSpot", "Slack", "Zendesk", "Stripe", "Razorpay"],
  },
  {
    id: "development",
    n: "06",
    color: "var(--c-red)",
    title: "Web & app development",
    body:
      "Studio-grade interfaces that don't feel like enterprise software — built for the agents and pipelines underneath. We design and engineer the marketing sites, internal tools and customer apps where the work shows up.",
    bullets: [
      "Next.js / React / Swift / Kotlin — the right tool, not a default",
      "Server-rendered, SEO-aware, performant on real-world devices",
      "Design systems that scale from landing page to admin panel",
      "Type-safe end-to-end: Drizzle, tRPC, Zod, integration tests",
    ],
    outcomes: [
      "A frontend that does justice to the system behind it",
      "Fewer bugs because the types speak across the wire",
      "Marketing pages your sales team can extend without your engineers",
    ],
    stack: ["Next.js", "React", "Swift", "Kotlin", "Drizzle", "Tailwind"],
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
            Six disciplines.
            <br />
            <em>One operating system</em>
            <br /> for your business.
          </h1>
          <p className="page-lede reveal">
            We don&apos;t sell a product. Each engagement is assembled from a deep stack of
            agentic, automation, data, cloud, integration and product work. Below: the disciplines
            we can pull from.
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
