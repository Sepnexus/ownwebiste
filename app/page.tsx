import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SiteShell from "@/components/site/SiteShell";
import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";

export const metadata: Metadata = {
  title: { absolute: "Sepnexus — AI agents that work your pipeline" },
  description:
    "AI agents that answer every lead, qualify it, pull the comps and report the numbers — inside the tools you already use. Built for real estate investors. Ready for any business.",
  alternates: { canonical: "/" },
};

// Ported from the Claude Design file Main.dc.html. Markup, classes and wording
// match the design exactly; styles live in styles/site/home.css.
export default function Home() {
  return (
    <SiteShell page="home">
      <SiteNav variant="home" />
      <main id="main">
        {/* HERO */}
        <section className="hero" id="top">
          <div className="hero-glow" aria-hidden="true" />
          <div className="wrap hero-copy">
            <span className="eyebrow mono in d1">
              <span className="live" aria-hidden="true" />
              Est. MMXXIV · Taking new projects
            </span>
            <h1 className="h-xl in d2">
              AI agents that work
              <br />
              your{" "}
              <span className="grad">
                pipeline.
              </span>
            </h1>
            <p className="lede in d3" style={{ maxWidth: "720px" }}>
              They answer every lead, qualify it, pull the comps and report the numbers — inside the tools you already use. Built for real estate investors. Ready for any business.
            </p>
            <div className="cta-row in d4">
              <Link className="btn" href="/contact">
                Start a project
              </Link>
              <a className="btn btn-ghost" href="#work">
                See the work
              </a>
            </div>
          </div>
          <div className="stage in d5" aria-hidden="true">
            <svg className="orb" viewBox="0 0 600 600">
              <defs>
                <radialGradient id="core" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" style={{ stopColor: "var(--hi)", stopOpacity: ".95" }} />
                  <stop offset="45%" style={{ stopColor: "var(--accent)", stopOpacity: ".45" }} />
                  <stop offset="100%" style={{ stopColor: "var(--accent)", stopOpacity: "0" }} />
                </radialGradient>
                <linearGradient id="arc" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" style={{ stopColor: "#1BA8E0" }} />
                  <stop offset="50%" style={{ stopColor: "#E8514C" }} />
                  <stop offset="100%" style={{ stopColor: "#FDBE2E" }} />
                </linearGradient>
              </defs>
              <circle className="pulse" cx="300" cy="300" r="190" fill="url(#core)" opacity=".55" />
              <g className="spin spin-a">
                <circle cx="300" cy="300" r="282" fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="1" />
                <circle cx="300" cy="18" r="5" fill="#1BA8E0" />
                <circle cx="582" cy="300" r="4" fill="#F0922C" />
                <circle cx="100" cy="500" r="4" fill="#A456A8" />
              </g>
              <g className="spin spin-b">
                <circle cx="300" cy="300" r="222" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="1" strokeDasharray="2 10" />
                <path d="M300 78 A222 222 0 0 1 522 300" fill="none" stroke="url(#arc)" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="522" cy="300" r="6" fill="#FDBE2E" />
                <circle cx="78" cy="300" r="4" fill="#E8514C" />
              </g>
              <g className="spin spin-c">
                <circle cx="300" cy="300" r="160" fill="none" stroke="rgba(255,255,255,.16)" strokeWidth="1" strokeDasharray="70 18" />
                <circle cx="140" cy="300" r="5" fill="#E8514C" />
                <circle cx="460" cy="300" r="4" fill="#1BA8E0" />
              </g>
              <circle cx="300" cy="300" r="92" fill="#050507" stroke="rgba(255,255,255,.16)" strokeWidth="1" />
              <circle cx="300" cy="300" r="92" fill="none" style={{ stroke: "var(--hi)" }} strokeWidth="1.5" strokeDasharray="4 6" opacity=".7" />
            </svg>
            <Image src="/assets/sepnexus-mark.png" width={500} height={500} className="orb-mark" alt="" />
            <div className="chip" style={{ left: "6%", top: "14%" }}>
              <span className="dot" style={{ background: "#1BA8E0" }} />
              <div>
                New lead captured
                <small>
                  Web form · instant reply
                </small>
              </div>
            </div>
            <div className="chip" style={{ right: "5%", top: "9%", animationDelay: "-2s" }}>
              <span className="dot" style={{ background: "#FDBE2E" }} />
              <div>
                Qualified · Hot
                <small>
                  Motivated, 60-day timeline
                </small>
              </div>
            </div>
            <div className="chip hide-s" style={{ right: "0%", top: "52%", animationDelay: "-4s" }}>
              <span className="dot" style={{ background: "#F0922C" }} />
              <div>
                Comps pulled
                <small>
                  ARV & repair estimate ready
                </small>
              </div>
            </div>
            <div className="chip hide-s" style={{ left: "0%", top: "58%", animationDelay: "-1s" }}>
              <span className="dot" style={{ background: "#A456A8" }} />
              <div>
                Follow-up sent
                <small>
                  SMS · email · voice
                </small>
              </div>
            </div>
            <div className="chip" style={{ left: "12%", bottom: "4%", animationDelay: "-3s" }}>
              <span className="dot" style={{ background: "#8a4fb0", boxShadow: "0 0 0 2px #4E2460" }} />
              <div>
                Appointment booked
                <small>
                  Synced to calendar
                </small>
              </div>
            </div>
            <div className="chip" style={{ right: "12%", bottom: "0%", animationDelay: "-5s" }}>
              <span className="dot" style={{ background: "#E8514C" }} />
              <div>
                Logged to CRM
                <small>
                  GoHighLevel · HubSpot
                </small>
              </div>
            </div>
          </div>
        </section>
        {/* MARQUEE */}
        <div className="marq" aria-label="Works with GoHighLevel, n8n, OpenAI, Claude, Retell AI, HubSpot, Supabase, Next.js, React, MCP">
          <div className="marq-track" aria-hidden="true">
            <div className="marq-g">
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
                HubSpot
              </span>
              <span>
                Supabase
              </span>
              <span>
                Next.js
              </span>
              <span>
                React
              </span>
              <span>
                MCP
              </span>
            </div>
            <div className="marq-g">
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
                HubSpot
              </span>
              <span>
                Supabase
              </span>
              <span>
                Next.js
              </span>
              <span>
                React
              </span>
              <span>
                MCP
              </span>
            </div>
          </div>
        </div>
        {/* STATEMENT */}
        <section className="sec">
          <div className="wrap">
            <p className="big-p">
              <span className="ft">
                A lead that waits is a lead that walks.
              </span>
              {" "}
              <span className="ft">
                So our agents answer the moment it lands,
              </span>
              {" "}
              <span className="ft">
                qualify the seller, pull the comps, book the call
              </span>
              {" "}
              <span className="ft">
                and log every word in your CRM.
              </span>
              {" "}
              <span className="ft" style={{ color: "#f5f5f7" }}>
                At 3 PM or 3 AM.
              </span>
            </p>
          </div>
        </section>
        {/* ESTATE 360 */}
        <section className="sec" id="agents" style={{ paddingTop: "40px" }}>
          <div className="wrap split">
            <div className="rv" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <span className="mono" style={{ color: "var(--warm)" }}>
                Estate 360 agents
              </span>
              <h2 className="h-l">
                Your best acquisitions rep.
                <br />
                <span style={{ color: "#6e6e73" }}>
                  Running 24/7.
                </span>
              </h2>
              <p className="lede">
                AI texting and calling for sellers. Agents read motivation, timeline and price, book the appointment and hand warm leads to your team — every message logged to your CRM.
              </p>
              <ul className="checks">
                <li>
                  <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                  AI texting
                </li>
                <li>
                  <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                  AI voice calling
                </li>
                <li>
                  <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                  Lead qualification
                </li>
                <li>
                  <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                  Appointment booking
                </li>
                <li>
                  <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                  Warm-lead handoff
                </li>
                <li>
                  <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                  CRM sync
                </li>
              </ul>
              <div>
                <Link className="lnk" href="/contact">
                  Put an agent on your leads{" "}
                  <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </Link>
              </div>
            </div>
            <div className="zoom">
              <div className="chat" role="img" aria-label="Illustrative SMS conversation: the agent replies to a new seller lead, qualifies them and books an appointment, then logs it to the CRM.">
                <div className="chat-head">
                  <span className="avatar">
                    <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
                    </svg>
                  </span>
                  <div style={{ flex: "1" }}>
                    <div style={{ fontWeight: "600", fontSize: "15px" }}>
                      Estate 360 · Seller line
                    </div>
                    <div style={{ fontSize: "12px", color: "#a1a1a6" }}>
                      AI agent · replying live
                    </div>
                  </div>
                  <span className="live" aria-hidden="true" />
                </div>
                <div className="msgs">
                  <span className="sys mono q1">
                    <span className="dot" style={{ background: "#30d158", width: "7px", height: "7px" }} />
                    New lead · 1423 Maple St
                  </span>
                  <div className="b b-ai q2">
                    Hi Sarah, it’s Ava with Sepnexus. You asked about an offer on Maple St — still thinking of selling?
                  </div>
                  <div className="b b-them q3">
                    Yes. Need to move by spring. The roof needs work.
                  </div>
                  <div className="b b-ai q4">
                    Understood — we buy as-is. Roughly what would you want to walk away with?
                  </div>
                  <div className="b b-them q5">
                    Around 240k.
                  </div>
                  <div className="b b-ai q6">
                    Thanks Sarah. You’re booked Thursday 4:30 PM with our acquisitions lead. I’ll text a reminder.
                  </div>
                  <span className="sys mono q7">
                    <span className="dot" style={{ background: "#ff9f0a", width: "7px", height: "7px" }} />
                    Hot · Booked · Logged to CRM
                  </span>
                </div>
              </div>
              <p className="illus mono">
                Illustrative conversation
              </p>
            </div>
          </div>
        </section>
        {/* DEAL CYCLE */}
        <section className="sec" style={{ paddingTop: "80px" }}>
          <div className="wrap">
            <div className="sec-head rv">
              <span className="mono" style={{ color: "#86868b" }}>
                The deal cycle
              </span>
              <h2 className="h-l">
                Agents that close the loop.
              </h2>
            </div>
            <div className="cycle">
              <div className="track" aria-hidden="true">
                <i />
              </div>
              <div className="step rv">
                <span className="node">
                  <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 4v10M7 9l5 5 5-5M5 19h14" />
                  </svg>
                </span>
                <span className="mono" style={{ color: "#6e6e73" }}>
                  01 · Catch
                </span>
                <h3>
                  Every lead, the moment it lands.
                </h3>
                <p>
                  Forms, ads, lists and calls flow into one pipeline. Nothing sits.
                </p>
              </div>
              <div className="step rv">
                <span className="node">
                  <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M4 5h16v11H8l-4 4z" />
                  </svg>
                </span>
                <span className="mono" style={{ color: "#6e6e73" }}>
                  02 · Qualify
                </span>
                <h3>
                  Text or call. Qualify. Book.
                </h3>
                <p>
                  The agent works the conversation and puts the appointment on your calendar.
                </p>
              </div>
              <div className="step rv">
                <span className="node">
                  <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
                  </svg>
                </span>
                <span className="mono" style={{ color: "#6e6e73" }}>
                  03 · Underwrite
                </span>
                <h3>
                  Comps pulled. Offer ready.
                </h3>
                <p>
                  ARV, AI repair estimates and offer math, prepared before the call starts.
                </p>
              </div>
              <div className="step rv">
                <span className="node">
                  <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                </span>
                <span className="mono" style={{ color: "#6e6e73" }}>
                  04 · Report
                </span>
                <h3>
                  Logged. Measured. Reported.
                </h3>
                <p>
                  Every touch lands in the CRM, and your numbers land on one dashboard.
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* SERVICES */}
        <section className="sec sec-light" id="services">
          <div className="wrap">
            <div className="sec-head rv">
              <span className="mono" style={{ color: "#86868b" }}>
                What we build
              </span>
              <h2 className="h-l">
                Six ways we put AI
                <br />
                to work for you.
              </h2>
              <p className="lede" style={{ maxWidth: "640px" }}>
                Most of our work is in real estate investing. The same systems run for any business that lives on leads, follow-up and data.
              </p>
            </div>
            <div className="grid3">
              <article className="tile rv">
                <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 5h16v11H8l-4 4z" />
                  <path d="M8 9.5h8M8 12.5h5" />
                </svg>
                <span className="mono tile-k">
                  01 · Estate 360
                </span>
                <h3>
                  Estate 360 agents
                </h3>
                <p>
                  AI texting and calling for sellers. Qualifies leads, books appointments, hands warm leads to your team and logs it all.
                </p>
                <div className="tags">
                  <span>
                    AI texting
                  </span>
                  <span>
                    AI calling
                  </span>
                  <span>
                    Lead qualification
                  </span>
                  <span>
                    CRM sync
                  </span>
                </div>
              </article>
              <article className="tile rv">
                <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3" />
                  <path d="M18 3v4h-4M6 21v-4h4" />
                </svg>
                <span className="mono tile-k">
                  02 · Automation
                </span>
                <h3>
                  Follow-up automation
                </h3>
                <p>
                  Fast SMS and email follow-up, AI reply sorting, booking and CRM updates — without a VA in the loop.
                </p>
                <div className="tags">
                  <span>
                    GoHighLevel
                  </span>
                  <span>
                    n8n
                  </span>
                  <span>
                    OpenAI
                  </span>
                </div>
              </article>
              <article className="tile rv">
                <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="4" y="3" width="16" height="18" rx="3" />
                  <path d="M8 7h8M8 12h2M14 12h2M8 16h2M14 16h2" />
                </svg>
                <span className="mono tile-k">
                  03 · Deal tools
                </span>
                <h3>
                  Deal tools & dashboards
                </h3>
                <p>
                  Comps and ARV, AI repair estimates, offer calculators and KPI dashboards that tell you where the money is.
                </p>
                <div className="tags">
                  <span>
                    Comps & ARV
                  </span>
                  <span>
                    Offer calculators
                  </span>
                  <span>
                    KPIs
                  </span>
                </div>
              </article>
              <article className="tile rv">
                <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="7" rx="2" />
                  <rect x="3" y="13" width="18" height="7" rx="2" />
                  <path d="M7 7.5h.01M7 16.5h.01" />
                </svg>
                <span className="mono tile-k">
                  04 · Hosting
                </span>
                <h3>
                  Managed hosting
                </h3>
                <p>
                  We host your n8n workflows, agents, dashboards and web apps — with backups and monitoring that alert us first.
                </p>
                <div className="tags">
                  <span>
                    n8n hosting
                  </span>
                  <span>
                    App hosting
                  </span>
                  <span>
                    Backups
                  </span>
                  <span>
                    Monitoring
                  </span>
                </div>
              </article>
              <article className="tile rv">
                <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
                  <path d="M19 16l.7 1.8 1.8.7-1.8.7L19 21l-.7-1.8-1.8-.7 1.8-.7z" />
                </svg>
                <span className="mono tile-k">
                  05 · Any business
                </span>
                <h3>
                  AI for any business
                </h3>
                <p>
                  AI assistants, document automation and app integrations for firms outside real estate.
                </p>
                <div className="tags">
                  <span>
                    Claude
                  </span>
                  <span>
                    OpenAI
                  </span>
                  <span>
                    APIs
                  </span>
                  <span>
                    MCP
                  </span>
                </div>
              </article>
              <article className="tile rv">
                <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="16" rx="3" />
                  <path d="M3 9h18M7 6.5h.01M10 6.5h.01" />
                </svg>
                <span className="mono tile-k">
                  06 · Software
                </span>
                <h3>
                  Web apps & portals
                </h3>
                <p>
                  Partner portals, hiring portals, client dashboards and full SaaS products, built to be maintained.
                </p>
                <div className="tags">
                  <span>
                    Next.js
                  </span>
                  <span>
                    React
                  </span>
                  <span>
                    Supabase
                  </span>
                </div>
              </article>
            </div>
          </div>
        </section>
        {/* DEAL TOOLS */}
        <section className="sec">
          <div className="wrap">
            <div className="split">
              <div className="rv" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <span className="mono" style={{ color: "var(--warm)" }}>
                  Deal tools
                </span>
                <h2 className="h-l">
                  Underwriting at the speed of a text.
                </h2>
                <p className="lede">
                  Comps, ARV and AI repair estimates feed straight into your offer calculators — so the number is ready before the seller picks up.
                </p>
              </div>
              <div className="engine zoom" role="img" aria-label="Offer engine: comps and ARV, AI repair estimate and offer calculators combine into a maximum allowable offer.">
                <div className="eng-row">
                  <span className="mono">
                    Step 1
                  </span>
                  <b>
                    Comps & ARV pulled
                  </b>
                  <span className="bar">
                    <i style={{ width: "94%" }} />
                  </span>
                </div>
                <div className="eng-row">
                  <span className="mono">
                    Step 2
                  </span>
                  <b>
                    AI repair estimate
                  </b>
                  <span className="bar">
                    <i style={{ width: "72%" }} />
                  </span>
                </div>
                <div className="eng-row">
                  <span className="mono">
                    Step 3
                  </span>
                  <b>
                    8 offer calculators run
                  </b>
                  <span className="bar">
                    <i style={{ width: "86%" }} />
                  </span>
                </div>
                <div className="eng-res">
                  <span className="mono">
                    Max allowable offer
                  </span>
                  <div className="formula">
                    ARV × [your %] − repairs − fees
                  </div>
                </div>
              </div>
            </div>
            <div className="stats">
              <div className="stat rv">
                <div className="num">
                  <span className="count" style={{ "--to": "15" } as React.CSSProperties} aria-hidden="true" />
                  <span className="sr">
                    15
                  </span>
                </div>
                <p>
                  SMS campaigns qualified by AI
                </p>
              </div>
              <div className="stat rv">
                <div className="num">
                  <span className="count" style={{ "--to": "8" } as React.CSSProperties} aria-hidden="true" />
                  <span className="sr">
                    8
                  </span>
                </div>
                <p>
                  Offer calculators in one tool
                </p>
              </div>
              <div className="stat rv">
                <div className="num">
                  <span className="count" style={{ "--to": "10" } as React.CSSProperties} aria-hidden="true" />
                  <span className="sr">
                    10
                  </span>
                </div>
                <p>
                  KPI views in one wholesaling OS
                </p>
              </div>
              <div className="stat rv">
                <div className="num">
                  <span className="count" style={{ "--to": "24" } as React.CSSProperties} aria-hidden="true" />
                  <span className="sr">
                    24
                  </span>
                  /7
                </div>
                <p>
                  Lead follow-up, every day of the year
                </p>
              </div>
            </div>
            <p className="mono" style={{ color: "#6e6e73", margin: "28px 0 0" }}>
              From a live client stack
            </p>
          </div>
        </section>
        {/* WORK */}
        <section className="sec sec-white" id="work">
          <div className="wrap">
            <div className="sec-head rv">
              <span className="mono" style={{ color: "#86868b" }}>
                Selected work
              </span>
              <h2 className="h-l">
                Systems we built.
                <br />
                <span style={{ color: "#86868b" }}>
                  Systems we still run.
                </span>
              </h2>
              <p className="lede" style={{ maxWidth: "640px" }}>
                Every project here is in production and operated by us today. Client names are anonymised on request.
              </p>
            </div>
            <div className="bento">
              <article className="card feat s4 zoom">
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <span className="mono" style={{ color: "var(--warm)" }}>
                    Liv Estates · Real estate · 2026
                  </span>
                  <h3>
                    AI Real Estate Lead Qualification & Calling System
                  </h3>
                  <p style={{ maxWidth: "560px" }}>
                    An outbound voice agent that holds real conversations with sellers, qualifies them and books appointments automatically.
                  </p>
                </div>
                <div className="wave" aria-hidden="true">
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
                  <i style={{ "--s": ".5", animationDelay: "-.2s" } as React.CSSProperties} />
                  <i style={{ "--s": ".9", animationDelay: "-.8s" } as React.CSSProperties} />
                  <i style={{ "--s": ".4", animationDelay: "-.6s" } as React.CSSProperties} />
                  <i style={{ "--s": ".65", animationDelay: "-1.2s" } as React.CSSProperties} />
                  <i style={{ "--s": ".3", animationDelay: "-.4s" } as React.CSSProperties} />
                  <i style={{ "--s": ".75", animationDelay: "-.1s" } as React.CSSProperties} />
                  <i style={{ "--s": ".55", animationDelay: "-.9s" } as React.CSSProperties} />
                  <i style={{ "--s": ".85", animationDelay: "-.3s" } as React.CSSProperties} />
                </div>
                <div className="tags">
                  <span>
                    Retell AI
                  </span>
                  <span>
                    Voice AI
                  </span>
                  <span>
                    CRM
                  </span>
                  <span>
                    Automation
                  </span>
                </div>
              </article>
              <article className="card s2 rv">
                <span className="mono">
                  Confidential · 2026
                </span>
                <h3>
                  AI-Powered CRM Automation for Multi-Client Operations
                </h3>
                <p>
                  Leads, booking, follow-ups, engagement and operations — automated across many client accounts.
                </p>
                <div className="tags">
                  <span>
                    GoHighLevel
                  </span>
                  <span>
                    n8n
                  </span>
                  <span>
                    AI workflows
                  </span>
                </div>
              </article>
              <article className="card s2 rv">
                <span className="mono">
                  Confidential · 2025
                </span>
                <h3>
                  AI Call Notes & CRM Sync
                </h3>
                <p>
                  Transcribes every call, writes a structured summary, extracts action items and syncs it all to the CRM.
                </p>
                <div className="tags">
                  <span>
                    Transcription
                  </span>
                  <span>
                    Summarization
                  </span>
                  <span>
                    CRM
                  </span>
                </div>
              </article>
              <article className="card s2 rv">
                <span className="mono">
                  Confidential · 2025
                </span>
                <h3>
                  HubSpot & CRM Middleware
                </h3>
                <p>
                  Two-way sync between HubSpot and internal CRM platforms, so every team works from the same record.
                </p>
                <div className="tags">
                  <span>
                    HubSpot
                  </span>
                  <span>
                    APIs
                  </span>
                  <span>
                    Middleware
                  </span>
                </div>
              </article>
              <article className="card s2 rv">
                <span className="mono">
                  Confidential · 2025
                </span>
                <h3>
                  Analytics & KPI Reporting Ecosystem
                </h3>
                <p>
                  Automated reporting for customer success, operational leadership and revenue across client accounts.
                </p>
                <div className="tags">
                  <span>
                    Analytics
                  </span>
                  <span>
                    Dashboards
                  </span>
                  <span>
                    KPIs
                  </span>
                </div>
              </article>
              <article className="card s6 rv" style={{ gridColumn: "span 6", minHeight: "0", flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "24px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: "1 1 420px" }}>
                  <span className="mono">
                    Confidential · 2026
                  </span>
                  <h3>
                    Multi-Tenant SaaS Platform Architecture & Operations
                  </h3>
                  <p>
                    Role-based access, operational dashboards, subscriptions and tenant management — architected to scale from one client to hundreds.
                  </p>
                </div>
                <div className="tags" style={{ marginTop: "0", paddingTop: "0" }}>
                  <span>
                    SaaS
                  </span>
                  <span>
                    Multi-tenant
                  </span>
                  <span>
                    Subscriptions
                  </span>
                  <span>
                    RBAC
                  </span>
                </div>
              </article>
            </div>
            <div className="sub-h rv">
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <span className="mono" style={{ color: "#86868b" }}>
                  More we’ve built
                </span>
                <h2 className="h-m">
                  Agents and tools, described simply.
                </h2>
              </div>
              <Link className="lnk" href="/contact">
                Ask for a walkthrough{" "}
                <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </Link>
            </div>
            <div className="bento">
              <article className="card prod mini s2 rv">
                <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="16" rx="3" />
                  <path d="M3 9h18" />
                  <path d="M10 13l4 2.2-1.8.5-.8 1.8z" />
                </svg>
                <span className="mono">
                  Browser agents
                </span>
                <h3>
                  Agents that use the web for you
                </h3>
                <p>
                  They log into portals, fill forms and pull data from sites that have no API.
                </p>
              </article>
              <article className="card prod mini s2 rv">
                <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
                </svg>
                <span className="mono">
                  AI assistant
                </span>
                <h3>
                  A conversational AI assistant
                </h3>
                <p>
                  Answers questions, books meetings and follows up — in chat or on the phone.
                </p>
              </article>
              <article className="card prod mini s2 rv">
                <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 5h16v11H8l-4 4z" />
                  <path d="M8 9.5h8M8 12.5h5" />
                </svg>
                <span className="mono">
                  Messaging
                </span>
                <h3>
                  Campaign messaging hub
                </h3>
                <p>
                  Run outreach, read every reply in one inbox, and let AI flag who’s ready to talk.
                </p>
              </article>
              <article className="card prod mini s2 rv">
                <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 21s-6-5.6-6-11a6 6 0 0 1 12 0c0 5.4-6 11-6 11z" />
                  <circle cx="12" cy="10" r="2.2" />
                </svg>
                <span className="mono">
                  Comps & offers
                </span>
                <h3>
                  Comping & offer engine
                </h3>
                <p>
                  Comps, ARV and repair estimates turned into offer numbers on one screen.
                </p>
              </article>
              <article className="card prod mini s2 rv">
                <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
                </svg>
                <span className="mono">
                  Dashboards
                </span>
                <h3>
                  Investor KPI dashboard
                </h3>
                <p>
                  Leads, offers, contracts and revenue — the whole business in one view.
                </p>
              </article>
              <article className="card prod mini s2 rv">
                <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="9" cy="8" r="3" />
                  <path d="M3 20a6 6 0 0 1 12 0" />
                  <path d="M16 4.5a3 3 0 0 1 0 6M18 20a6 6 0 0 0-2.5-4.9" />
                </svg>
                <span className="mono">
                  Portals
                </span>
                <h3>
                  Partner & hiring portals
                </h3>
                <p>
                  Private portals for partners, buyers and new hires, with the right access for each.
                </p>
              </article>
            </div>
          </div>
        </section>
        {/* HOSTING */}
        <section className="sec" id="hosting">
          <div className="wrap split">
            <div className="rv">
              <span className="mono" style={{ color: "var(--warm)" }}>
                Managed hosting
              </span>
              <h2 className="h-l" style={{ marginTop: "20px" }}>
                We ship it.
                <br />
                We run it.
              </h2>
              <p className="lede" style={{ marginTop: "24px" }}>
                Your automations are only worth something if they’re up at 3 AM. We host and watch everything we build.
              </p>
              <div className="host-g">
                <div>
                  <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3" />
                    <path d="M18 3v4h-4M6 21v-4h4" />
                  </svg>
                  <h3>
                    Managed n8n
                  </h3>
                  <p>
                    Shared plans or a dedicated server.
                  </p>
                </div>
                <div>
                  <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="16" rx="3" />
                    <path d="M3 9h18" />
                  </svg>
                  <h3>
                    App hosting
                  </h3>
                  <p>
                    Sites, portals and SaaS apps deployed from Git.
                  </p>
                </div>
                <div>
                  <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 3v12M7 10l5 5 5-5M4 20h16" />
                  </svg>
                  <h3>
                    Backups
                  </h3>
                  <p>
                    Scheduled, with a real restore path.
                  </p>
                </div>
                <div>
                  <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M3 12h4l3-7 4 14 3-7h4" />
                  </svg>
                  <h3>
                    Monitoring
                  </h3>
                  <p>
                    Alerts reach us first — before you notice.
                  </p>
                </div>
              </div>
            </div>
            <div className="board zoom" role="img" aria-label="Example status board showing hosted services running.">
              <div className="brow">
                <span className="live" aria-hidden="true" />
                <div>
                  <b>
                    n8n · Lead intake
                  </b>
                  <small>
                    Workflows · dedicated server
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
                    Estate 360 · Seller agent
                  </b>
                  <small>
                    SMS + voice
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
                    Wholesaling OS
                  </b>
                  <small>
                    Dashboards · app hosting
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
                    CRM sync
                  </b>
                  <small>
                    GoHighLevel · HubSpot
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
                    Scheduled snapshot · restore tested
                  </small>
                </div>
                <span className="ok mono">
                  Healthy
                </span>
              </div>
            </div>
          </div>
        </section>
        {/* OPEN SOURCE STACK */}
        <section className="sec sec-light" id="stack">
          <div className="wrap">
            <div className="sec-head rv">
              <span className="mono" style={{ color: "#86868b" }}>
                Open-source stack
              </span>
              <h2 className="h-l">
                Built on the frontier
                <br />
                of agent tooling.
              </h2>
              <p className="lede" style={{ maxWidth: "680px" }}>
                We track and build with the best open-source tools for Claude and coding agents — browser automation, workspace access, scraping, video and secure backends.
              </p>
            </div>
            <div className="grid4">
              <a className="repo rv" href="https://github.com/microsoft/playwright-cli">
                <span className="path">
                  microsoft/playwright-cli
                </span>
                <h3>
                  Playwright CLI
                </h3>
                <p>
                  Agents click through real browsers and write reusable tests — with far fewer tokens than MCP.
                </p>
                <span className="go">
                  GitHub
                  <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M7 17L17 7M9 7h8v8" />
                  </svg>
                </span>
              </a>
              <a className="repo rv" href="https://github.com/googleworkspace/cli">
                <span className="path">
                  googleworkspace/cli
                </span>
                <h3>
                  Google Workspace CLI
                </h3>
                <p>
                  Gmail, Drive, Calendar, Docs and Sheets from the command line, with agent skills built in.
                </p>
                <span className="go">
                  GitHub
                  <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M7 17L17 7M9 7h8v8" />
                  </svg>
                </span>
              </a>
              <a className="repo rv" href="https://github.com/apify/apify-mcp-server">
                <span className="path">
                  apify/apify-mcp-server
                </span>
                <h3>
                  Apify MCP
                </h3>
                <p>
                  Thousands of ready-made scrapers, callable from Claude, for lead and market data.
                </p>
                <span className="go">
                  GitHub
                  <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M7 17L17 7M9 7h8v8" />
                  </svg>
                </span>
              </a>
              <a className="repo rv" href="https://github.com/supabase/agent-skills">
                <span className="path">
                  supabase/agent-skills
                </span>
                <h3>
                  Supabase skills
                </h3>
                <p>
                  Backend guardrails for agents: per-user data access and secure-by-default schemas.
                </p>
                <span className="go">
                  GitHub
                  <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M7 17L17 7M9 7h8v8" />
                  </svg>
                </span>
              </a>
              <a className="repo rv" href="https://github.com/addyosmani/agent-skills">
                <span className="path">
                  addyosmani/agent-skills
                </span>
                <h3>
                  Agent Skills
                </h3>
                <p>
                  Spec, plan, build: a disciplined workflow that keeps big agent builds on the rails.
                </p>
                <span className="go">
                  GitHub
                  <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M7 17L17 7M9 7h8v8" />
                  </svg>
                </span>
              </a>
              <a className="repo rv" href="https://github.com/heygen-com/hyperframes">
                <span className="path">
                  heygen-com/hyperframes
                </span>
                <h3>
                  HyperFrames
                </h3>
                <p>
                  Video as code — agents write HTML and animation, and it renders to MP4.
                </p>
                <span className="go">
                  GitHub
                  <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M7 17L17 7M9 7h8v8" />
                  </svg>
                </span>
              </a>
              <a className="repo rv" href="https://github.com/expo/skills">
                <span className="path">
                  expo/skills
                </span>
                <h3>
                  Expo skills
                </h3>
                <p>
                  Mobile apps built by agents that follow app store submission rules.
                </p>
                <span className="go">
                  GitHub
                  <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M7 17L17 7M9 7h8v8" />
                  </svg>
                </span>
              </a>
              <a className="repo rv" href="https://github.com/obra/superpowers">
                <span className="path">
                  obra/superpowers
                </span>
                <h3>
                  Superpowers
                </h3>
                <p>
                  A planning-first skills library that makes coding agents think before they type.
                </p>
                <span className="go">
                  GitHub
                  <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M7 17L17 7M9 7h8v8" />
                  </svg>
                </span>
              </a>
            </div>
            <p className="mono" style={{ color: "#6e6e73", margin: "32px 0 0" }}>
              Curated with reference to{" "}
              <a href="https://www.mindstudio.ai/blog/best-claude-github-repos-workflow">
                MindStudio’s Claude repo roundup
              </a>
            </p>
          </div>
        </section>
        {/* PRINCIPLES */}
        <section className="sec" id="about">
          <div className="wrap">
            <div className="sec-head rv">
              <span className="mono" style={{ color: "#86868b" }}>
                How we work
              </span>
              <h2 className="h-l">
                Small on purpose.
                <br />
                <span style={{ color: "#6e6e73" }}>
                  The people who scope it build it.
                </span>
              </h2>
            </div>
            <div className="prin rv">
              <span className="mono">
                01
              </span>
              <h3 className="ft">
                Systems, not scripts.
              </h3>
              <p>
                Built to keep working — logged, monitored and easy to change.
              </p>
            </div>
            <div className="prin rv">
              <span className="mono">
                02
              </span>
              <h3 className="ft">
                Operate what we ship.
              </h3>
              <p>
                If we built it, we fix it. No hand-off and disappear.
              </p>
            </div>
            <div className="prin rv">
              <span className="mono">
                03
              </span>
              <h3 className="ft">
                AI where it earns its keep.
              </h3>
              <p>
                AI for the judgment calls. Plain, reliable automation everywhere else.
              </p>
            </div>
            <div className="prin rv" style={{ borderBottom: "1px solid var(--line)" }}>
              <span className="mono">
                04
              </span>
              <h3 className="ft">
                Plain language, always.
              </h3>
              <p>
                A written plan with scope, cost and timeline before any work begins.
              </p>
            </div>
          </div>
        </section>
        {/* PROCESS */}
        <section className="sec sec-light">
          <div className="wrap">
            <div className="sec-head center rv">
              <span className="mono" style={{ color: "#86868b" }}>
                From call to live
              </span>
              <h2 className="h-l">
                Four steps. No surprises.
              </h2>
            </div>
            <div className="proc">
              <div className="pstep rv">
                <span className="mono">
                  01
                </span>
                <h3>
                  Discovery call
                </h3>
                <p>
                  We learn your pipeline, your tools and where leads leak.
                </p>
              </div>
              <div className="pstep rv">
                <span className="mono">
                  02
                </span>
                <h3>
                  Written plan
                </h3>
                <p>
                  Scope, cost and timeline in writing, before anything starts.
                </p>
              </div>
              <div className="pstep rv">
                <span className="mono">
                  03
                </span>
                <h3>
                  Build in the open
                </h3>
                <p>
                  Short, visible steps, wired into the tools you already use.
                </p>
              </div>
              <div className="pstep rv">
                <span className="mono">
                  04
                </span>
                <h3>
                  Run & maintain
                </h3>
                <p>
                  We host it, watch it and keep improving it after launch.
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* CTA */}
        <section className="cta" id="contact">
          <div className="cta-glow" aria-hidden="true" />
          <div className="wrap" style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: "32px" }}>
            <span className="eyebrow mono">
              <span className="live" aria-hidden="true" />
              Taking new projects
            </span>
            <h2 className="h-xl zoom" style={{ maxWidth: "1000px" }}>
              Put an agent on
              <br />
              your{" "}
              <span className="grad">
                pipeline.
              </span>
            </h2>
            <p className="lede" style={{ maxWidth: "600px" }}>
              Tell us where your leads go cold. We’ll reply within 48 hours with a plan.
            </p>
            <div className="cta-row">
              <Link className="btn" href="/contact">
                Start a project
              </Link>
              <Link className="btn btn-ghost" href="/services">
                Explore services
              </Link>
            </div>
            <div className="meta-row mono">
              <span>
                Reply within 48 hours
              </span>
              <span>
                Limited projects at a time
              </span>
              <span>
                US investors & worldwide
              </span>
            </div>
          </div>
        </section>
        {/* FOOTER */}
      </main>
      <SiteFooter variant="home" />
    </SiteShell>
  );
}
