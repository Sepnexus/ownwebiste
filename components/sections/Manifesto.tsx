"use client";

import { Fragment, useMemo, useRef } from "react";
import { usePinProgress, clamp } from "@/lib/hooks/scroll";

export default function Manifesto() {
  const containerRef = useRef<HTMLElement>(null);
  const p = usePinProgress(containerRef);

  const text =
    "Most leads go cold waiting for a reply. Most deals stall in a spreadsheet. We build agents that answer, qualify, comp and report — around the clock, inside the tools you already use. Less busywork. More ※closed※ ※deals※.";
  const words = useMemo(() => text.split(" "), []);
  const litCount = Math.floor(clamp((p - 0.05) / 0.8, 0, 1) * words.length);

  return (
    <section className="manifesto" ref={containerRef}>
      <div className="manifesto-pin">
        <div className="manifesto-corner">Manifesto / 01</div>
        <div className="manifesto-progress" style={{ ["--p" as string]: `${p * 100}%` }} />
        <p className="manifesto-text">
          {words.map((w, i) => {
            const isAccent = w.startsWith("※");
            const display = isAccent ? w.replaceAll("※", "") : w;
            return (
              <Fragment key={i}>
                <span className={`word ${i < litCount ? "lit" : ""}`}>
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
