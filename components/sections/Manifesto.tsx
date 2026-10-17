"use client";

import { Fragment, useMemo, useRef } from "react";
import { useScrollEffect, pinProgress, clamp } from "@/lib/hooks/scroll";

export default function Manifesto() {
  const containerRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const lit = useRef(0);

  const text =
    "Most leads go cold waiting for a reply. Most deals stall in a spreadsheet. We build agents that answer, qualify, comp and report — around the clock, inside the tools you already use. Less busywork. More ※closed※ ※deals※.";
  const words = useMemo(() => text.split(" "), []);

  // Light words as the section scrolls, by toggling classes directly (no re-render per frame).
  useScrollEffect(containerRef, pinProgress, (p) => {
    progressRef.current?.style.setProperty("--p", `${p * 100}%`);
    const count = Math.floor(clamp((p - 0.05) / 0.8, 0, 1) * words.length);
    if (count === lit.current) return;
    wordRefs.current.forEach((el, i) => el?.classList.toggle("lit", i < count));
    lit.current = count;
  });

  return (
    <section className="manifesto" ref={containerRef}>
      <div className="manifesto-pin">
        <div className="manifesto-corner" aria-hidden="true">Manifesto / 01</div>
        <div className="manifesto-progress" ref={progressRef} aria-hidden="true" />
        <p className="manifesto-text">
          {words.map((w, i) => {
            const isAccent = w.startsWith("※");
            const display = isAccent ? w.replaceAll("※", "") : w;
            return (
              <Fragment key={i}>
                <span
                  className="word"
                  ref={(el) => {
                    wordRefs.current[i] = el;
                  }}
                >
                  {isAccent ? <em className="accent">{display}</em> : display}
                </span>
                {i < words.length - 1 ? " " : ""}
              </Fragment>
            );
          })}
        </p>
      </div>
    </section>
  );
}
