import { useRef } from "react";
import { usePinProgress, clamp, easeOutCubic } from "../hooks/scroll.jsx";

const NODES = [
  { id: "core", x: 50, y: 50, r: 28, label: "Sepnexus core", color: "var(--ink)" },
  { id: "research", x: 18, y: 22, r: 14, label: "Research", color: "var(--c-cyan)" },
  { id: "decide",   x: 82, y: 22, r: 14, label: "Decide",   color: "var(--c-yellow)" },
  { id: "act",      x: 86, y: 70, r: 14, label: "Act",      color: "var(--c-orange)" },
  { id: "observe",  x: 50, y: 90, r: 14, label: "Observe",  color: "var(--c-red)" },
  { id: "memory",   x: 14, y: 70, r: 14, label: "Memory",   color: "var(--c-magenta)" },
];
const EDGES = [
  ["core","research"], ["core","decide"], ["core","act"], ["core","observe"], ["core","memory"],
  ["research","decide"], ["decide","act"], ["act","observe"], ["observe","memory"], ["memory","research"],
];
const STEPS = [
  { n: "01", label: "Ingest signal from your stack" },
  { n: "02", label: "Plan with reasoning + tools" },
  { n: "03", label: "Act inside your systems" },
  { n: "04", label: "Observe outcomes, learn, repeat" },
];

export default function AgentNet() {
  const containerRef = useRef(null);
  const p = usePinProgress(containerRef);
  const edgeReveal = clamp(p / 0.55, 0, 1);
  const labelReveal = clamp((p - 0.25) / 0.6, 0, 1);
  const activeStep = clamp(Math.floor(p * STEPS.length * 1.05), 0, STEPS.length - 1);

  const nodeAt = (id) => NODES.find((n) => n.id === id);
  return (
    <section className="agentnet" id="platform" ref={containerRef}>
      <div className="agentnet-pin">
        <div className="agentnet-copy">
          <span className="eyebrow">03 — How it works</span>
          <h2 className="section-title" style={{ marginTop: 16 }}>
            Agents that <em className="serif-italic">close the loop.</em>
          </h2>
          <p className="lede" style={{ marginTop: 18 }}>
            Each Sepnexus deployment is a sealed loop — perception, planning,
            action and learning — wired into your stack and supervised in real time.
          </p>
          <div className="step-list">
            {STEPS.map((s, i) => (
              <div key={s.n} className={`step ${i <= activeStep ? "active" : ""}`}>
                <span className="n">{s.n}</span>
                <span className="label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="agentnet-stage">
          <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="edgeGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#2BB6E0"/>
                <stop offset="50%" stopColor="#B14999"/>
                <stop offset="100%" stopColor="#EE7E2D"/>
              </linearGradient>
            </defs>
            {[20, 32, 44].map((r) => (
              <circle key={r} cx="50" cy="50" r={r} fill="none" stroke="rgba(20,17,16,0.08)" strokeDasharray="0.5 1.5" />
            ))}
            {EDGES.map(([a, b], i) => {
              const A = nodeAt(a), B = nodeAt(b);
              const t = clamp(edgeReveal * EDGES.length - i, 0, 1);
              return (
                <line key={i} x1={A.x} y1={A.y} x2={A.x + (B.x - A.x) * t} y2={A.y + (B.y - A.y) * t}
                      stroke="url(#edgeGrad)" strokeWidth="0.35" strokeOpacity={0.55 + 0.4 * t} strokeLinecap="round" />
              );
            })}
            {NODES.map((n, i) => {
              const t = clamp((p - 0.05 - i * 0.04) / 0.4, 0, 1);
              const r = n.r * 0.06 * easeOutCubic(t);
              const fill = n.id === "core" ? "var(--ink)" : "var(--bg)";
              return (
                <g key={n.id}>
                  <circle cx={n.x} cy={n.y} r={r * 1.7} fill={n.color} opacity={0.18 * t}/>
                  <circle cx={n.x} cy={n.y} r={r} fill={fill} stroke={n.color} strokeWidth="0.35"/>
                </g>
              );
            })}
            <g>
              <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(20,17,16,0.1)" strokeWidth="0.18"/>
            </g>
          </svg>
          {NODES.map((n, i) => {
            const reveal = clamp((labelReveal * NODES.length - i) * 0.7, 0, 1);
            return (
              <div key={n.id} className="node-label"
                   style={{
                     left: `${n.x}%`, top: `${n.y - 10}%`,
                     opacity: reveal,
                     transform: `translate(-50%, calc(-50% + ${(1 - reveal) * 10}px))`,
                     borderColor: reveal > 0.5 ? n.color : undefined,
                     color: reveal > 0.5 ? "var(--ink)" : undefined,
                   }}>
                {n.label}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
