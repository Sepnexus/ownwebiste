"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  DoneRing,
  EMAIL_RE,
  FormError,
  Honeypot,
  invalidProps,
} from "@/app/login/_components/formUi";

type Enquiry = "project" | "access";
type Field = "name" | "email" | "message";

// The NEEDS list from the design's Contact.dc.html, unchanged.
const NEEDS = [
  "Estate 360 agents",
  "Follow-up automation",
  "Deal tools",
  "Managed hosting",
  "AI for my business",
  "Web app or portal",
];

/** The switch's two options → the `type` POST /api/contact expects. */
const API_TYPE = { project: "project_inquiry", access: "request_access" } as const;

const MIN_MESSAGE = 10;

/**
 * The form card of Contact.dc.html: Start a project / Request access switch,
 * the fields, the "What do you need?" chips (projects only) and the
 * "Message received." state. Sends to POST /api/contact.
 */
export default function ContactForm({
  initialType = "project",
  queryMeta,
}: {
  initialType?: Enquiry;
  /** Extra context from the link that brought the person here (plan, period…), stored with the message. */
  queryMeta?: Record<string, string>;
}) {
  const errorId = useId();
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const doneHeadingRef = useRef<HTMLHeadingElement>(null);
  const prevSent = useRef(false);
  const [type, setType] = useState<Enquiry>(initialType);
  const [picked, setPicked] = useState<Record<string, boolean>>({});
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invalid, setInvalid] = useState<Field | null>(null);

  const isProject = type === "project";

  // Keep keyboard / screen-reader users in place when the view swaps:
  // sent → the "Message received." heading; "Send another" → the first field.
  useEffect(() => {
    if (prevSent.current === sent) return;
    prevSent.current = sent;
    if (sent) doneHeadingRef.current?.focus();
    else nameRef.current?.focus();
  }, [sent]);

  function fail(message: string, field: Field) {
    setError(message);
    setInvalid(field);
    const refs = { name: nameRef, email: emailRef, message: messageRef };
    refs[field].current?.focus();
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setInvalid(null);

    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const company = String(data.get("company") ?? "").trim();
    const crm = String(data.get("crm") ?? "");
    const message = String(data.get("message") ?? "").trim();

    if (!name) return fail("Enter your name.", "name");
    if (!email) return fail("Enter your work email.", "email");
    if (!EMAIL_RE.test(email)) {
      return fail("That email address doesn't look right. Check it and try again.", "email");
    }
    if (message.length < MIN_MESSAGE) {
      return fail(
        message
          ? `Your message needs at least ${MIN_MESSAGE} characters — add a few more words so we know how to help.`
          : `Add a short message so we know how to help (at least ${MIN_MESSAGE} characters).`,
        "message",
      );
    }

    const meta: Record<string, string | string[]> = { ...queryMeta, crm };
    if (isProject) meta.services = NEEDS.filter((n) => picked[n]);

    setSubmitting(true);
    try {
      const r = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          type: API_TYPE[type],
          name,
          email,
          company: company || null,
          message,
          // Given by sending: the line under the button says what we keep and why.
          consent: true,
          meta,
          website: String(data.get("website") ?? ""),
        }),
      });
      if (!r.ok) {
        const body = (await r.json().catch(() => ({}))) as { error?: string };
        setError(body.error ?? "Something went wrong. Please try again.");
        return;
      }
      setSent(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="done" role="status">
        <DoneRing />
        <h2 ref={doneHeadingRef} tabIndex={-1} className="h-m" style={{ outline: "none" }}>
          Message received.
        </h2>
        <p className="lede" style={{ maxWidth: "360px" }}>
          Thanks — we’ll reply within 48 hours with a next step.
        </p>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            setSent(false);
            setPicked({});
          }}
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    // method="post": a submit before hydration posts instead of putting the
    // person's details in the URL.
    <form
      method="post"
      noValidate
      onSubmit={onSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "22px" }}
    >
      <div className="seg" role="group" aria-label="Enquiry type">
        <button
          type="button"
          className={isProject ? "on" : undefined}
          aria-pressed={isProject}
          onClick={() => setType("project")}
        >
          Start a project
        </button>
        <button
          type="button"
          className={isProject ? undefined : "on"}
          aria-pressed={!isProject}
          onClick={() => setType("access")}
        >
          Request access
        </button>
      </div>
      <div className="row2">
        <div className="field">
          <label htmlFor="c-name">Name</label>
          <input
            ref={nameRef}
            id="c-name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            required
            maxLength={120}
            {...invalidProps(invalid === "name", errorId)}
          />
        </div>
        <div className="field">
          <label htmlFor="c-email">Work email</label>
          <input
            ref={emailRef}
            id="c-email"
            name="email"
            type="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="you@company.com"
            required
            maxLength={254}
            {...invalidProps(invalid === "email", errorId)}
          />
        </div>
      </div>
      <div className="row2">
        <div className="field">
          <label htmlFor="c-co">Company</label>
          <input
            id="c-co"
            name="company"
            type="text"
            autoComplete="organization"
            placeholder="Company name"
            maxLength={160}
          />
        </div>
        <div className="field">
          <label htmlFor="c-crm">Current CRM</label>
          <select id="c-crm" name="crm">
            <option>GoHighLevel</option>
            <option>HubSpot</option>
            <option>Close</option>
            <option>Other</option>
            <option>None yet</option>
          </select>
        </div>
      </div>
      {isProject && (
        <div className="field">
          <span className="flabel" id="need-lbl">
            What do you need?
          </span>
          <div className="chips" role="group" aria-labelledby="need-lbl">
            {NEEDS.map((label) => (
              <button
                key={label}
                type="button"
                className={picked[label] ? "chipbtn on" : "chipbtn"}
                aria-pressed={!!picked[label]}
                onClick={() => setPicked((p) => ({ ...p, [label]: !p[label] }))}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="field">
        <label htmlFor="c-msg">
          {isProject ? "Where do your leads go cold?" : "Which dashboard or tool do you need access to?"}
        </label>
        <textarea
          ref={messageRef}
          id="c-msg"
          name="message"
          placeholder={
            isProject
              ? "Tell us about your pipeline, tools and what’s eating your time."
              : "Your company and the system you use with us."
          }
          required
          minLength={MIN_MESSAGE}
          maxLength={5000}
          {...invalidProps(invalid === "message", errorId)}
        />
      </div>
      <Honeypot />
      {error && <FormError id={errorId}>{error}</FormError>}
      <button type="submit" className="btn btn-full" disabled={submitting}>
        {submitting ? "Sending…" : isProject ? "Send project details" : "Request access"}
      </button>
      <p className="fine">
        We reply within 48 hours. Your details are only used to answer you. By sending, you agree
        to us storing them for that — see our <Link href="/legal/privacy">Privacy policy</Link>.
      </p>
    </form>
  );
}

/**
 * ContactForm with its starting state taken from the URL:
 * `?type=project_inquiry` → Start a project, `?type=request_access` → Request
 * access. `?type=support` (the "Contact support" links on the reset and invite
 * pages) also opens Request access, the closest fit for someone who can't get
 * into their account; the original type is kept in the message's meta.
 * `?plan=` / `?period=` are stored with the message, as before.
 *
 * Uses useSearchParams, so it must sit inside <Suspense>; the page renders a
 * plain <ContactForm /> as the fallback so the card is never empty.
 */
export function ContactFormFromQuery() {
  const sp = useSearchParams();
  const t = sp.get("type");
  const initialType: Enquiry = t === "request_access" || t === "support" ? "access" : "project";

  const queryMeta: Record<string, string> = {};
  for (const key of ["plan", "period"]) {
    const v = sp.get(key);
    if (v) queryMeta[key] = v;
  }
  if (t && t !== "project_inquiry" && t !== "request_access") queryMeta.requestedType = t;

  return <ContactForm key={initialType} initialType={initialType} queryMeta={queryMeta} />;
}
