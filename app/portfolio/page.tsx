import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import CTA from "@/components/sections/CTA";
import { db, schema } from "@/lib/db";
import { eq, asc } from "drizzle-orm";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Selected work from Sepnexus — autonomous agents, automation systems and managed cloud builds shipped for our clients.",
};

export const dynamic = "force-dynamic";

export default async function PortfolioPage() {
  let entries: (typeof schema.portfolioEntries.$inferSelect)[] = [];
  try {
    entries = await db
      .select()
      .from(schema.portfolioEntries)
      .where(eq(schema.portfolioEntries.published, true))
      .orderBy(asc(schema.portfolioEntries.sortOrder));
  } catch {
    // DB not reachable in build / preview — fall through to empty state.
    entries = [];
  }

  return (
    <>
      <Nav />
      <main className="page">
        <div className="page-narrow">
          <span className="page-eyebrow reveal">Portfolio — Selected work</span>
          <h1 className="page-title reveal">
            Quiet machines,
            <br />
            <em>shipped.</em>
          </h1>
          <p className="page-lede reveal">
            A small selection of recent engagements. Each one is a system we still operate today.
            Names anonymised on request.
          </p>

          {entries.length === 0 ? (
            <div className="portfolio-empty reveal">
              <h3>Case studies are on the way.</h3>
              <p>
                We&apos;re assembling write-ups for our most representative recent builds. In the
                meantime, if you want to talk to one of our existing clients as a reference, ask
                during your <Link href="/contact?type=request_access">access request</Link> — we&apos;ll
                make the introduction.
              </p>
            </div>
          ) : (
            <div
              className="reveal"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 24,
                marginTop: 32,
              }}
            >
              {entries.map((e) => (
                <article
                  key={e.id}
                  style={{
                    border: "1px solid var(--line)",
                    borderRadius: 18,
                    background: "rgba(255,255,255,0.6)",
                    padding: 28,
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                  }}
                >
                  <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: 11,
                        color: "var(--muted)",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                      }}
                    >
                      {e.client ?? "Confidential"} {e.year ? `· ${e.year}` : ""}
                    </span>
                  </header>
                  <h3
                    style={{
                      fontFamily: "var(--serif)",
                      fontWeight: 400,
                      fontSize: 28,
                      letterSpacing: "-0.01em",
                      margin: 0,
                      color: "var(--ink)",
                    }}
                  >
                    {e.title}
                  </h3>
                  {e.summary && (
                    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "var(--ink-2)" }}>
                      {e.summary}
                    </p>
                  )}
                  {Array.isArray(e.tags) && e.tags.length > 0 && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
                      {(e.tags as string[]).map((t) => (
                        <span
                          key={t}
                          style={{
                            fontFamily: "var(--mono)",
                            fontSize: 10,
                            padding: "3px 8px",
                            borderRadius: 999,
                            border: "1px solid var(--line)",
                            color: "var(--muted)",
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
      <CTA />
      <Footer />
    </>
  );
}
