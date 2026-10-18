import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import SiteShell from "@/components/site/SiteShell";
import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";

/**
 * The design's auth layout (SignIn.dc.html): site nav without the Sign in link,
 * the `.auth-art` panel on the left, one `.form-card` on the right and the
 * one-line footer. Used by /login, /forgot, /reset/[token] and /invite/[token];
 * each page puts its own content inside the form card.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <SiteShell page="signin">
      <SiteNav signIn={false} />
      <main id="main" className="auth">
        <AuthArt />
        <div className="auth-form">
          <div className="form-card in d3">{children}</div>
        </div>
      </main>
      <SiteFooter variant="minimal" />
    </SiteShell>
  );
}

/**
 * A card heading + intro in the design's form-card header style (the
 * "Welcome back" block). For the server-rendered states of forgot / reset /
 * invite, e.g. "Link expired.".
 */
export function CardHead({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <h2 className="h-s">{title}</h2>
      <p className="muted" style={{ margin: "0", fontSize: "15px", lineHeight: 1.5 }}>
        {children}
      </p>
    </div>
  );
}

/** Row of next-step buttons under a CardHead. */
export const ACTIONS_ROW: CSSProperties = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  alignItems: "center",
};

function AuthArt() {
  return (
    <div className="auth-art">
      <span className="ring" style={{ width: "560px", height: "560px" }} aria-hidden="true" />
      <span
        className="ring"
        style={{
          width: "400px",
          height: "400px",
          borderStyle: "solid",
          borderColor: "rgba(255,255,255,.06)",
        }}
        aria-hidden="true"
      />
      <span className="eyebrow mono in d1" style={{ position: "relative" }}>
        <span className="live" aria-hidden="true" />
        Client dashboard
      </span>
      <Image src="/assets/sepnexus-mark.png" width={500} height={500} className="auth-mark in d2" alt="" />
      <div
        className="in d3"
        style={{ position: "relative", display: "flex", flexDirection: "column", gap: "20px" }}
      >
        <h1 className="h-m">
          Your agents, workflows and numbers —{" "}
          <span className="grad">in one place.</span>
        </h1>
        <div className="mini-feats">
          <div>
            <span className="dot" style={{ background: "var(--b1)" }} />
            Live status of every system we run for you
          </div>
          <div>
            <span className="dot" style={{ background: "var(--b3)" }} />
            KPI dashboards and reports
          </div>
          <div>
            <span className="dot" style={{ background: "var(--b6)" }} />
            Requests and support in one thread
          </div>
        </div>
      </div>
    </div>
  );
}
