"use client";

import { useEffect, useRef, type ReactNode } from "react";

const _bus = { listeners: new Set<() => void>(), queued: false };
function _flush() {
  _bus.queued = false;
  _bus.listeners.forEach((fn) => fn());
}
function _onScrollGlobal() {
  if (_bus.queued) return;
  _bus.queued = true;
  requestAnimationFrame(_flush);
}
if (typeof window !== "undefined") {
  window.addEventListener("scroll", _onScrollGlobal, { passive: true });
  window.addEventListener("resize", _onScrollGlobal);
}

export function subscribeScroll(fn: () => void): () => void {
  _bus.listeners.add(fn);
  fn();
  return () => {
    _bus.listeners.delete(fn);
  };
}

export function useReveal(rootRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root: ParentNode = rootRef.current ?? document;
    const els = root.querySelectorAll(".reveal, .reveal-line");
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
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [rootRef]);
}

/** 0 → 1 as the element travels from entering the bottom of the viewport to leaving the top. */
export function scrollProgress(rect: DOMRect, vh: number): number {
  return Math.max(0, Math.min(1, (vh - rect.top) / (rect.height + vh)));
}

/** 0 → 1 while a tall container scrolls past a sticky (pinned) child. */
export function pinProgress(rect: DOMRect, vh: number): number {
  const scrollable = rect.height - vh;
  if (scrollable <= 0) return rect.top < 0 ? 1 : 0;
  return Math.max(0, Math.min(1, -rect.top / scrollable));
}

/**
 * Calls `onProgress` once per animation frame while scrolling, whenever the
 * (quantised) progress changes. It does not use React state: callers write
 * styles through refs, so scrolling never re-renders the component tree.
 */
export function useScrollEffect(
  ref: React.RefObject<HTMLElement | null>,
  measure: (rect: DOMRect, vh: number) => number,
  onProgress: (p: number) => void,
) {
  const cb = useRef(onProgress);
  const measureRef = useRef(measure);
  useEffect(() => {
    cb.current = onProgress;
    measureRef.current = measure;
  });
  useEffect(() => {
    if (!ref.current) return;
    let last = -1;
    return subscribeScroll(() => {
      const el = ref.current;
      if (!el) return;
      const v = measureRef.current(el.getBoundingClientRect(), window.innerHeight);
      const q = Math.round(v * 250) / 250;
      if (q !== last) {
        last = q;
        cb.current(q);
      }
    });
  }, [ref]);
}

/** True when the visitor asked their OS for reduced motion. Safe to call in effects/handlers only. */
export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));

export function RL({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const cls = `reveal-line ${className} ${delay ? "d" + delay : ""}`.trim();
  return (
    <span className={cls}>
      <span>{children}</span>
    </span>
  );
}
