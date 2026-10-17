"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useScrollProgress, RL } from "@/lib/hooks/scroll";

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const p = useScrollProgress(ref);
  const [still, setStill] = useState(false);

  useEffect(() => {
    const el = markRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStill(true);
      return;
    }
    if (window.matchMedia("(pointer: coarse)").matches) return;
    let tx = 0,
      ty = 0,
      cx = 0,
      cy = 0;
    let raf = 0;
    // Ease toward the pointer, then stop the loop once it has settled.
    const tick = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      el.style.setProperty("--mx", `${cx}px`);
      el.style.setProperty("--my", `${cy}px`);
      raf = Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1 ? requestAnimationFrame(tick) : 0;
    };
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      tx = (e.clientX - (r.left + r.width / 2)) * 0.06;
      ty = (e.clientY - (r.top + r.height / 2)) * 0.06;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  const markStyle: React.CSSProperties | undefined = still
    ? undefined
    : {
        transform: `translate3d(calc(var(--mx, 0px) + ${p * 80}px), calc(var(--my, 0px) + ${p * -120}px), 0) scale(${1 + p * 0.1})`,
        opacity: 1 - p * 0.4,
      };

  const meta: { k: string; v: React.ReactNode }[] = [
    { k: "EST.", v: "MMXXIV" },
    { k: "Focus", v: "Real estate · AI agents" },
    { k: "Coverage", v: "US & worldwide · 24/7" },
    {
      k: "Status",
      v: (
        <span>
          <span
            style={{
              display: "inline-block",
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#2BB6E0",
              marginRight: 8,
              boxShadow: "0 0 0 3px rgba(43,182,224,0.18)",
            }}
          />
          Taking new projects
        </span>
      ),
    },
  ];

  return (
    <section className="hero" id="top" ref={ref}>
      <div className="hero-orbits">
        <svg viewBox="0 0 100 100">
          <circle className="ring" cx="50" cy="50" r="46" />
          <circle className="ring r2" cx="50" cy="50" r="36" />
          <g className="satellite s1">
            <circle cx="50" cy="4" r="1.2" fill="var(--c-cyan)" />
          </g>
          <g className="satellite s2">
            <circle cx="92" cy="50" r="1" fill="var(--c-magenta)" />
          </g>
          <g className="satellite s3">
            <circle cx="50" cy="86" r="1.4" fill="var(--c-orange)" />
          </g>
        </svg>
      </div>
      <div className="hero-mark-wrap" ref={markRef} style={markStyle}>
        <Image src="/assets/sepnexus-mark.png" alt="" width={240} height={240} priority />
      </div>

      <div className="hero-tagline">
        <p className="lede reveal">
          We build <b style={{ color: "var(--ink)" }}>AI agents</b> and automation for real
          estate investors and growing businesses — so every lead gets an answer, every deal
          gets underwritten, and your numbers stay in view.
        </p>
      </div>

      <h1 className="display hero-headline">
        <RL delay={1}>AI agents that</RL>
        <RL delay={2}>
          work your <em>pipeline.</em>
        </RL>
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
              Estate 360 agents <i className="dot" />
              AI texting &amp; calling <i className="dot" />
              Lead qualification <i className="dot" />
              Comps &amp; underwriting <i className="dot" />
              KPI dashboards <i className="dot" />
              GoHighLevel &amp; n8n <i className="dot" />
              Web apps &amp; portals <i className="dot" />
              Managed hosting <i className="dot" />
              Estate 360 agents <i className="dot" />
              AI texting &amp; calling <i className="dot" />
              Lead qualification <i className="dot" />
              Comps &amp; underwriting <i className="dot" />
              KPI dashboards <i className="dot" />
              GoHighLevel &amp; n8n <i className="dot" />
              Web apps &amp; portals <i className="dot" />
              Managed hosting <i className="dot" />
            </span>
          ))}
        </div>
      </div>

      <div className="hero-scroll-cue">
        <span>Scroll</span>
        <span className="line" />
      </div>
    </section>
  );
}
