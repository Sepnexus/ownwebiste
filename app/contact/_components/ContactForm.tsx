"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

const TYPES = [
  { value: "contact", label: "General inquiry" },
  { value: "request_access", label: "Request dashboard access" },
  { value: "project_inquiry", label: "Custom project quote" },
  { value: "support", label: "Existing customer — support" },
];

export default function ContactForm() {
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);
  const [type, setType] = useState("contact");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = searchParams.get("type");
    if (t && TYPES.some((x) => x.value === t)) setType(t);
  }, [searchParams]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);

    const formEl = e.currentTarget;
    const data = new FormData(formEl);
    const payload = {
      type: String(data.get("type") ?? "contact"),
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      company: String(data.get("company") ?? "").trim() || null,
      message: String(data.get("message") ?? "").trim(),
      consent: data.get("consent") === "on",
      meta: {
        plan: searchParams.get("plan"),
        period: searchParams.get("period"),
      },
    };

    try {
      const r = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!r.ok) {
        const body = (await r.json().catch(() => ({}))) as { error?: string };
        setError(body.error ?? "Something went wrong. Please try again.");
        return;
      }
      setDone(true);
      formEl.reset();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div
        className="reveal in"
        style={{
          padding: "32px",
          border: "1px solid var(--line)",
          borderRadius: 18,
          background: "rgba(255,255,255,0.6)",
          maxWidth: 640,
        }}
      >
        <h3
          style={{
            fontFamily: "var(--serif)",
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: 32,
            margin: "0 0 8px",
            color: "var(--ink)",
          }}
        >
          Thank you.
        </h3>
        <p style={{ color: "var(--muted)", margin: "0 0 16px", lineHeight: 1.6 }}>
          We received your message. If a fit, we&apos;ll be back within 48 hours from
          akshay@sepnexus.com.
        </p>
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => setDone(false)}
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} className="contact-form reveal" onSubmit={onSubmit}>
      <label>
        I&apos;m here to
        <select
          name="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
        >
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </label>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
          gap: 18,
        }}
      >
        <label>
          Your name
          <input name="name" type="text" required autoComplete="name" />
        </label>
        <label>
          Email
          <input name="email" type="email" required autoComplete="email" />
        </label>
      </div>
      <label>
        Company (optional)
        <input name="company" type="text" autoComplete="organization" />
      </label>
      <label>
        What are you trying to solve?
        <textarea
          name="message"
          required
          minLength={10}
          placeholder="The loop you want closed, the bottleneck you want gone, or the project scope."
        />
      </label>
      <label className="check-row">
        <input type="checkbox" name="consent" required />
        <span>
          I consent to Sepnexus storing the information I submit so they can respond. We don&apos;t
          share it with anyone else. (Required.)
        </span>
      </label>
      {error && <p className="form-msg error">{error}</p>}
      <div>
        <button type="submit" className="btn btn-solid" disabled={submitting}>
          {submitting ? "Sending…" : "Send"}
          <svg className="arrow" viewBox="0 0 14 14" fill="none">
            <path
              d="M3 11L11 3M11 3H4M11 3V10"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </form>
  );
}
