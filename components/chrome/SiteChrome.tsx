"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { subscribeScroll } from "@/lib/hooks/scroll";

// Routes where people fill in forms or work in the app: keep the plain native cursor.
const APP_ROUTES = ["/dashboard", "/admin", "/login", "/subscribe", "/forgot", "/reset", "/invite"];

export default function SiteChrome() {
  const pathname = usePathname();
  const cursorRef = useRef<HTMLDivElement>(null);
  const sideRef = useRef<HTMLDivElement>(null);

  // Bracket accent around the native cursor — desktop marketing pages only.
  // Positioned 1:1 on mousemove (no easing loop), so it never lags the pointer.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const c = cursorRef.current;
    if (!c) return;
    const isApp = APP_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`));
    if (
      isApp ||
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      c.style.display = "none";
      return;
    }
    c.style.display = "";
    c.style.opacity = "0";

    const onMove = (e: MouseEvent) => {
      c.style.opacity = "1";
      c.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
    };
    const onLeave = () => {
      c.style.opacity = "0";
    };
    addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);

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
    }, 100);

    return () => {
      removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      clearTimeout(bindTimer);
      handlers.forEach((fn) => fn());
      setMode("idle");
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
