"use client";

import { useEffect, useRef, useState } from "react";

function StatNumber({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [v, setV] = useState(value);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const m = String(value).match(/([<>~]?)(\d+(?:\.\d+)?)([^\d]*)/);
    if (!m) {
      setV(value);
      return;
    }
    const [, prefix, numStr, suffix] = m;
    const target = parseFloat(numStr);
    let started = false;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !started) {
            started = true;
            const dur = 1600;
            const t0 = performance.now();
            const step = (t: number) => {
              const k = Math.min(1, (t - t0) / dur);
              const eased = 1 - Math.pow(1 - k, 3);
              const cur = target * eased;
              const display = numStr.includes(".")
                ? cur.toFixed(1)
                : Math.round(cur).toString();
              setV(`${prefix}${display}${suffix}`);
              if (k < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
            io.disconnect();
          }
        });
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value]);
  return (
    <span ref={ref}>
      <em>{v}</em>
    </span>
  );
}

export default function Stats() {
  return (
    <section className="section" id="stats" style={{ paddingTop: 40, paddingBottom: 40 }}>
      <div className="container">
        <div className="stats">
          {[
            { n: "01", v: "11M+", l: "Agent runs orchestrated" },
            { n: "02", v: "<60s", l: "Median resolution time" },
            { n: "03", v: "47", l: "Production deployments" },
            { n: "04", v: "0", l: "Public incidents · 18 mo" },
          ].map((s, i) => (
            <div className="stat reveal" key={i}>
              <div className="num counting">
                <StatNumber value={s.v} />
              </div>
              <div className="label">
                {s.n} — {s.l}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
