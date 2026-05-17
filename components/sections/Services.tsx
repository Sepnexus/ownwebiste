"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

type GlyphKind = "agent" | "loop" | "pipe" | "cloud" | "plug" | "frame";

type Service = {
  n: string;
  color: string;
  feature?: boolean;
  title: string;
  body: string;
  tags: string[];
  glyph: GlyphKind;
  href: string;
};

const SERVICES: Service[] = [
  {
    n: "01",
    color: "var(--c-magenta)",
    feature: true,
    title: "Autonomous AI agents",
    body: "Multi-step agents that operate your business 24/7 — researching, deciding, executing. Built on Claude, GPT and Gemini with custom tool layers, memory and guardrails.",
    tags: ["Tool use", "Memory", "RAG", "Eval harness"],
    glyph: "agent",
    href: "/services#agents",
  },
  {
    n: "02",
    color: "var(--c-orange)",
    title: "Process automation",
    body: "End the copy-paste economy. We replace internal workflows with deterministic pipelines and human-in-the-loop reviews.",
    tags: ["n8n", "Temporal", "Zapier"],
    glyph: "loop",
    href: "/services#automation",
  },
  {
    n: "03",
    color: "var(--c-yellow)",
    title: "Data pipelines & analytics",
    body: "From ingestion to decision. Streaming and batch pipelines, semantic layers and self-serve dashboards.",
    tags: ["dbt", "Airflow", "Postgres"],
    glyph: "pipe",
    href: "/services#data",
  },
  {
    n: "04",
    color: "var(--c-cyan)",
    feature: true,
    title: "Cloud & managed hosting",
    body: "We design, deploy and operate the infrastructure your agents and apps run on — with SLAs that hold up under enterprise scrutiny.",
    tags: ["AWS", "GCP", "Kubernetes", "Terraform"],
    glyph: "cloud",
    href: "/services#hosting",
  },
  {
    n: "05",
    color: "var(--c-purple)",
    title: "Custom AI integrations",
    body: "Slot intelligence into the tools you already use. CRMs, ERPs, comms, ticketing — without ripping anything out.",
    tags: ["Salesforce", "HubSpot", "Slack"],
    glyph: "plug",
    href: "/services#integrations",
  },
  {
    n: "06",
    color: "var(--c-red)",
    title: "Web & app development",
    body: "Studio-grade interfaces that don't feel like enterprise software. Built for the agents underneath.",
    tags: ["Next.js", "React", "Swift"],
    glyph: "frame",
    href: "/services#development",
  },
];

