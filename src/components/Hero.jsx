import { useEffect, useRef } from "react";
import { useScrollProgress, RL } from "../hooks/scroll.jsx";

export default function Hero() {
  const ref = useRef(null);
  const markRef = useRef(null);
  const p = useScrollProgress(ref);

  useEffect(() => {
    const el = markRef.current;
    if (!el || window.matchMedia("(pointer: coarse)").matches) return;
    let tx = 0, ty = 0, cx = 0, cy = 0;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      tx = dx * 0.06; ty = dy * 0.06;
    };
    let raf;
    const tick = () => {
      cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08;
      el.style.setProperty("--mx", `${cx}px`);
      el.style.setProperty("--my", `${cy}px`);
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(tick);
    return () => { window.removeEventListener("mousemove", onMove); cancelAnimationFrame(raf); };
  }, []);

  const markStyle = {
    transform: `translate3d(calc(var(--mx, 0px) + ${p * 80}px), calc(var(--my, 0px) + ${p * -120}px), 0) scale(${1 + p * 0.1})`,
    opacity: 1 - p * 0.4,
  };

  const meta = [
    { k: "EST.", v: "MMXXIV" },
    { k: "Discipline", v: "Agentic systems" },
    { k: "Coverage", v: "Global · 24/7" },
    { k: "Status", v: <span><span style={{display:"inline-block",width:8,height:8,borderRadius:"50%",background:"#2BB6E0",marginRight:8,boxShadow:"0 0 0 3px rgba(43,182,224,0.18)"}}/>Accepting briefs</span> },
  ];

  return (
    <section className="hero" id="top" ref={ref}>
      <div className="hero-orbits">
        <svg viewBox="0 0 100 100">
          <circle className="ring" cx="50" cy="50" r="46"/>
          <circle className="ring r2" cx="50" cy="50" r="36"/>
          <g className="satellite s1"><circle cx="50" cy="4" r="1.2" fill="var(--c-cyan)"/></g>
          <g className="satellite s2"><circle cx="92" cy="50" r="1" fill="var(--c-magenta)"/></g>
          <g className="satellite s3"><circle cx="50" cy="86" r="1.4" fill="var(--c-orange)"/></g>
        </svg>
      </div>
      <div className="hero-mark-wrap" ref={markRef} style={markStyle}>
        <img src="/assets/sepnexus-mark.png" alt="" />
      </div>

      <div className="hero-tagline">
        <p className="lede reveal">
          A studio building <b style={{color:"var(--ink)"}}>autonomous agents</b>, end-to-end automation
          and resilient cloud systems for teams who refuse the status quo.
        </p>
      </div>

      <h1 className="display hero-headline">
        <RL delay={1}>The infrastructure</RL>
        <RL delay={2}>of <em>intelligent</em> work.</RL>
      </h1>

      <div className="hero-meta reveal">
        {meta.map((m, i) => (
          <div key={i}>
            <div>{m.k}</div>
            <b>{m.v}</b>
          </div>
        ))}
      </div>

      <div className="marquee reveal">
        <div className="marquee-track">
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i}>
              Agent orchestration <i className="dot"/>
              Process automation <i className="dot"/>
              Data pipelines <i className="dot"/>
              Cloud &amp; hosting <i className="dot"/>
              Custom AI integrations <i className="dot"/>
              Web &amp; app development <i className="dot"/>
              Agent orchestration <i className="dot"/>
              Process automation <i className="dot"/>
              Data pipelines <i className="dot"/>
              Cloud &amp; hosting <i className="dot"/>
              Custom AI integrations <i className="dot"/>
              Web &amp; app development <i className="dot"/>
            </span>
          ))}
        </div>
      </div>

      <div className="hero-scroll-cue">
        <span>Scroll</span>
        <span className="line"/>
      </div>
    </section>
  );
}
