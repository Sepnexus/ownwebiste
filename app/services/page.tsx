import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SiteShell from "@/components/site/SiteShell";
import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";

export const metadata: Metadata = {
  title: "Services",
  description:
    "We started with real estate investors. Today we build AI agents, lead follow-up automation, deal tools and business dashboards — and we host every one of them.",
  alternates: { canonical: "/services" },
};

// Ported from the Claude Design file Services.dc.html. Markup, classes and wording
// match the design exactly; styles live in styles/site/base.css + services.css.
export default function ServicesPage() {
  return (
    <SiteShell page="services">
      <SiteNav current="services" />
      <main id="main">
        {/* HERO */}
        <section className="phero">
          <div className="phero-glow" aria-hidden="true" />
          <div className="wrap phero-in center">
            <span className="eyebrow mono in d1">
              Services
            </span>
            <h1 className="h-xl in d2">
              Built for real estate.
              <br />
              <span className="grad">
                Useful in any business.
              </span>
            </h1>
            <p className="lede in d3" style={{ maxWidth: "720px" }}>
              We started with real estate investors. Today we build AI agents, lead follow-up automation, deal tools and business dashboards — and we host every one of them.
            </p>
            <nav className="pills in d4" aria-label="Services" style={{ justifyContent: "center", marginTop: "12px" }}>
              <a className="pill" href="#estate">
                Estate 360 agents
              </a>
              <a className="pill" href="#automation">
                Follow-up automation
              </a>
              <a className="pill" href="#deal-tools">
                Deal tools
              </a>
              <a className="pill" href="#hosting">
                Managed hosting
              </a>
              <a className="pill" href="#any-business">
                AI for any business
              </a>
              <a className="pill" href="#apps">
                Web apps & portals
              </a>
            </nav>
          </div>
        </section>
        {/* 01 ESTATE 360 */}
        <section className="svc" id="estate">
          <div className="wrap">
            <div className="split split-top">
              <div className="rv" style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
                <span className="svc-num">
                  01 — Estate 360 agents
                </span>
                <h2 className="h-l">
                  Your leads, worked around the clock.
                </h2>
                <p className="lede">
                  AI agents for investors and wholesalers that text, call, qualify and book — so your team only talks to sellers who are ready.
                </p>
                <ul className="checks" style={{ marginTop: "8px" }}>
                  <li>
                    <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    AI texting agents that reply fast, in a natural tone
                  </li>
                  <li>
                    <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    AI calling agents that qualify and book on your calendar
                  </li>
                  <li>
                    <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    Qualification on condition, timeline, motivation and price
                  </li>
                  <li>
                    <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    Hot leads handed to a human, with a conversation summary
                  </li>
                  <li>
                    <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    Every message, call and outcome logged to your CRM
                  </li>
                  <li>
                    <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    Call reviews and summaries to coach your reps
                  </li>
                </ul>
              </div>
              <div className="panel zoom" role="img" aria-label="Illustrative AI call: the agent qualifies a seller on condition, timeline, motivation and price, then hands a hot lead to acquisitions.">
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px" }}>
                  <span className="live" aria-hidden="true" />
                  <b style={{ fontWeight: "600" }}>
                    AI call · Seller qualification
                  </b>
                  <span className="badge badge-ai" style={{ marginLeft: "auto" }}>
                    Voice AI
                  </span>
                </div>
                <div className="wave" style={{ height: "64px", marginBottom: "18px" }} aria-hidden="true">
                  <i style={{ "--s": ".35", animationDelay: "-.1s" } as React.CSSProperties} />
                  <i style={{ "--s": ".6", animationDelay: "-.3s" } as React.CSSProperties} />
                  <i style={{ "--s": ".45", animationDelay: "-.5s" } as React.CSSProperties} />
                  <i style={{ "--s": ".8", animationDelay: "-.2s" } as React.CSSProperties} />
                  <i style={{ "--s": ".55", animationDelay: "-.7s" } as React.CSSProperties} />
                  <i style={{ "--s": ".9", animationDelay: "-.4s" } as React.CSSProperties} />
                  <i style={{ "--s": ".4", animationDelay: "-.9s" } as React.CSSProperties} />
                  <i style={{ "--s": ".7", animationDelay: "-.6s" } as React.CSSProperties} />
                  <i style={{ "--s": "1", animationDelay: "-.15s" } as React.CSSProperties} />
                  <i style={{ "--s": ".5", animationDelay: "-.85s" } as React.CSSProperties} />
                  <i style={{ "--s": ".75", animationDelay: "-.35s" } as React.CSSProperties} />
                  <i style={{ "--s": ".3", animationDelay: "-.55s" } as React.CSSProperties} />
                  <i style={{ "--s": ".65", animationDelay: "-1s" } as React.CSSProperties} />
                  <i style={{ "--s": ".85", animationDelay: "-.25s" } as React.CSSProperties} />
                  <i style={{ "--s": ".45", animationDelay: "-.75s" } as React.CSSProperties} />
                  <i style={{ "--s": ".95", animationDelay: "-.05s" } as React.CSSProperties} />
                  <i style={{ "--s": ".55", animationDelay: "-.65s" } as React.CSSProperties} />
                  <i style={{ "--s": ".7", animationDelay: "-1.1s" } as React.CSSProperties} />
                  <i style={{ "--s": ".35", animationDelay: "-.45s" } as React.CSSProperties} />
                  <i style={{ "--s": ".8", animationDelay: "-.95s" } as React.CSSProperties} />
                </div>
                <div className="qrow">
                  <span className="mono">
                    Condition
                  </span>
                  <span>
                    Roof needs work
                  </span>
                  <span className="dot" style={{ background: "var(--b1)" }} />
                </div>
                <div className="qrow">
                  <span className="mono">
                    Timeline
                  </span>
                  <span>
                    Move before spring
                  </span>
                  <span className="dot" style={{ background: "var(--b2)" }} />
                </div>
                <div className="qrow">
                  <span className="mono">
                    Motivation
                  </span>
                  <span>
                    Relocating for work
                  </span>
                  <span className="dot" style={{ background: "var(--b3)" }} />
                </div>
                <div className="qrow">
                  <span className="mono">
                    Price
                  </span>
                  <span>
                    Open to a cash offer
                  </span>
                  <span className="dot" style={{ background: "var(--b4)" }} />
                </div>
                <div style={{ marginTop: "18px", padding: "18px 20px", borderRadius: "18px", background: "#000", border: "1px solid rgba(255,255,255,.14)", display: "flex", alignItems: "center", gap: "12px" }}>
                  <span className="dot" style={{ background: "var(--warm)" }} />
                  <span>
                    <b style={{ fontWeight: "600" }}>
                      Hot
                    </b>
                    {" "}— handed to acquisitions with summary
                  </span>
                </div>
                <p className="mono" style={{ color: "#6e6e73", margin: "16px 0 0", fontSize: "11px" }}>
                  Illustrative
                </p>
              </div>
            </div>
            <div className="outcomes rv">
              <div>
                <b>
                  No lead waits
                </b>
                <span>
                  Replies in moments, not hours.
                </span>
              </div>
              <div>
                <b>
                  Reps on appointments
                </b>
                <span>
                  Your team talks to ready sellers only.
                </span>
              </div>
              <div>
                <b>
                  Full record
                </b>
                <span>
                  Every seller conversation, searchable.
                </span>
              </div>
              <div>
                <b>
                  Your stack
                </b>
                <span>
                  Works with your lists, campaigns and CRM.
                </span>
              </div>
            </div>
            <div className="tags rv" style={{ marginTop: "28px" }}>
              <span>
                GoHighLevel
              </span>
              <span>
                n8n
              </span>
              <span>
                OpenAI
              </span>
              <span>
                Claude
              </span>
              <span>
                Retell AI
              </span>
              <span>
                Close
              </span>
              <span>
                CloseBot
              </span>
            </div>
          </div>
        </section>
        {/* 02 AUTOMATION */}
        <section className="svc sec-light" id="automation" style={{ borderTop: "0" }}>
          <div className="wrap">
            <div className="split split-top">
              <div className="rv" style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
                <span className="svc-num" style={{ color: "#b25e00" }}>
                  02 — Follow-up automation
                </span>
                <h2 className="h-l">
                  Follow-up that never forgets.
                </h2>
                <p className="lede">
                  Repeatable workflows in GoHighLevel and n8n. AI only where judgment is needed — like reading what a seller actually meant.
                </p>
                <ul className="checks" style={{ marginTop: "8px" }}>
                  <li>
                    <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    SMS and email campaigns by list and niche, with persistent follow-up
                  </li>
                  <li>
                    <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    AI sorts replies: interested, not interested, wrong number, call later
                  </li>
                  <li>
                    <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    Speed-to-lead: instant replies, call tasks and new-lead alerts
                  </li>
                  <li>
                    <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    Pipeline stages, tags and tasks updated automatically
                  </li>
                  <li>
                    <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    Contract and document steps automated, including browser agents
                  </li>
                  <li>
                    <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    n8n hosted on our servers or yours
                  </li>
                </ul>
              </div>
              <div className="panel zoom" style={{ color: "#f5f5f7" }} role="img" aria-label="Workflow: a new lead or reply triggers AI sorting, which books a call or creates a task, then updates the CRM.">
                <div className="flow">
                  <div className="fnode">
                    <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M13 3L5 14h6l-1 7 8-11h-6z" />
                    </svg>
                    <div>
                      <b>
                        New lead or reply
                      </b>
                      <small>
                        Form · SMS · email · call
                      </small>
                    </div>
                    <span className="badge">
                      Trigger
                    </span>
                  </div>
                  <div className="flink" aria-hidden="true">
                    <i />
                  </div>
                  <div className="fnode">
                    <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
                    </svg>
                    <div>
                      <b>
                        Read & sort the reply
                      </b>
                      <small>
                        Interested · not now · wrong number
                      </small>
                    </div>
                    <span className="badge badge-ai">
                      AI
                    </span>
                  </div>
                  <div className="flink" aria-hidden="true">
                    <i style={{ animationDelay: ".6s" }} />
                  </div>
                  <div className="fnode">
                    <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                      <rect x="4" y="5" width="16" height="15" rx="3" />
                      <path d="M4 10h16M9 3v4M15 3v4" />
                    </svg>
                    <div>
                      <b>
                        Book or create a call task
                      </b>
                      <small>
                        Calendar · alert to rep
                      </small>
                    </div>
                    <span className="badge">
                      Action
                    </span>
                  </div>
                  <div className="flink" aria-hidden="true">
                    <i style={{ animationDelay: "1.2s" }} />
                  </div>
                  <div className="fnode">
                    <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    <div>
                      <b>
                        CRM updated
                      </b>
                      <small>
                        Stage · tags · tasks · notes
                      </small>
                    </div>
                    <span className="badge">
                      Done
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="outcomes rv">
              <div>
                <b>
                  Hours back every week
                </b>
                <span>
                  Far less manual follow-up.
                </span>
              </div>
              <div>
                <b>
                  Pipeline moves itself
                </b>
                <span>
                  Leads advance stage by stage, automatically.
                </span>
              </div>
              <div>
                <b>
                  Nothing dropped
                </b>
                <span>
                  Leads keep moving when people are away.
                </span>
              </div>
            </div>
            <div className="tags rv" style={{ marginTop: "28px" }}>
              <span>
                GoHighLevel
              </span>
              <span>
                n8n
              </span>
              <span>
                OpenAI
              </span>
              <span>
                Webhooks
              </span>
              <span>
                Browser agents
              </span>
            </div>
          </div>
        </section>
        {/* 03 DEAL TOOLS */}
        <section className="svc" id="deal-tools" style={{ borderTop: "0" }}>
          <div className="wrap">
            <div className="split split-top">
              <div className="rv" style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
                <span className="svc-num">
                  03 — Deal tools & dashboards
                </span>
                <h2 className="h-l">
                  Know what to offer. Know how you’re doing.
                </h2>
                <p className="lede">
                  Comping and underwriting tools, plus one dashboard for the whole business.
                </p>
                <ul className="checks" style={{ marginTop: "8px" }}>
                  <li>
                    <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    Comps, ARV and current market value from recent sales
                  </li>
                  <li>
                    <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    AI repair estimates from property condition
                  </li>
                  <li>
                    <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    Offer calculators for every exit strategy, using your formulas
                  </li>
                  <li>
                    <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    Numbers pushed straight to CRM deal records
                  </li>
                  <li>
                    <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    KPI dashboards: lead source, cost per lead, offers, contracts, revenue
                  </li>
                  <li>
                    <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    Sales, finance and marketing views by rep, market and month
                  </li>
                </ul>
              </div>
              <div className="panel zoom">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "20px" }}>
                  <b style={{ fontWeight: "600" }}>
                    Comps · [Subject property]
                  </b>
                  <span className="badge">
                    3 of 12 selected
                  </span>
                </div>
                <div className="tbl-box">
                  <table className="tbl">
                    <thead>
                      <tr>
                        <th>
                          Comp
                        </th>
                        <th>
                          Distance
                        </th>
                        <th>
                          Sold
                        </th>
                        <th>
                          Match
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="pick">
                        <td>
                          Comp A
                        </td>
                        <td>
                          0.2 mi
                        </td>
                        <td>
                          Recent
                        </td>
                        <td>
                          <span className="dot" style={{ background: "var(--b1)" }} />
                        </td>
                      </tr>
                      <tr className="pick">
                        <td>
                          Comp B
                        </td>
                        <td>
                          0.4 mi
                        </td>
                        <td>
                          Recent
                        </td>
                        <td>
                          <span className="dot" style={{ background: "var(--b1)" }} />
                        </td>
                      </tr>
                      <tr className="pick">
                        <td>
                          Comp C
                        </td>
                        <td>
                          0.5 mi
                        </td>
                        <td>
                          Recent
                        </td>
                        <td>
                          <span className="dot" style={{ background: "var(--b2)" }} />
                        </td>
                      </tr>
                      <tr>
                        <td className="dim">
                          Comp D
                        </td>
                        <td className="dim">
                          1.1 mi
                        </td>
                        <td className="dim">
                          Older
                        </td>
                        <td>
                          <span className="dot" style={{ background: "#3a3a3c" }} />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="grid2" style={{ marginTop: "20px", gap: "12px" }}>
                  <div style={{ padding: "18px", borderRadius: "16px", background: "#000", border: "1px solid rgba(255,255,255,.1)" }}>
                    <span className="mono" style={{ color: "#86868b", fontSize: "11px" }}>
                      ARV
                    </span>
                    <div style={{ fontSize: "26px", fontWeight: "620", letterSpacing: "-.03em", marginTop: "6px" }}>
                      [ARV]
                    </div>
                  </div>
                  <div style={{ padding: "18px", borderRadius: "16px", background: "#000", border: "1px solid rgba(255,255,255,.1)" }}>
                    <span className="mono" style={{ color: "#d7a6da", fontSize: "11px" }}>
                      AI repairs
                    </span>
                    <div style={{ fontSize: "26px", fontWeight: "620", letterSpacing: "-.03em", marginTop: "6px" }}>
                      [Estimate]
                    </div>
                  </div>
                </div>
                <div className="tags" style={{ marginTop: "16px" }}>
                  <span>
                    Cash
                  </span>
                  <span>
                    Wholetail
                  </span>
                  <span>
                    Novation
                  </span>
                  <span>
                    Creative
                  </span>
                  <span>
                    + your formulas
                  </span>
                </div>
              </div>
            </div>
            <div className="outcomes rv">
              <div>
                <b>
                  Consistent offers
                </b>
                <span>
                  Same answer no matter who runs the numbers.
                </span>
              </div>
              <div>
                <b>
                  Faster underwriting
                </b>
                <span>
                  From address to offer in minutes.
                </span>
              </div>
              <div>
                <b>
                  One set of numbers
                </b>
                <span>
                  The whole team reads the same figures every week.
                </span>
              </div>
            </div>
            <div className="tags rv" style={{ marginTop: "28px" }}>
              <span>
                Next.js
              </span>
              <span>
                React
              </span>
              <span>
                Supabase
              </span>
              <span>
                Postgres
              </span>
              <span>
                OpenAI
              </span>
              <span>
                GoHighLevel API
              </span>
            </div>
          </div>
        </section>
        {/* 04 HOSTING */}
        <section className="svc sec-light" id="hosting" style={{ borderTop: "0" }}>
          <div className="wrap">
            <div className="split split-top">
              <div className="rv" style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
                <span className="svc-num" style={{ color: "#b25e00" }}>
                  04 — Managed hosting
                </span>
                <h2 className="h-l">
                  One team for build, security and uptime.
                </h2>
                <p className="lede">
                  We host the automations, agents, dashboards and web apps we build — or the ones you already have.
                </p>
                <ul className="checks" style={{ marginTop: "8px" }}>
                  <li>
                    <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    Managed n8n on shared plans or a dedicated queue-mode server
                  </li>
                  <li>
                    <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    Websites, portals and SaaS apps deployed from Git
                  </li>
                  <li>
                    <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    Free SSL on every site, renewed automatically
                  </li>
                  <li>
                    <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    Scheduled backups and monitoring with alerts
                  </li>
                  <li>
                    <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    Updates and security patches handled for you
                  </li>
                </ul>
                <div>
                  <Link className="lnk" href="/hosting">
                    Explore hosting{" "}
                    <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M9 6l6 6-6 6" />
                    </svg>
                  </Link>
                </div>
              </div>
              <div className="board zoom" style={{ color: "#f5f5f7" }} role="img" aria-label="Example status board: hosted services running.">
                <div className="brow">
                  <span className="live" aria-hidden="true" />
                  <div>
                    <b>
                      n8n · queue mode
                    </b>
                    <small>
                      Dedicated server
                    </small>
                  </div>
                  <span className="ok mono">
                    Running
                  </span>
                </div>
                <div className="brow">
                  <span className="live" aria-hidden="true" />
                  <div>
                    <b>
                      Client portal
                    </b>
                    <small>
                      Deployed from Git · SSL active
                    </small>
                  </div>
                  <span className="ok mono">
                    Running
                  </span>
                </div>
                <div className="brow">
                  <span className="live" aria-hidden="true" />
                  <div>
                    <b>
                      Backups
                    </b>
                    <small>
                      Scheduled · restore path
                    </small>
                  </div>
                  <span className="ok mono">
                    Healthy
                  </span>
                </div>
                <div className="brow">
                  <span className="live" aria-hidden="true" />
                  <div>
                    <b>
                      Monitoring
                    </b>
                    <small>
                      Alerts route to Sepnexus
                    </small>
                  </div>
                  <span className="ok mono">
                    Watching
                  </span>
                </div>
              </div>
            </div>
            <div className="outcomes rv">
              <div>
                <b>
                  No server upkeep
                </b>
                <span>
                  Nothing for your team to patch or babysit.
                </span>
              </div>
              <div>
                <b>
                  Issues caught early
                </b>
                <span>
                  We see problems before your customers do.
                </span>
              </div>
              <div>
                <b>
                  Simple billing
                </b>
                <span>
                  Monthly or yearly, in USD.
                </span>
              </div>
            </div>
            <div className="tags rv" style={{ marginTop: "28px" }}>
              <span>
                Docker
              </span>
              <span>
                n8n
              </span>
              <span>
                Postgres
              </span>
              <span>
                Traefik
              </span>
              <span>
                Cloudflare
              </span>
              <span>
                Linux VPS
              </span>
            </div>
          </div>
        </section>
        {/* 05 ANY BUSINESS */}
        <section className="svc" id="any-business" style={{ borderTop: "0" }}>
          <div className="wrap">
            <div className="split">
              <div className="rv" style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
                <span className="svc-num">
                  05 — AI for any business
                </span>
                <h2 className="h-l">
                  Your tools, finally talking to each other.
                </h2>
                <p className="lede">
                  The same agents, automations and integrations — for any business that handles leads, documents or too many disconnected tools.
                </p>
                <ul className="checks" style={{ marginTop: "8px" }}>
                  <li>
                    <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    Sales and support assistants trained on your material
                  </li>
                  <li>
                    <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    Proposal, quote and document automation
                  </li>
                  <li>
                    <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    CRM, inbox, calendar, payments and spreadsheets — connected
                  </li>
                  <li>
                    <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    Custom MCP tools so Claude can work with your systems
                  </li>
                  <li>
                    <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    Meeting and call summaries delivered automatically
                  </li>
                </ul>
              </div>
              <div className="hub zoom" role="img" aria-label="Your AI assistant at the centre, connected to CRM, inbox, calendar, payments, spreadsheets and documents.">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                  <line className="arc-path" x1="50" y1="50" x2="50" y2="9" stroke="rgba(255,255,255,.28)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                  <line className="arc-path" x1="50" y1="50" x2="88" y2="30" stroke="rgba(255,255,255,.28)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                  <line className="arc-path" x1="50" y1="50" x2="88" y2="70" stroke="rgba(255,255,255,.28)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                  <line className="arc-path" x1="50" y1="50" x2="50" y2="91" stroke="rgba(255,255,255,.28)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                  <line className="arc-path" x1="50" y1="50" x2="12" y2="70" stroke="rgba(255,255,255,.28)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                  <line className="arc-path" x1="50" y1="50" x2="12" y2="30" stroke="rgba(255,255,255,.28)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                </svg>
                <span className="hub-chip" style={{ left: "50%", top: "9%" }}>
                  <span className="dot" style={{ background: "var(--b1)" }} />
                  CRM
                </span>
                <span className="hub-chip" style={{ left: "86%", top: "30%", animationDelay: "-1s" }}>
                  <span className="dot" style={{ background: "var(--b2)" }} />
                  Inbox
                </span>
                <span className="hub-chip" style={{ left: "86%", top: "70%", animationDelay: "-2s" }}>
                  <span className="dot" style={{ background: "var(--b3)" }} />
                  Calendar
                </span>
                <span className="hub-chip" style={{ left: "50%", top: "91%", animationDelay: "-3s" }}>
                  <span className="dot" style={{ background: "var(--b4)" }} />
                  Payments
                </span>
                <span className="hub-chip" style={{ left: "14%", top: "70%", animationDelay: "-4s" }}>
                  <span className="dot" style={{ background: "var(--b6)" }} />
                  Sheets
                </span>
                <span className="hub-chip" style={{ left: "14%", top: "30%", animationDelay: "-5s" }}>
                  <span className="dot" style={{ background: "#8a4fb0", boxShadow: "0 0 0 2px var(--b5)" }} />
                  Docs
                </span>
                <div className="hub-core">
                  <Image src="/assets/sepnexus-mark.png" width={500} height={500} alt="" />
                  <span>
                    Claude · OpenAI
                    <br />
                    via MCP
                  </span>
                </div>
              </div>
            </div>
            <div className="outcomes rv">
              <div>
                <b>
                  Tools that cooperate
                </b>
                <span>
                  Data moves without copy-paste.
                </span>
              </div>
              <div>
                <b>
                  Answers without staff
                </b>
                <span>
                  Routine questions handled by AI.
                </span>
              </div>
              <div>
                <b>
                  Less admin
                </b>
                <span>
                  Documents and summaries write themselves.
                </span>
              </div>
            </div>
            <div className="tags rv" style={{ marginTop: "28px" }}>
              <span>
                Claude
              </span>
              <span>
                OpenAI
              </span>
              <span>
                n8n
              </span>
              <span>
                MCP
              </span>
              <span>
                REST APIs
              </span>
              <span>
                Fathom
              </span>
            </div>
          </div>
        </section>
        {/* 06 APPS */}
        <section className="svc sec-light" id="apps" style={{ borderTop: "0" }}>
          <div className="wrap">
            <div className="split split-top">
              <div className="rv" style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
                <span className="svc-num" style={{ color: "#b25e00" }}>
                  06 — Web apps & portals
                </span>
                <h2 className="h-l">
                  Software shaped to how you work.
                </h2>
                <p className="lede">
                  Custom sites, portals and SaaS products — built by the same team that runs your automations and hosting.
                </p>
                <ul className="checks" style={{ marginTop: "8px" }}>
                  <li>
                    <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    Partner and JV portals to share deals with buyers
                  </li>
                  <li>
                    <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    Hiring portals for acquisitions and dispositions roles
                  </li>
                  <li>
                    <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    Client dashboards and internal tools with sign-in and roles
                  </li>
                  <li>
                    <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    Full SaaS products with billing and subscriptions
                  </li>
                  <li>
                    <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    Fast, mobile-friendly marketing sites
                  </li>
                </ul>
              </div>
              <div className="win zoom" aria-hidden="true">
                <div className="win-bar">
                  <span />
                  <span />
                  <span />
                  <div className="win-url">
                    portal.yourcompany.com
                  </div>
                </div>
                <div className="win-body">
                  <div className="win-side">
                    <span className="on" />
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="win-main">
                    <span style={{ background: "color-mix(in oklab, var(--b1) 30%, #1c1c1e)" }} />
                    <span style={{ background: "color-mix(in oklab, var(--b3) 30%, #1c1c1e)" }} />
                    <span style={{ background: "color-mix(in oklab, var(--b6) 30%, #1c1c1e)" }} />
                    <span className="wide" />
                  </div>
                </div>
              </div>
            </div>
            <div className="outcomes rv">
              <div>
                <b>
                  Built for your process
                </b>
                <span>
                  Not the other way around.
                </span>
              </div>
              <div>
                <b>
                  One team
                </b>
                <span>
                  App, automation and hosting under one roof.
                </span>
              </div>
              <div>
                <b>
                  You own it
                </b>
                <span>
                  No per-seat fees forever.
                </span>
              </div>
            </div>
            <div className="tags rv" style={{ marginTop: "28px" }}>
              <span>
                Next.js
              </span>
              <span>
                React
              </span>
              <span>
                Supabase
              </span>
              <span>
                Postgres
              </span>
              <span>
                Express
              </span>
              <span>
                Docker
              </span>
            </div>
          </div>
        </section>
        {/* EVERY BUILD */}
        <section className="sec">
          <div className="wrap">
            <div className="sec-head rv">
              <span className="mono dim">
                With every build
              </span>
              <h2 className="h-l">
                Systems, not scripts.
              </h2>
            </div>
            <div className="grid4">
              <div className="tile tile-dark rv">
                <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M7 3h7l5 5v13H7z" />
                  <path d="M14 3v5h5M10 13h6M10 17h6" />
                </svg>
                <h3>
                  A written plan
                </h3>
                <p>
                  Scope, cost and timeline in writing before work begins.
                </p>
              </div>
              <div className="tile tile-dark rv">
                <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M9 7H5v12h12v-4M14 4h6v6M20 4l-9 9" />
                </svg>
                <h3>
                  Inside your tools
                </h3>
                <p>
                  Connected to the CRM and apps you already use.
                </p>
              </div>
              <div className="tile tile-dark rv">
                <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M3 12h4l3-7 4 14 3-7h4" />
                </svg>
                <h3>
                  Logged & monitored
                </h3>
                <p>
                  Every run recorded. Problems flagged to us first.
                </p>
              </div>
              <div className="tile tile-dark rv">
                <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z" />
                </svg>
                <h3>
                  Maintained after launch
                </h3>
                <p>
                  We operate what we ship, and keep improving it.
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* FAQ */}
        <section className="sec sec-light">
          <div className="wrap narrow">
            <div className="sec-head rv">
              <span className="mono" style={{ color: "#86868b" }}>
                Questions
              </span>
              <h2 className="h-l">
                Good to know.
              </h2>
            </div>
            <div className="faq rv">
              <details open>
                <summary>
                  Do I need to switch CRMs?
                  <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </summary>
                <p>
                  No. We build inside the tools you already use — GoHighLevel, HubSpot, Close, n8n — and connect anything else through APIs.
                </p>
              </details>
              <details>
                <summary>
                  Is this only for real estate?
                  <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </summary>
                <p>
                  Most of our work is for real estate investors, but the same agents, automations and portals run for any business that lives on leads, documents and follow-up.
                </p>
              </details>
              <details>
                <summary>
                  Who maintains it after launch?
                  <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </summary>
                <p>
                  We do. We host, monitor and fix what we build, and our alerts reach us before they reach you.
                </p>
              </details>
              <details>
                <summary>
                  How do projects start?
                  <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </summary>
                <p>
                  A discovery call, then a written plan with scope, cost and timeline. We build in short, visible steps so you can see progress.
                </p>
              </details>
              <details>
                <summary>
                  How fast will you reply?
                  <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </summary>
                <p>
                  Within 48 hours. We take a limited number of projects at a time so each one gets proper attention.
                </p>
              </details>
            </div>
          </div>
        </section>
        {/* CTA */}
        <section className="cta">
          <div className="cta-glow" aria-hidden="true" />
          <div className="wrap" style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: "32px" }}>
            <h2 className="h-xl zoom" style={{ maxWidth: "1000px" }}>
              Let’s build something that{" "}
              <span className="grad">
                runs itself.
              </span>
            </h2>
            <p className="lede" style={{ maxWidth: "620px" }}>
              Tell us what’s eating your team’s time — follow-up, comping, reporting, anything. We’ll reply within 48 hours with a next step.
            </p>
            <div className="cta-row" style={{ justifyContent: "center" }}>
              <Link className="btn" href="/contact">
                Start a project
              </Link>
              <Link className="btn btn-ghost" href="/portfolio">
                See the work
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </SiteShell>
  );
}
