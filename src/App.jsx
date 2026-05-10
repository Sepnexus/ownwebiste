import { useEffect, useRef } from "react";
import { useReveal, subscribeScroll } from "./hooks/scroll.jsx";
import Nav from "./components/Nav.jsx";
import Hero from "./components/Hero.jsx";
import Manifesto from "./components/Manifesto.jsx";
import Services from "./components/Services.jsx";
import AgentNet from "./components/AgentNet.jsx";
import ProcessSection from "./components/ProcessSection.jsx";
import Hosting from "./components/Hosting.jsx";
import Stats from "./components/Stats.jsx";
import CTA from "./components/CTA.jsx";
import Footer from "./components/Footer.jsx";

export default function App() {
  const rootRef = useRef(null);
  useReveal(rootRef);

  useEffect(() => {
    document.documentElement.classList.add("intro-locked");
    const t = setTimeout(() => {
      const i = document.getElementById("intro");
      if (i) i.classList.add("gone");
      document.documentElement.classList.remove("intro-locked");
    }, 1700);
    const t2 = setTimeout(() => {
      const i = document.getElementById("intro");
      if (i) i.style.display = "none";
    }, 3000);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const c = document.getElementById("syscursor");
    if (!c) return;
    let x = innerWidth / 2, y = innerHeight / 2;
    let cx = x, cy = y;
    let raf;
    const onMove = (e) => { x = e.clientX; y = e.clientY; };
    const tick = () => {
      cx += (x - cx) * 0.22; cy += (y - cy) * 0.22;
      c.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };
    addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(tick);

    const setMode = (m) => c.setAttribute("data-mode", m);
    const handlers = [];
    const bind = (sel, mode) => {
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
      bind(".process-card", "stage");
      bind(".terminal", "code");
      bind(".hero-mark-wrap", "spin");
    }, 1900);

    return () => {
      removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      clearTimeout(bindTimer);
      handlers.forEach((fn) => fn());
    };
  }, []);

  useEffect(() => {
    const el = document.getElementById("side-progress");
    if (!el) return;
    return subscribeScroll(() => {
      const max = document.documentElement.scrollHeight - innerHeight;
      const p = max > 0 ? scrollY / max : 0;
      el.style.setProperty("--p", `${Math.max(0, Math.min(1, p)) * 100}%`);
    });
  }, []);

  return (
    <div ref={rootRef}>
      <Nav />
      <Hero />
      <Manifesto />
      <Services />
      <AgentNet />
      <ProcessSection />
      <Hosting />
      <Stats />
      <CTA />
      <Footer />
    </div>
  );
}
