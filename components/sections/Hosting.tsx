"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type LineKind = "info" | "ok" | "warn" | "ip";
type Line = { c: LineKind; t: string };

function Terminal() {
  const lines = useMemo<Line[]>(
    () => [
      { c: "info", t: "$ sepnexus deploy estate360 --client=your-team" },
      { c: "info", t: "→ building 3 agents · 6 workflows · 1 dashboard…" },
      { c: "ok", t: "✓ ssl active · auto-renew on · backups scheduled" },
      { c: "ok", t: "✓ agents/sms-qualifier → healthy" },
      { c: "ok", t: "✓ agents/ai-caller     → healthy" },
      { c: "ok", t: "✓ n8n workflows        → 6 active" },
      { c: "ip", t: "→ new lead · Tampa, FL · source=sms · motivation=high" },
      { c: "warn", t: "! lead 4471 · no reply in 5 min → follow-up queued" },
      { c: "ok", t: "✓ appointment booked · Tue 10:30 · synced to CRM" },
      { c: "info", t: "→ comps pulled · 3bd/2ba · ARV $312k · offer range ready" },
      { c: "ok", t: "✓ daily KPI report sent to owner · 9:00 am" },
    ],
    [],
  );

  const [shown, setShown] = useState(0);
  const termRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(lines.length);
      return;
    }
    const el = termRef.current;
    if (!el) return;
    let id = 0;
    // Start typing only once the terminal is actually on screen.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        id = window.setInterval(() => {
          setShown((n) => {
            if (n + 1 >= lines.length) window.clearInterval(id);
            return Math.min(n + 1, lines.length);
          });
        }, 420);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearInterval(id);
    };
  }, [lines.length]);

  return (
    <div className="terminal" ref={termRef} role="img" aria-label="Example deployment log for an Estate 360 setup">
      <div className="terminal-bar">
        <span className="dot" style={{ background: "#ff5f57" }} />
        <span className="dot" style={{ background: "#febc2e" }} />
        <span className="dot" style={{ background: "#28c840" }} />
        <span className="title">sepnexus — live client stack</span>
      </div>
      {lines.slice(0, shown).map((l, i) => (
        <div key={i} className="line">
          <span className={l.c}>{l.t}</span>
        </div>
      ))}
      {shown < lines.length && <span className="cursor" />}
      {shown >= lines.length && (
        <div className="line">
          <span className="prompt">sepnexus </span>
          <span className="cmd">› </span>
          <span className="cursor" />
        </div>
      )}
    </div>
  );
}

export default function Hosting() {
  return (
    <section className="section" id="hosting">
      <div className="container hosting">
        <div>
          <span className="eyebrow reveal">04 — Hosting</span>
          <h2 className="section-title reveal" style={{ marginTop: 16 }}>
            We host what
            <br />
            we <em className="serif-italic">build.</em>
          </h2>
          <p className="lede reveal" style={{ marginTop: 18 }}>
            Your agents, n8n workflows, dashboards and web apps run on servers we set up, secure
            and watch. One team builds it and keeps it running — so when something breaks, you
            don&apos;t have to work out whose problem it is.
          </p>
          <ul
            className="reveal"
            style={{ marginTop: 26, listStyle: "none", display: "grid", gap: 12 }}
          >
            {(
              [
                ["Managed n8n", "Shared plans or your own dedicated server"],
                ["App hosting", "Websites, portals and SaaS apps, deployed from Git"],
                ["Backups", "Scheduled backups and a way back if something goes wrong"],
                ["Monitoring", "Alerts reach us first, not your customers"],
              ] as const
            ).map(([k, v]) => (
              <li
                key={k}
                style={{
                  display: "grid",
                  gridTemplateColumns: "140px 1fr",
                  gap: 16,
                  paddingBottom: 12,
                  borderBottom: "1px solid var(--line)",
                }}
              >
                <b style={{ fontFamily: "var(--mono)", fontSize: 13, letterSpacing: "0.04em" }}>
                  {k}
                </b>
                <span style={{ color: "var(--muted)" }}>{v}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="reveal">
          <Terminal />
        </div>
      </div>
    </section>
  );
}