function ServiceGlyph({ kind, color }: { kind: GlyphKind; color: string }) {
  const stroke = {
    stroke: color,
    strokeWidth: 1.5,
    fill: "none",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (kind === "agent")
    return (
      <svg viewBox="0 0 240 240">
        <circle cx="120" cy="120" r="46" {...stroke} />
        <circle cx="120" cy="120" r="78" {...stroke} strokeOpacity="0.55" />
        <circle cx="120" cy="120" r="110" {...stroke} strokeOpacity="0.25" />
        <circle cx="120" cy="74" r="6" fill={color} />
        <circle cx="166" cy="120" r="4" fill={color} />
        <circle cx="120" cy="166" r="5" fill={color} />
        <circle cx="74" cy="120" r="3" fill={color} />
        <circle cx="42" cy="120" r="3" fill={color} />
        <circle cx="198" cy="120" r="4" fill={color} />
      </svg>
    );
  if (kind === "loop")
    return (
      <svg viewBox="0 0 240 240">
        <path d="M40 120 C 40 70, 120 70, 120 120 S 200 170, 200 120" {...stroke} />
        <path
          d="M40 140 C 40 90, 120 90, 120 140 S 200 190, 200 140"
          {...stroke}
          strokeOpacity="0.45"
        />
        <circle cx="40" cy="120" r="4" fill={color} />
        <circle cx="200" cy="120" r="4" fill={color} />
      </svg>
    );
  if (kind === "pipe")
    return (
      <svg viewBox="0 0 240 240">
        {[60, 100, 140, 180].map((y) => (
          <path
            key={y}
            d={`M20 ${y} H 220`}
            {...stroke}
            strokeOpacity={0.6 - (y - 60) / 240}
          />
        ))}
        <circle cx="60" cy="60" r="3" fill={color} />
        <circle cx="120" cy="100" r="3" fill={color} />
        <circle cx="180" cy="140" r="3" fill={color} />
        <circle cx="100" cy="180" r="3" fill={color} />
      </svg>
    );
  if (kind === "cloud")
    return (
      <svg viewBox="0 0 240 240">
        <path
          d="M60 150 q -30 0, -30 -28 q 0 -28, 32 -28 q 6 -32, 44 -32 q 38 0, 46 32 q 36 -2, 36 30 q 0 26, -28 26 z"
          {...stroke}
        />
        <path d="M70 175 H 170 M80 200 H 160" {...stroke} strokeOpacity="0.5" />
      </svg>
    );
  if (kind === "plug")
    return (
      <svg viewBox="0 0 240 240">
        <rect x="60" y="80" width="50" height="80" rx="10" {...stroke} />
        <rect x="130" y="80" width="50" height="80" rx="10" {...stroke} />
        <path d="M110 120 H 130" {...stroke} />
        <path d="M40 100 H 60 M40 140 H 60" {...stroke} />
        <path d="M180 100 H 200 M180 140 H 200" {...stroke} />
      </svg>
    );
  return (
    <svg viewBox="0 0 240 240">
      <rect x="40" y="50" width="160" height="120" rx="8" {...stroke} />
      <path d="M40 76 H 200" {...stroke} />
      <circle cx="56" cy="63" r="2.5" fill={color} />
      <circle cx="68" cy="63" r="2.5" fill={color} />
      <rect x="58" y="92" width="60" height="44" rx="4" {...stroke} />
      <path
        d="M130 96 H 184 M130 108 H 170 M130 120 H 178 M130 132 H 160"
        {...stroke}
        strokeOpacity="0.6"
      />
    </svg>
  );
}

function ServiceCard({ s }: { s: Service }) {
  const ref = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach(
          (e) => e.isIntersecting && (e.target.classList.add("in"), io.unobserve(e.target)),
        ),
      { threshold: 0.2 },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  const onMove: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <Link
      href={s.href}
      ref={ref}
      onMouseMove={onMove}
      className={`service-card reveal ${s.feature ? "feature" : ""}`}
      style={{ ["--accent" as string]: s.color }}
    >
      <span className="accent-bar" style={{ background: s.color }} />
      <span className="flood" />
      <div>
        <div className="num">{s.n} / Service</div>
        <h3>{s.title}</h3>
        <p>{s.body}</p>
      </div>
      <div className="tags">
        {s.tags.map((t) => (
          <span key={t} className="tag">
            {t}
          </span>
        ))}
      </div>
      <div className="service-glyph">
        <ServiceGlyph kind={s.glyph} color={s.color} />
      </div>
    </Link>
  );
}

export default function Services() {
  return (
    <section className="section" id="services">
      <div className="container">
        <div className="services-head">
          <div>
            <span className="eyebrow reveal">02 — Capabilities</span>
            <h2 className="section-title reveal" style={{ marginTop: 16 }}>
              Six disciplines.
              <br />
              <em className="serif-italic">One operating system</em>
              <br /> for your business.
            </h2>
          </div>
          <p className="lede reveal">
            We don&apos;t sell a product. We assemble bespoke intelligence for each client —
            pulling from a deep stack of agentic, automation and infrastructure work we&apos;ve
            shipped for a decade.
          </p>
        </div>
        <div className="services-grid">
          {SERVICES.map((s) => (
            <ServiceCard key={s.n} s={s} />
          ))}
        </div>
      </div>
    </section>
  );
}
