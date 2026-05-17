"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { subscribeScroll } from "@/lib/hooks/scroll";

export default function SiteChrome() {
  const pathname = usePathname();
  const cursorRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const sideRef = useRef<HTMLDivElement>(null);

  // Intro overlay — runs once per session, only on the homepage.
  useEffect(() => {
    if (pathname !== "/") return;
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("sn_intro_shown")) return;
    sessionStorage.setItem("sn_intro_shown", "1");

    const intro = introRef.current;
    if (!intro) return;
    intro.classList.add("active");
    document.documentElement.classList.add("intro-locked");

    const t = setTimeout(() => {
      intro.classList.add("gone");
      document.documentElement.classList.remove("intro-locked");
    }, 1700);
    const t2 = setTimeout(() => {
      intro.style.display = "none";
    }, 3000);
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
      document.documentElement.classList.remove("intro-locked");
    };
  }, [pathname]);

  // System cursor — desktop only. Re-binds when the route changes.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const c = cursorRef.current;
    if (!c) return;

    let x = innerWidth / 2,
      y = innerHeight / 2;
    let cx = x,
      cy = y;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
    };
    const tick = () => {
      cx += (x - cx) * 0.22;
      cy += (y - cy) * 0.22;
      c.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };
    addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(tick);

    const setMode = (m: string) => c.setAttribute("data-mode", m);
    const handlers: (() => void)[] = [];
    const bind = (sel: string, mode: string) => {
      document.querySelectorAll(sel).forEach((el) => {
        const enter = () => setMode(mode);
        const leave = () => setMode("idle");
        el.addEventListener("mouseenter", enter);
        el.addEventListener("mouseleave", leave);
        handlers.push(() => {
          el.removeEventListener("mouseenter", enter);
          el.removeEventListener("mouseleave", leave);
        });
      });
    };
    const bindTimer = setTimeout(() => {
      bind("a, button, .btn", "click");
      bind(".service-card", "service");
      bind(".terminal", "code");
      bind(".hero-mark-wrap", "spin");
    }, pathname === "/" ? 1900 : 100);

    return () => {
      removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      clearTimeout(bindTimer);
      handlers.forEach((fn) => fn());
    };
  }, [pathname]);

  // Side scroll progress
  useEffect(() => {
    const el = sideRef.current;
    if (!el) return;
    return subscribeScroll(() => {
      const max = document.documentElement.scrollHeight - innerHeight;
      const p = max > 0 ? scrollY / max : 0;
      el.style.setProperty("--p", `${Math.max(0, Math.min(1, p)) * 100}%`);
    });
  }, [pathname]);

  // Reveal-on-scroll for `.reveal` and `.reveal-line` elements anywhere on the page.
  // Re-binds whenever the route changes so client navigations pick up new elements.
  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;
    // Wait one frame so server-rendered + hydrated DOM is in place.
    const t = setTimeout(() => {
      if (cancelled) return;
      const els = document.querySelectorAll<HTMLElement>(".reveal, .reveal-line");
      if (!els.length) return;
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("in");
              io.unobserve(e.target);
            }
          });
        },
        { threshold: 0.18, rootMargin: "0px 0px -10% 0px" },
      );
      // If an element is already on-screen at first paint (above the fold),
      // mark it `.in` immediately rather than waiting for a scroll.
      els.forEach((el) => {
        const r = el.getBoundingClientRect();
        const visible = r.top < window.innerHeight * 0.95 && r.bottom > 0;
        if (visible) el.classList.add("in");
        else io.observe(el);
      });
      // Clean up via a side-channel:
      (window as Window & { __snReveal?: IntersectionObserver }).__snReveal?.disconnect();
      (window as Window & { __snReveal?: IntersectionObserver }).__snReveal = io;
    }, 30);

    return () => {
      cancelled = true;
      clearTimeout(t);
      (window as Window & { __snReveal?: IntersectionObserver }).__snReveal?.disconnect();
    };
  }, [pathname]);

  return (
    <>
      <div className="intro" ref={introRef}>
        <div className="intro-inner">
          <Image
            className="intro-mark"
            src="/assets/sepnexus-mark.png"
            alt="Sepnexus"
            width={120}
            height={120}
            priority
          />
          <div className="intro-word">
            <span>S E P N E X U S</span>
          </div>
          <div className="intro-bar" />
          <div className="intro-loader">Initialising agentic systems</div>
        </div>
      </div>

      <div className="orbs" aria-hidden="true">
        <div className="orb o1" />
        <div className="orb o2" />
        <div className="orb o3" />
        <div className="orb o4" />
      </div>

      <div className="syscursor" ref={cursorRef} data-mode="idle" aria-hidden="true">
        <svg viewBox="0 0 60 60" aria-hidden="true">
          <g
            className="brackets"
            stroke="currentColor"
            fill="none"
            strokeWidth="1.4"
            strokeLinecap="round"
          >
            <path d="M6 14 V6 H14" />
            <path d="M46 6 H54 V14" />
            <path d="M54 46 V54 H46" />
            <path d="M14 54 H6 V46" />
          </g>
          <g
            className="loop"
            stroke="currentColor"
            fill="none"
            strokeWidth="1.2"
            strokeLinecap="round"
          >
            <circle cx="30" cy="30" r="9" />
          </g>
          <g className="dot">
            <circle cx="30" cy="30" r="2.4" fill="currentColor" />
          </g>
          <text
            className="tag"
            x="30"
            y="33"
            textAnchor="middle"
            fill="currentColor"
            fontFamily="ui-monospace,monospace"
            fontSize="6"
            letterSpacing="1.2"
          >
            VIEW
          </text>
        </svg>
      </div>

      <div className="side-progress" ref={sideRef} />
      <div className="grain" />
    </>
  );
}
