import type { ReactNode } from "react";
import SiteShell from "@/components/site/SiteShell";
import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";
import LegalToc from "./_components/LegalToc";

// Ported from the Claude Design file Legal.dc.html. Markup, classes and wording
// match the design; styles live in styles/site/base.css + legal.css. The
// design's tabs are real routes here: each /legal/* page renders its own
// document into `.doc`, and the sidebar (LegalToc) marks the current one.
export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <SiteShell page="legal">
      <SiteNav />
      <main id="main">
        <section className="phero" style={{ padding: "112px 0 72px" }}>
          <div className="phero-glow" aria-hidden="true" />
          <div className="wrap phero-in">
            <span className="eyebrow mono in d1">Legal</span>
            <h1 className="h-l in d2">
              Clear terms.
              <br />
              <span style={{ color: "#6e6e73" }}>Plain language.</span>
            </h1>
          </div>
        </section>

        <section className="sec sec-light" style={{ paddingTop: "80px" }}>
          <div className="wrap legal">
            <LegalToc />
            <article className="doc">{children}</article>
          </div>
        </section>
      </main>
      <SiteFooter />
    </SiteShell>
  );
}
