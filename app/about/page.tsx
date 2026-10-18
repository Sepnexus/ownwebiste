import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SiteShell from "@/components/site/SiteShell";
import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";

export const metadata: Metadata = {
  title: "About",
  description:
    "The people who scope your project are the people who build it — and the people who keep it running after launch. AI agents, automation and custom software for real estate investors and growing businesses.",
  alternates: { canonical: "/about" },
};

// Ported from the Claude Design file About.dc.html. Markup, classes and wording
// match the design exactly; styles live in styles/site/base.css + about.css.
export default function AboutPage() {
  return (
    <SiteShell page="about">
      <SiteNav current="about" />
      <main id="main">
        {/* HERO */}
        <section className="phero">
          <div className="wrap split">
            <div className="phero-in">
              <span className="eyebrow mono in d1">
                About · Est. MMXXIV
              </span>
              <h1 className="h-xl in d2">
                Small on
                <br />
                <span className="grad">
                  purpose.
                </span>
              </h1>
              <p className="lede in d3" style={{ maxWidth: "520px" }}>
                The people who scope your project are the people who build it — and the people who keep it running after launch.
              </p>
              <div className="cta-row in d4">
                <Link className="btn" href="/contact">
                  Work with us
                </Link>
                <Link className="btn btn-ghost" href="/portfolio">
                  See the work
                </Link>
              </div>
            </div>
            <div className="mark-wrap in d5" aria-hidden="true">
              <span className="mark-ring" />
              <span className="mark-ring r2" />
              <Image src="/assets/sepnexus-mark.png" width={500} height={500} className="big-mark" alt="" />
            </div>
          </div>
        </section>
        {/* STATEMENT */}
        <section className="sec" style={{ paddingTop: "40px" }}>
          <div className="wrap">
            <p className="big-p">
              <span className="ft">
                We build AI agents, automation and custom software
              </span>
              {" "}
              <span className="ft">
                for real estate investors and growing businesses.
              </span>
              {" "}
              <span className="ft">
                Most of our work is in real estate investing.
              </span>
              {" "}
              <span className="ft">
                The same tools serve any business that runs on leads,
              </span>
              {" "}
              <span className="ft">
                documents and follow-up.
              </span>
            </p>
          </div>
        </section>
        {/* FACTS */}
        <section style={{ paddingBottom: "168px" }}>
          <div className="wrap">
            <div className="facts rv">
              <div>
                <span className="mono">
                  Founded
                </span>
                <b>
                  MMXXIV
                </b>
              </div>
              <div>
                <span className="mono">
                  Registered
                </span>
                <b>
                  Chandigarh, India
                </b>
              </div>
              <div>
                <span className="mono">
                  Clients
                </span>
                <b>
                  US investors & worldwide
                </b>
              </div>
              <div>
                <span className="mono">
                  Reply time
                </span>
                <b>
                  Within 48 hours
                </b>
              </div>
            </div>
          </div>
        </section>
        {/* PRINCIPLES */}
        <section className="sec" style={{ paddingTop: "0" }}>
          <div className="wrap">
            <div className="sec-head rv">
              <span className="mono dim">
                What we believe
              </span>
              <h2 className="h-l">
                Four principles.
                <br />
                <span style={{ color: "#6e6e73" }}>
                  Every project.
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
                Scope, cost and timeline in writing before work starts. No creeping retainers.
              </p>
            </div>
          </div>
        </section>
        {/* WHERE */}
        <section className="sec" style={{ paddingTop: "40px" }}>
          <div className="wrap">
            <div className="split" style={{ marginBottom: "56px" }}>
              <div className="rv" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <span className="mono dim">
                  Where we work
                </span>
                <h2 className="h-l">
                  Your night is our day.
                </h2>
              </div>
              <p className="lede rv">
                We’re based in India and work remotely with US real estate investors and businesses worldwide. While your team sleeps, we’re shipping — and your agents never clock out.
              </p>
            </div>
            <div className="globe zoom" role="img" aria-label="Map showing Sepnexus in Chandigarh, India, connected to clients in the United States.">
              <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                <defs>
                  <pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse">
                    <circle cx="11" cy="11" r="1.6" fill="rgba(255,255,255,.12)" />
                  </pattern>
                  <linearGradient id="arcg" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#1BA8E0" />
                    <stop offset="50%" stopColor="#E8514C" />
                    <stop offset="100%" stopColor="#FDBE2E" />
                  </linearGradient>
                  <radialGradient id="pg">
                    <stop offset="0%" stopColor="rgba(255,255,255,.9)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                  </radialGradient>
                </defs>
                <rect width="1600" height="900" fill="url(#dots)" />
                <path d="M0 300 H1600 M0 450 H1600 M0 600 H1600" stroke="rgba(255,255,255,.05)" />
                <path className="arc-path" d="M365 300 Q753 -60 1141 330" fill="none" stroke="url(#arcg)" strokeWidth="3" strokeLinecap="round" />
                <circle cx="365" cy="300" r="40" fill="url(#pg)" opacity=".35" />
                <circle cx="365" cy="300" r="8" fill="#1BA8E0" />
                <circle cx="1141" cy="330" r="40" fill="url(#pg)" opacity=".35" />
                <circle cx="1141" cy="330" r="8" fill="#FDBE2E" />
              </svg>
              <div className="pin-l" style={{ left: "22.8%", top: "33.3%" }}>
                United States
                <small>
                  Investors & clients
                </small>
              </div>
              <div className="pin-l" style={{ left: "71.3%", top: "36.7%" }}>
                Chandigarh, India
                <small>
                  Mon–Fri · 9:00–18:00 IST
                </small>
              </div>
            </div>
          </div>
        </section>
        {/* PROCESS */}
        <section className="sec sec-light">
          <div className="wrap">
            <div className="sec-head center rv">
              <span className="mono" style={{ color: "#86868b" }}>
                How we work
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
        {/* STACK */}
        <section className="sec-s">
          <div className="wrap" style={{ marginBottom: "40px" }}>
            <div className="split">
              <h2 className="h-m rv">
                The tools we know inside out.
              </h2>
              <p className="lede rv">
                We build on proven platforms and the best open-source agent tooling.{" "}
                <Link href="/#stack">
                  See the open-source stack
                </Link>
                .
              </p>
            </div>
          </div>
          <div className="marq" aria-label="GoHighLevel, n8n, OpenAI, Claude, Retell AI, HubSpot, Close, Supabase, Next.js, React, Postgres, Docker, Cloudflare, MCP">
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
                  Close
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
                  Postgres
                </span>
                <span>
                  Docker
                </span>
                <span>
                  Cloudflare
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
                  Close
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
                  Postgres
                </span>
                <span>
                  Docker
                </span>
                <span>
                  Cloudflare
                </span>
                <span>
                  MCP
                </span>
              </div>
            </div>
          </div>
        </section>
        {/* CTA */}
        <section className="cta">
          <div className="cta-glow" aria-hidden="true" />
          <div className="wrap" style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: "32px" }}>
            <h2 className="h-xl zoom" style={{ maxWidth: "1000px" }}>
              Let’s close{" "}
              <span className="grad">
                your loop.
              </span>
            </h2>
            <p className="lede" style={{ maxWidth: "600px" }}>
              We take a limited number of projects at a time. Tell us about yours.
            </p>
            <div className="cta-row" style={{ justifyContent: "center" }}>
              <Link className="btn" href="/contact">
                Start a project
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </SiteShell>
  );
}
