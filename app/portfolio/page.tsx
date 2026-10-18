import type { Metadata } from "next";
import Link from "next/link";
import SiteShell from "@/components/site/SiteShell";
import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";
import WorkFilter from "./_components/WorkFilter";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Every system here is in production and operated by us today: AI agents, voice AI, CRM automation, deal tools, dashboards and portals. Client names are anonymised on request.",
  alternates: { canonical: "/portfolio" },
};

// Ported from the Claude Design file Work.dc.html. Markup, classes and wording
// match the design exactly; styles live in styles/site/base.css + work.css.
// The filterable "All work" grid is a client component (WorkFilter).
export default function WorkPage() {
  return (
    <SiteShell page="work">
      <SiteNav current="work" />
      <main id="main">
        {/* HERO */}
        <section className="phero">
          <div className="phero-glow" aria-hidden="true" />
          <div className="wrap phero-in">
            <span className="eyebrow mono in d1">
              Selected work
            </span>
            <h1 className="h-xl in d2">
              Systems we built.
              <br />
              <span style={{ color: "#6e6e73" }}>
                Systems we still run.
              </span>
            </h1>
            <p className="lede in d3" style={{ maxWidth: "680px" }}>
              Every system here is in production and operated by us today. Client names are anonymised on request.
            </p>
          </div>
        </section>
        {/* FEATURED */}
        <section style={{ padding: "0 0 120px" }}>
          <div className="wrap">
            <article className="feat-big zoom">
              <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "22px" }}>
                <span className="mono" style={{ color: "var(--warm)" }}>
                  Featured · Liv Estates · 2026
                </span>
                <h2 className="h-m">
                  AI Real Estate Lead Qualification & Calling System
                </h2>
                <p className="lede">
                  An outbound voice agent that holds real conversations with sellers, qualifies them and books appointments — automatically, at any hour.
                </p>
                <ul className="checks">
                  <li>
                    <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    Handles live seller conversations end to end
                  </li>
                  <li>
                    <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    Qualifies and books straight onto the calendar
                  </li>
                  <li>
                    <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    Every call and outcome synced to the CRM
                  </li>
                </ul>
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
              </div>
              <div className="callcard" role="img" aria-label="Illustrative voice call between the AI agent and a seller, ending in a booked appointment.">
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span className="live" aria-hidden="true" />
                  <b style={{ fontWeight: "600" }}>
                    Outbound call · in progress
                  </b>
                  <span className="badge badge-ai" style={{ marginLeft: "auto" }}>
                    Voice AI
                  </span>
                </div>
                <div className="wave" style={{ height: "72px" }} aria-hidden="true">
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
                </div>
                <div className="line">
                  <span className="who">
                    Agent
                  </span>
                  <span>
                    Hi, is this the owner of the house on Oak Street? I’m calling about the offer request you sent.
                  </span>
                </div>
                <div className="line">
                  <span className="who">
                    Seller
                  </span>
                  <span className="muted">
                    Yes — we’re thinking about selling this year.
                  </span>
                </div>
                <div className="line">
                  <span className="who">
                    Agent
                  </span>
                  <span>
                    Great. What’s the condition like, and when would you ideally move?
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 16px", borderRadius: "16px", background: "#000", border: "1px solid rgba(255,255,255,.14)", fontSize: "14px" }}>
                  <span className="dot" style={{ background: "var(--b2)" }} />
                  Qualified · appointment booked · CRM updated
                </div>
                <p className="mono" style={{ color: "#6e6e73", margin: "0", fontSize: "11px" }}>
                  Illustrative
                </p>
              </div>
            </article>
          </div>
        </section>
        {/* ALL WORK */}
        <section className="sec sec-white">
          <div className="wrap">
            <WorkFilter />
            <p className="fine" style={{ marginTop: "32px" }}>
              Dark cards are agents and tools we describe without client details.
            </p>
          </div>
        </section>
        {/* NUMBERS */}
        <section className="sec">
          <div className="wrap">
            <div className="sec-head rv">
              <span className="mono dim">
                From a live client stack
              </span>
              <h2 className="h-l">
                Numbers that keep running.
              </h2>
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
          </div>
        </section>
        {/* CTA */}
        <section className="cta" style={{ paddingTop: "80px" }}>
          <div className="cta-glow" aria-hidden="true" />
          <div className="wrap" style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: "32px" }}>
            <h2 className="h-xl zoom" style={{ maxWidth: "1000px" }}>
              Your system{" "}
              <span className="grad">
                could be next.
              </span>
            </h2>
            <p className="lede" style={{ maxWidth: "600px" }}>
              Tell us the loop you want closed. We’ll reply within 48 hours with a plan.
            </p>
            <div className="cta-row" style={{ justifyContent: "center" }}>
              <Link className="btn" href="/contact">
                Start a project
              </Link>
              <Link className="btn btn-ghost" href="/services">
                Explore services
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </SiteShell>
  );
}
