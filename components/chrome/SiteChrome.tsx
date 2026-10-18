"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Reveal-on-scroll for the old cream pages (dashboard, admin, checkout), which
 * mark blocks with `.reveal` / `.reveal-line`. The new design pages animate in
 * pure CSS (scroll-driven `.rv`, `.zoom`, `.ft`…) and don't use this.
 */
export default function SiteChrome() {
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    // Wait a beat so server-rendered + hydrated DOM is in place.
    const t = setTimeout(() => {
      if (cancelled) return;
      const els = document.querySelectorAll<HTMLElement>(".legacy .reveal, .legacy .reveal-line");
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
      // Anything already on screen at first paint is marked visible immediately.
      els.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.95 && r.bottom > 0) el.classList.add("in");
        else io.observe(el);
      });
      (window as Window & { __snReveal?: IntersectionObserver }).__snReveal?.disconnect();
      (window as Window & { __snReveal?: IntersectionObserver }).__snReveal = io;
    }, 30);

    return () => {
      cancelled = true;
      clearTimeout(t);
      (window as Window & { __snReveal?: IntersectionObserver }).__snReveal?.disconnect();
    };
  }, [pathname]);

  return null;
}
