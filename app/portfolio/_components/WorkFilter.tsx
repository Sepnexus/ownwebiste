"use client";

import { useState } from "react";

type Cat = "re" | "crm" | "ai" | "apps";
type FilterId = "all" | Cat;

type Project = {
  title: string;
  meta: string;
  desc: string;
  tags: string[];
  cats: Cat[];
  /** "client" = a real client system (light card); "build" = an agent/tool described generically (dark card). */
  kind: "client" | "build";
};

// The PROJECTS array from the design's Work.dc.html, unchanged.
const PROJECTS: Project[] = [
  { title: "AI-Powered CRM Automation for Multi-Client Operations", meta: "Confidential · 2026", desc: "Leads, booking, follow-ups, engagement and operations — automated across many client accounts.", tags: ["GoHighLevel", "n8n", "AI workflows"], cats: ["crm", "ai"], kind: "client" },
  { title: "AI Call Notes & CRM Sync", meta: "Confidential · 2025", desc: "Transcribes every call, writes a structured summary, pulls out action items and syncs it to the CRM.", tags: ["Transcription", "Summaries", "CRM"], cats: ["crm", "ai"], kind: "client" },
  { title: "HubSpot & CRM Middleware", meta: "Confidential · 2025", desc: "Two-way sync between HubSpot and internal CRM platforms, so every team works from one record.", tags: ["HubSpot", "APIs", "Middleware"], cats: ["crm"], kind: "client" },
  { title: "Multi-Tenant SaaS Platform", meta: "Confidential · 2026", desc: "Role-based access, operational dashboards, subscriptions and tenant management, architected to scale.", tags: ["SaaS", "Multi-tenant", "Subscriptions"], cats: ["apps"], kind: "client" },
  { title: "Analytics & KPI Reporting Ecosystem", meta: "Confidential · 2025", desc: "Automated reporting for customer success, operations leadership and revenue across client accounts.", tags: ["Analytics", "Dashboards", "KPIs"], cats: ["apps"], kind: "client" },
  { title: "Agents that use the web for you", meta: "Browser agents", desc: "They log into portals, fill forms and pull data from sites that have no API.", tags: ["Browser automation", "AI"], cats: ["ai", "crm"], kind: "build" },
  { title: "A conversational AI assistant", meta: "AI assistant", desc: "Answers questions, books meetings and follows up — in chat or on the phone.", tags: ["Claude", "OpenAI", "Voice"], cats: ["ai"], kind: "build" },
  { title: "Campaign messaging hub", meta: "Messaging", desc: "Run outreach, read every reply in one inbox, and let AI flag who’s ready to talk.", tags: ["Campaigns", "AI sorting"], cats: ["re", "crm", "ai"], kind: "build" },
  { title: "Comping & offer engine", meta: "Comps & offers", desc: "Comps, ARV and repair estimates turned into offer numbers on one screen.", tags: ["Comps & ARV", "Offer calculators"], cats: ["re", "apps"], kind: "build" },
  { title: "Investor KPI dashboard", meta: "Dashboards", desc: "Leads, offers, contracts and revenue — the whole business in one view.", tags: ["KPIs", "Reporting"], cats: ["re", "apps"], kind: "build" },
  { title: "Partner & hiring portals", meta: "Portals", desc: "Private portals for partners, buyers and new hires, with the right access for each.", tags: ["Next.js", "Supabase"], cats: ["re", "apps"], kind: "build" },
];

const FILTERS: [FilterId, string][] = [
  ["all", "All"],
  ["re", "Real estate"],
  ["crm", "CRM & automation"],
  ["ai", "AI & voice"],
  ["apps", "Dashboards & apps"],
];

/** The design's "All work" header, filter pills and bento grid. */
export default function WorkFilter() {
  const [current, setCurrent] = useState<FilterId>("all");
  const items = PROJECTS.filter((p) => current === "all" || p.cats.includes(current));

  return (
    <>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "end", justifyContent: "space-between", gap: "24px", marginBottom: "40px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <span className="mono" style={{ color: "#86868b" }}>
            All work
          </span>
          <h2 className="h-l">
            Client systems & builds.
          </h2>
        </div>
        <span className="count-lbl" aria-live="polite">
          Showing {items.length} systems
        </span>
      </div>
      <div className="pills" role="group" aria-label="Filter work" style={{ marginBottom: "40px" }}>
        {FILTERS.map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={id === current ? "pill on" : "pill"}
            aria-pressed={id === current}
            onClick={() => setCurrent(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="bento">
        {items.map((item) => (
          <article key={item.title} className={item.kind === "build" ? "card prod s2" : "card s2"}>
            <span className="mono">
              {item.meta}
            </span>
            <h3>
              {item.title}
            </h3>
            <p>
              {item.desc}
            </p>
            <div className="tags">
              {item.tags.map((t) => (
                <span key={t}>
                  {t}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
