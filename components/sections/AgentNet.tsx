"use client";

import { useRef, useState } from "react";
import {
  useScrollEffect,
  pinProgress,
  prefersReducedMotion,
  clamp,
  easeOutCubic,
} from "@/lib/hooks/scroll";

const NODES = [
  { id: "core", x: 50, y: 50, r: 28, label: "Estate 360", color: "var(--ink)" },
  { id: "research", x: 18, y: 22, r: 14, label: "Lead sources", color: "var(--c-cyan)" },
  { id: "decide", x: 82, y: 22, r: 14, label: "AI texting", color: "var(--c-yellow)" },
  { id: "act", x: 86, y: 70, r: 14, label: "AI calling", color: "var(--c-orange)" },
  { id: "observe", x: 50, y: 90, r: 14, label: "Comps & offers", color: "var(--c-red)" },
  { id: "memory", x: 14, y: 70, r: 14, label: "CRM & KPIs", color: "var(--c-magenta)" },
];
const EDGES: [string, string][] = [
  ["core", "research"],
  ["core", "decide"],
  ["core", "act"],
  ["core", "observe"],
  ["core", "memory"],
  ["research", "decide"],
  ["decide", "act"],
  ["act", "observe"],
  ["observe", "memory"],
  ["memory", "research"],
];
const STEPS = [
  { n: "01", label: "Catch every lead the moment it lands" },
  { n: "02", label: "Text or call, qualify, book the appointment" },
  { n: "03", label: "Pull comps and prepare the offer" },
  { n: "04", label: "Log it in your CRM and report the numbers" },
];

/**
 * Pinned on desktop: progress follows the sticky scroll. On phones the section
 * isn't pinned (it would clip), so progress follows it entering the viewport.
 * With reduced motion the diagram is simply shown complete.
 */
function measure(rect: DOMRect, vh: number): number {
  if (prefersReducedMotion()) return 1;
  if (window.matchMedia("(max-width: 960px)").matches) {
    return clamp((vh * 0.85 - rect.top) / (rect.height * 0.6), 0, 1);
  }
  return pinProgress(rect, vh);
}

export default function AgentNet() {
  const containerRef = useRef<HTMLElement>(null);
  const edgeRefs = useRef<(SVGLineElement | null)[]>([]);
  const haloRefs = useRef<(SVGCircleElement | null)[]>([]);
  const nodeRefs = useRef<(SVGCircleElement | null)[]>([]);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);
  // Only the discrete active step lives in React state; everything continuous is written to the DOM.
  const [activeStep, setActiveStep] = useState(0);

  const nodeAt = (id: string) => NODES.find((n) => n.id === id)!;

  useScrollEffect(containerRef, measure, (p) => {
    const edgeReveal = clamp(p / 0.55, 0, 1);
    const labelReveal = clamp((p - 0.25) / 0.6, 0, 1);

    EDGES.forEach(([a, b], i) => {
      const line = edgeRefs.current[i];
      if (!line) return;
      const A = nodeAt(a);
      const B = nodeAt(b);
      const t = clamp(edgeReveal * EDGES.length - i, 0, 1);
      line.setAttribute("x2", String(A.x + (B.x - A.x) * t));
      line.setAttribute("y2", String(A.y + (B.y - A.y) * t));
      line.setAttribute("stroke-opacity", String(0.55 + 0.4 * t));
    });

    NODES.forEach((n, i) => {
      const t = clamp((p - 0.05 - i * 0.04) / 0.4, 0, 1);
      const r = n.r * 0.06 * easeOutCubic(t);
      const halo = haloRefs.current[i];
      const node = nodeRefs.current[i];
      if (halo) {
        halo.setAttribute("r", String(r * 1.7));
        halo.setAttribute("opacity", String(0.18 * t));
      }
      if (node) node.setAttribute("r", String(r));

      const label = labelRefs.current[i];
      if (label) {
        const reveal = clamp((labelReveal * NODES.length - i) * 0.7, 0, 1);
        label.style.opacity = String(reveal);
        label.style.transform = `translate(-50%, calc(-50% + ${(1 - reveal) * 10}px))`;
        label.style.borderColor = reveal > 0.5 ? n.color : "";
        label.style.color = reveal > 0.5 ? "var(--ink)" : "";
      }
    });

    const step = clamp(Math.floor(p * STEPS.length * 1.05), 0, STEPS.length - 1);
    setActiveStep((prev) => (prev === step ? prev : step));
  });

  return (
    <section className="agentnet" id="loop" ref={containerRef}>
      <div className="agentnet-pin">
        <div className="agentnet-copy">
          <span className="eyebrow">03 — How it works</span>
          <h2 className="section-title" style={{ marginTop: 16 }}>
            Agents that <em className="serif-italic">close the loop.</em>
          </h2>
          <p className="lede" style={{ marginTop: 18 }}>
            Estate 360 connects the whole deal cycle, from the first text to the offer on the
            table. Every step runs inside your CRM, and your team can see it and step in at any
            time.
          </p>
          <ol className="step-list">
            {STEPS.map((s, i) => (
              <li
                key={s.n}
                className={`step ${i <= activeStep ? "active" : ""}`}
                aria-current={i === activeStep ? "step" : undefined}
              >
                <span className="n">{s.n}</span>
                <span className="label">{s.label}</span>
              </li>
            ))}
          </ol>
        </div>

        <div
          className="agentnet-stage"
          role="img"
          aria-label={`Diagram: ${NODES[0].label} at the centre, connected to ${NODES.slice(1)
            .map((n) => n.label)
            .join(", ")}.`}
        >
          <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
            <defs>
              <linearGradient id="edgeGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#2BB6E0" />
                <stop offset="50%" stopColor="#B14999" />
                <stop offset="100%" stopColor="#EE7E2D" />
              </linearGradient>
            </defs>
            {[20, 32, 44].map((r) => (
              <circle
                key={r}
                cx="50"
                cy="50"
                r={r}
                fill="none"
                stroke="rgba(20,17,16,0.08)"
                strokeDasharray="0.5 1.5"
              />
            ))}
            {EDGES.map(([a], i) => {
              const A = nodeAt(a);
              return (
                <line
                  key={i}
                  ref={(el) => {
                    edgeRefs.current[i] = el;
                  }}
                  x1={A.x}
                  y1={A.y}
                  x2={A.x}
                  y2={A.y}
                  stroke="url(#edgeGrad)"
                  strokeWidth="0.35"
                  strokeOpacity={0.55}
                  strokeLinecap="round"
                />
              );
            })}
            {NODES.map((n, i) => (
              <g key={n.id}>
                <circle
                  ref={(el) => {
                    haloRefs.current[i] = el;
                  }}
                  cx={n.x}
                  cy={n.y}
                  r={0}
                  fill={n.color}
                  opacity={0}
                />
                <circle
                  ref={(el) => {
                    nodeRefs.current[i] = el;
                  }}
                  cx={n.x}
                  cy={n.y}
                  r={0}
                  fill={n.id === "core" ? "var(--ink)" : "var(--bg)"}
                  stroke={n.color}
                  strokeWidth="0.35"
                />
              </g>
            ))}
            <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(20,17,16,0.1)" strokeWidth="0.18" />
          </svg>
          {NODES.map((n, i) => (
            <div
              key={n.id}
              ref={(el) => {
                labelRefs.current[i] = el;
              }}
              className="node-label"
              aria-hidden="true"
              style={{
                left: `${n.x}%`,
                top: `${n.y - 10}%`,
                opacity: 0,
                transform: "translate(-50%, calc(-50% + 10px))",
              }}
            >
              {n.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
