"use client";

import { useEffect, useMemo, useState } from "react";

type LineKind = "info" | "ok" | "warn" | "ip";
type Line = { c: LineKind; t: string };

function Terminal() {
  const lines = useMemo<Line[]>(
    () => [
      { c: "info", t: "$ sepnexus deploy --env=prod --region=eu-west-1" },
      { c: "info", t: "→ resolving graph (12 services, 4 agents, 2 queues)…" },
      { c: "ok", t: "✓ infra applied · 0 drift · 412ms" },
      { c: "ok", t: "✓ agents/orchestrator → v2.41.0 healthy" },
      { c: "ok", t: "✓ agents/finance-bot   → v1.18.3 healthy" },
      { c: "ok", t: "✓ agents/support-tier1 → v3.02.7 healthy" },
      { c: "warn", t: "! cost guard: 73% of monthly budget · projected 91%" },
      { c: "info", t: "→ scaling region us-east-1: 4 → 6 nodes" },
      { c: "ok", t: "✓ ingress.tls renewed · 89 days remaining" },
      { c: "ip", t: "→ run/9F8A21 · queued · agent=support · sla=2m" },
      { c: "ok", t: "✓ run/9F8A21 · resolved in 41s · csat=4.8" },
    ],
    [],
  );

  const [shown, setShown] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setShown((n) => (n >= lines.length ? lines.length : n + 1));
    }, 420);
    return () => clearInterval(id);
  }, [lines.length]);

  return (
    <div className="terminal">
      <div className="terminal-bar">
        <span className="dot" style={{ background: "#ff5f57" }} />
        <span className="dot" style={{ background: "#febc2e" }} />
        <span className="dot" style={{ background: "#28c840" }} />
        <span className="title">sepnexus@cloud — production</span>
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
          <span className="eyebrow reveal">04 — Platform</span>
          <h2 className="section-title reveal" style={{ marginTop: 16 }}>
            Managed cloud
            <br />
            built for <em className="serif-italic">agents.</em>
          </h2>
          <p className="lede reveal" style={{ marginTop: 18 }}>
            One control plane for every agent, pipeline and service. Deploys are deterministic,
            costs are observable, incidents are owned. We host on AWS, GCP and bare metal — and we
            operate it for you.
          </p>
          <ul
            className="reveal"
            style={{ marginTop: 26, listStyle: "none", display: "grid", gap: 12 }}
          >
            {(
              [
                ["99.99%", "uptime SLA on managed agents"],
                ["SOC 2", "Type II in progress · GDPR-aligned"],
                ["Single tenant", "VPC-isolated for enterprise tier"],
                ["Region pinning", "EU, US, APAC · data sovereignty"],
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
