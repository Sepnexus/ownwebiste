import type { Metadata } from "next";
import Link from "next/link";
import SiteShell from "@/components/site/SiteShell";
import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";

export const metadata: Metadata = {
  title: "Managed hosting",
  description:
    "Your automations are only worth something if they’re up at 3 AM. We host, secure, patch and watch everything we build — and the systems you already have.",
  alternates: { canonical: "/hosting" },
};

// Ported from the Claude Design file Hosting.dc.html. Markup, classes and wording
// match the design exactly; styles live in styles/site/base.css + hosting.css.
export default function HostingPage() {
  return (
    <SiteShell page="hosting">
      <SiteNav current="hosting" />
      <main id="main">
        {/* HERO */}
        <section className="phero" style={{ paddingBottom: "140px" }}>
          <div className="phero-glow" aria-hidden="true" />
          <div className="wrap phero-in center">
            <span className="eyebrow mono in d1">
              <span className="live" aria-hidden="true" />
              Managed hosting
            </span>
            <h1 className="h-xl in d2">
              We ship it.
              <br />
              <span className="grad">
                We run it.
              </span>
            </h1>
            <p className="lede in d3" style={{ maxWidth: "680px" }}>
              Your automations are only worth something if they’re up at 3 AM. We host, secure, patch and watch everything we build — and the systems you already have.
            </p>
            <div className="cta-row in d4">
              <Link className="btn" href="/contact">
                Host with us
              </Link>
              <a className="btn btn-ghost" href="#plans">
                Compare n8n options
              </a>
            </div>
          </div>
          <div className="wrap">
            <div className="board board-big in d5" role="img" aria-label="Example status board: hosted workflows, agents, apps, backups and monitoring all running.">
              <div className="board-top">
                <span className="live" aria-hidden="true" />
                All systems running
                <span className="mono" style={{ marginLeft: "auto", fontSize: "11px" }}>
                  Example board
                </span>
              </div>
              <div className="brow">
                <span className="dot" style={{ background: "var(--b1)" }} />
                <div>
                  <b>
                    n8n · Lead intake
                  </b>
                  <small>
                    Queue mode · dedicated server
                  </small>
                </div>
                <span className="ok mono">
                  Running
                </span>
              </div>
              <div className="brow">
                <span className="dot" style={{ background: "var(--b2)" }} />
                <div>
                  <b>
                    Seller agent · SMS + voice
                  </b>
                  <small>
                    Agent runtime
                  </small>
                </div>
                <span className="ok mono">
                  Running
                </span>
              </div>
              <div className="brow">
                <span className="dot" style={{ background: "var(--b3)" }} />
                <div>
                  <b>
                    Investor dashboard
                  </b>
                  <small>
                    App hosting · deployed from Git · SSL active
                  </small>
                </div>
                <span className="ok mono">
                  Running
                </span>
              </div>
              <div className="brow">
                <span className="dot" style={{ background: "var(--b4)" }} />
                <div>
                  <b>
                    Partner portal
                  </b>
                  <small>
                    App hosting · SSL renews automatically
                  </small>
                </div>
                <span className="ok mono">
                  Running
                </span>
              </div>
              <div className="brow">
                <span className="dot" style={{ background: "var(--b6)" }} />
                <div>
                  <b>
                    Backups
                  </b>
                  <small>
                    Scheduled snapshot · restore path tested
                  </small>
                </div>
                <span className="ok mono">
                  Healthy
                </span>
              </div>
              <div className="brow">
                <span className="dot" style={{ background: "#8a4fb0", boxShadow: "0 0 0 2px var(--b5)" }} />
                <div>
                  <b>
                    Monitoring
                  </b>
                  <small>
                    Alerts route to Sepnexus first
                  </small>
                </div>
                <span className="ok mono">
                  Watching
                </span>
              </div>
            </div>
          </div>
        </section>
        {/* PILLARS */}
        <section className="sec sec-light">
          <div className="wrap">
            <div className="sec-head rv">
              <span className="mono" style={{ color: "#86868b" }}>
                What’s included
              </span>
              <h2 className="h-l">
                Everything a server needs.
                <br />
                <span style={{ color: "#86868b" }}>
                  None of it on your plate.
                </span>
              </h2>
            </div>
            <div className="grid3">
              <div className="tile rv">
                <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3" />
                  <path d="M18 3v4h-4M6 21v-4h4" />
                </svg>
                <h3>
                  Managed n8n
                </h3>
                <p>
                  Shared plans, or a dedicated queue-mode server for heavy workflows.
                </p>
              </div>
              <div className="tile rv">
                <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="16" rx="3" />
                  <path d="M3 9h18" />
                </svg>
                <h3>
                  App hosting
                </h3>
                <p>
                  Websites, portals and SaaS apps, deployed straight from Git.
                </p>
              </div>
              <div className="tile rv">
                <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="5" y="10" width="14" height="10" rx="2" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                </svg>
                <h3>
                  Free SSL
                </h3>
                <p>
                  On every site, renewed automatically. Nothing to remember.
                </p>
              </div>
              <div className="tile rv">
                <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 3v12M7 10l5 5 5-5M4 20h16" />
                </svg>
                <h3>
                  Backups
                </h3>
                <p>
                  Scheduled, with a real restore path when you need one.
                </p>
              </div>
              <div className="tile rv">
                <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M3 12h4l3-7 4 14 3-7h4" />
                </svg>
                <h3>
                  Monitoring
                </h3>
                <p>
                  Alerts reach us first, so issues are caught before customers notice.
                </p>
              </div>
              <div className="tile rv">
                <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
                <h3>
                  Updates & patches
                </h3>
                <p>
                  Security patches and version updates handled for you.
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* N8N OPTIONS */}
        <section className="sec" id="plans">
          <div className="wrap">
            <div className="sec-head rv">
              <span className="mono dim">
                Managed n8n
              </span>
              <h2 className="h-l">
                Two ways to run your workflows.
              </h2>
            </div>
            <div className="grid2">
              <div className="plan rv">
                <span className="mono" style={{ color: "#0066cc" }}>
                  Shared
                </span>
                <h3>
                  For getting started
                </h3>
                <p>
                  Your workflows on our managed n8n, with backups and monitoring included.
                </p>
                <ul className="checks">
                  <li>
                    <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    Managed setup and updates
                  </li>
                  <li>
                    <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    Scheduled backups
                  </li>
                  <li>
                    <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    Monitoring with alerts
                  </li>
                </ul>
              </div>
              <div className="plan plan-dark rv" style={{ border: "1px solid var(--line)" }}>
                <span className="mono" style={{ color: "var(--warm)" }}>
                  Dedicated
                </span>
                <h3>
                  For workflows that can’t wait
                </h3>
                <p>
                  A server of your own, running n8n in queue mode for volume and reliability.
                </p>
                <ul className="checks">
                  <li>
                    <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    Dedicated queue-mode server
                  </li>
                  <li>
                    <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    Isolated from other workloads
                  </li>
                  <li>
                    <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    Backups, monitoring and patches included
                  </li>
                </ul>
              </div>
            </div>
            <p className="fine" style={{ marginTop: "24px" }}>
              Prefer your own server? We can run n8n on your infrastructure too.
            </p>
          </div>
        </section>
        {/* DEPLOY PIPELINE */}
        <section className="sec" style={{ paddingTop: "40px" }}>
          <div className="wrap">
            <div className="sec-head center rv">
              <span className="mono dim">
                App hosting
              </span>
              <h2 className="h-l">
                Push to Git. We take it from there.
              </h2>
            </div>
            <div className="pipe rv">
              <div className="pipe-line" aria-hidden="true">
                <i />
              </div>
              <div className="pstage">
                <span className="node">
                  <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="6" cy="6" r="2.5" />
                    <circle cx="6" cy="18" r="2.5" />
                    <circle cx="18" cy="9" r="2.5" />
                    <path d="M6 8.5v7M18 11.5c0 3-4 3.5-10 5" />
                  </svg>
                </span>
                <h3>
                  Push
                </h3>
                <p>
                  Your code lands in Git.
                </p>
              </div>
              <div className="pstage">
                <span className="node">
                  <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M21 8l-9-5-9 5 9 5z" />
                    <path d="M3 8v8l9 5 9-5V8M12 13v8" />
                  </svg>
                </span>
                <h3>
                  Build
                </h3>
                <p>
                  Containerised with Docker.
                </p>
              </div>
              <div className="pstage">
                <span className="node">
                  <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="5" y="10" width="14" height="10" rx="2" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  </svg>
                </span>
                <h3>
                  Deploy
                </h3>
                <p>
                  Live behind SSL and Cloudflare.
                </p>
              </div>
              <div className="pstage">
                <span className="node">
                  <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M3 12h4l3-7 4 14 3-7h4" />
                  </svg>
                </span>
                <h3>
                  Watch
                </h3>
                <p>
                  Monitored, backed up, patched.
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* STACK MARQUEE */}
        <div className="marq" aria-label="Hosting stack: Docker, n8n, Postgres, Traefik, Cloudflare, Linux VPS">
          <div className="marq-track" aria-hidden="true">
            <div className="marq-g">
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
            <div className="marq-g">
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
        </div>
        {/* FAQ */}
        <section className="sec sec-light">
          <div className="wrap narrow">
            <div className="sec-head rv">
              <span className="mono" style={{ color: "#86868b" }}>
                Questions
              </span>
              <h2 className="h-l">
                Hosting, answered.
              </h2>
            </div>
            <div className="faq rv">
              <details open>
                <summary>
                  Can you host workflows we already built?
                  <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </summary>
                <p>
                  Yes. We host the systems we build and the automations, agents, dashboards and apps you already have.
                </p>
              </details>
              <details>
                <summary>
                  Your servers or ours?
                  <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </summary>
                <p>
                  Either. Most clients run on our managed servers, but we can operate n8n and apps on your own infrastructure.
                </p>
              </details>
              <details>
                <summary>
                  What happens when something breaks?
                  <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </summary>
                <p>
                  Monitoring alerts reach us first. We investigate and fix it — usually before your customers notice anything.
                </p>
              </details>
              <details>
                <summary>
                  How is hosting billed?
                  <svg className="ic ic-s" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </summary>
                <p>
                  As a simple subscription, monthly or yearly, in USD.
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
              Sleep through{" "}
              <span className="grad">
                3 AM.
              </span>
            </h2>
            <p className="lede" style={{ maxWidth: "600px" }}>
              Tell us what you need hosted. We’ll reply within 48 hours with a setup plan.
            </p>
            <div className="cta-row" style={{ justifyContent: "center" }}>
              <Link className="btn" href="/contact">
                Host with us
              </Link>
              <Link className="btn btn-ghost" href="/services">
                All services
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </SiteShell>
  );
}
