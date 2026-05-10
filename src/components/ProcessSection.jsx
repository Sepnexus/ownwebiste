import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePinProgress, easeInOutCubic, lerp } from "../hooks/scroll.jsx";

const PROCESS = [
  { n: "STAGE 01", title: "Discover", body: "We embed for two weeks. We learn your stack, your humans, your bottlenecks. We leave with a map.", color: "var(--c-cyan)" },
  { n: "STAGE 02", title: "Architect", body: "A precise blueprint: which agents, which tools, which guardrails, which dashboards. Signed off before code.", color: "var(--c-magenta)" },
  { n: "STAGE 03", title: "Build", body: "Two-week sprints, demoed live. We ship the boring 80% as automation; we reserve agents for the hard 20%.", color: "var(--c-yellow)" },
  { n: "STAGE 04", title: "Operate", body: "We don't hand off and disappear. Sepnexus runs the systems we build under SLAs your CTO will sign.", color: "var(--c-orange)" },
  { n: "STAGE 05", title: "Compound", body: "Monthly evaluations, drift detection, retraining. The system gets sharper while you focus on the business.", color: "var(--c-red)" },
];

function ProcessVisual({ i, color }) {
  if (i === 0) return (
    <svg viewBox="0 0 400 220">
      {Array.from({length: 14}).map((_, k) => (
        <circle key={k} cx={20 + k * 28} cy={110 + Math.sin(k) * 30} r={2.5} fill={color} opacity={0.4 + (k%5)/8}/>
      ))}
      <path d="M20 110 Q 200 30, 380 130" stroke={color} fill="none" strokeWidth="1.4" strokeDasharray="3 4"/>
    </svg>
  );
  if (i === 1) return (
    <svg viewBox="0 0 400 220">
      {[0, 1, 2].map((r) => (
        <rect key={r} x={40 + r * 110} y={60} width="90" height="100" rx="6" fill="none" stroke={color} strokeWidth="1.2"/>
      ))}
      <path d="M130 110 H 150 M240 110 H 260" stroke={color} strokeWidth="1.2"/>
      <text x="50" y="50" fontFamily="var(--mono)" fontSize="10" fill="var(--muted)">BLUEPRINT.v3</text>
    </svg>
  );
  if (i === 2) return (
    <svg viewBox="0 0 400 220">
      {Array.from({length: 18}).map((_, k) => (
        <line key={k} x1={20 + k*22} y1={40 + (k%3)*40} x2={20 + k*22} y2={40 + (k%3)*40 + 60}
              stroke={color} strokeWidth="2" opacity={0.3 + (k%5)/8}/>
      ))}
    </svg>
  );
  if (i === 3) return (
    <svg viewBox="0 0 400 220">
      <circle cx="120" cy="110" r="60" fill="none" stroke={color} strokeWidth="1.2"/>
      <circle cx="120" cy="110" r="32" fill="none" stroke={color} strokeWidth="1.2" strokeOpacity="0.5"/>
      <circle cx="120" cy="110" r="6" fill={color}/>
      <path d="M200 110 H 380" stroke={color} strokeDasharray="2 4"/>
      <rect x="240" y="80" width="60" height="60" fill="none" stroke={color} strokeWidth="1.2"/>
      <rect x="320" y="80" width="60" height="60" fill="none" stroke={color} strokeWidth="1.2"/>
    </svg>
  );
  return (
    <svg viewBox="0 0 400 220">
      <path d="M20 180 L 80 140 L 130 160 L 190 100 L 250 120 L 320 60 L 380 40"
            fill="none" stroke={color} strokeWidth="2"/>
      {[20,80,130,190,250,320,380].map((x, k) => (
        <circle key={k} cx={x} cy={[180,140,160,100,120,60,40][k]} r={3} fill={color}/>
      ))}
    </svg>
  );
}

export default function ProcessSection() {
  const containerRef = useRef(null);
  const p = usePinProgress(containerRef);
  const trackRef = useRef(null);
  const [maxX, setMaxX] = useState(0);
  useLayoutEffect(() => {
    const measure = () => {
      if (!trackRef.current) return;
      const w = trackRef.current.scrollWidth;
      setMaxX(Math.max(0, w - window.innerWidth + 80));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);
  const x = -lerp(0, maxX, easeInOutCubic(p));
  return (
    <section className="process" id="process" ref={containerRef}>
      <div className="process-pin">
        <div className="process-head">
          <div>
            <span className="eyebrow">04 — How we work</span>
            <h2 className="section-title" style={{ marginTop: 12 }}>Five stages, no ceremony.</h2>
          </div>
          <p className="lede" style={{ maxWidth: "32ch" }}>
            Most agencies hand you a deck. We hand you a system that earns its keep on day 30.
          </p>
        </div>
        <div className="process-track" ref={trackRef} style={{ transform: `translate3d(${x}px,0,0)` }}>
          {PROCESS.map((s, i) => (
            <article key={s.n} className="process-card">
              <div>
                <span className="stage" style={{ color: s.color }}>{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
              <div className="visual">
                <ProcessVisual i={i} color={s.color} />
              </div>
            </article>
          ))}
          <article className="process-card" style={{ background: "var(--ink)", color: "var(--bg)" }}>
            <div>
              <span className="stage" style={{ color: "var(--c-yellow)" }}>NEXT</span>
              <h3 style={{ color: "var(--bg)" }}>Start a brief.</h3>
              <p style={{ color: "var(--muted-2)" }}>Two-week paid pilots. Production within 60 days.</p>
            </div>
            <a href="#access" className="btn btn-outline" style={{ color: "var(--bg)", borderColor: "rgba(255,255,255,0.3)", alignSelf:"flex-start" }}>
              Request access
              <svg className="arrow" viewBox="0 0 14 14" fill="none">
                <path d="M3 11L11 3M11 3H4M11 3V10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </article>
        </div>
        <div className="process-progress" style={{ "--p": `${p * 100}%` }} />
      </div>
    </section>
  );
}
