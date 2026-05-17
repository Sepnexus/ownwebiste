"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useScrollProgress } from "@/lib/hooks/scroll";

export default function CTA() {
  const ref = useRef<HTMLElement>(null);
  const p = useScrollProgress(ref);
  const angle = p * 360;
  return (
    <section className="cta" id="access" ref={ref}>
      <div
        className="wash"
        style={{
          width: 600,
          height: 600,
          top: -200,
          left: "10%",
          background: "var(--c-magenta)",
          opacity: 0.18,
        }}
      />
      <div
        className="wash"
        style={{
          width: 700,
          height: 700,
          bottom: -300,
          right: "10%",
          background: "var(--c-cyan)",
          opacity: 0.16,
        }}
      />
      <div
        className="wash"
        style={{
          width: 500,
          height: 500,
          top: "20%",
          left: "40%",
          background: "var(--c-yellow)",
          opacity: 0.14,
        }}
      />

      <div style={{ position: "relative", zIndex: 2 }}>
        <span className="eyebrow reveal">06 — Engage</span>
        <div style={{ marginTop: 18, display: "flex", justifyContent: "center" }}>
          <Image
            src="/assets/sepnexus-mark.png"
            alt=""
            width={84}
            height={84}
            style={{
              transform: `rotate(${angle}deg)`,
              transition: "transform 0.1s linear",
            }}
          />
        </div>
        <h2 className="reveal" style={{ marginTop: 24 }}>
          Let&apos;s build something
          <br />
          that <em>runs itself.</em>
        </h2>
        <p className="lede reveal" style={{ margin: "32px auto 0", textAlign: "center" }}>
          Sepnexus is invitation-only. Tell us about your business — if there&apos;s a fit,
          we&apos;ll get back within 48 hours with a path forward.
        </p>
        <div className="cta-actions reveal">
          <Link href="/contact?type=request_access" className="btn btn-solid">
            Request an invite
            <svg className="arrow" viewBox="0 0 14 14" fill="none">
              <path
                d="M3 11L11 3M11 3H4M11 3V10"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <Link href="/login" className="btn btn-outline">
            Sign in
          </Link>
        </div>
      </div>
    </section>
  );
}
