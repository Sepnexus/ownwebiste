"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { currencyOptions } from "@/lib/currencies";
import { formatMoneyCents, currencySymbol } from "@/lib/format";

type LineItem = { description: string; quantity: string; unitAmount: string };

const blankItem = (): LineItem => ({
  description: "",
  quantity: "1",
  unitAmount: "",
});

export default function ManualInvoiceForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [addr, setAddr] = useState({
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
  });
  const [currency, setCurrency] = useState("USD");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<LineItem[]>([blankItem()]);

  const options = useMemo(() => currencyOptions(), []);

  // Live total — sum of qty × unit, in major units, formatted in the currency.
  const totalMinor = useMemo(() => {
    return items.reduce((sum, it) => {
      const q = Number(it.quantity) || 0;
      const u = Number(it.unitAmount) || 0;
      // We don't know decimals here; format helper handles display. For the
      // running total, work in major units then ×100-equivalent at render.
      return sum + q * u;
    }, 0);
  }, [items]);

  function setItem(i: number, patch: Partial<LineItem>) {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }
  function addItem() {
    setItems((prev) => [...prev, blankItem()]);
  }
  function removeItem(i: number) {
    setItems((prev) => (prev.length === 1 ? prev : prev.filter((_, idx) => idx !== i)));
  }

  function submit() {
    setError(null);
    if (!buyerName.trim()) {
      setError("Buyer name is required.");
      return;
    }
    const cleanItems = items
      .map((it) => ({
        description: it.description.trim(),
        quantity: Number(it.quantity),
        unitAmount: Number(it.unitAmount),
      }))
      .filter((it) => it.description.length > 0);
    if (cleanItems.length === 0) {
      setError("Add at least one line item with a description.");
      return;
    }
    for (const it of cleanItems) {
      if (!Number.isFinite(it.quantity) || it.quantity <= 0) {
        setError(`Invalid quantity for "${it.description}".`);
        return;
      }
      if (!Number.isFinite(it.unitAmount) || it.unitAmount < 0) {
        setError(`Invalid amount for "${it.description}".`);
        return;
      }
    }

    startTransition(async () => {
      const r = await fetch("/api/admin/invoices/manual", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          buyerName: buyerName.trim(),
          buyerEmail: buyerEmail.trim() || undefined,
          buyerAddress: addr,
          currency,
          notes: notes.trim() || undefined,
          lineItems: cleanItems,
        }),
      });
      const body = (await r.json().catch(() => ({}))) as {
        ok?: boolean;
        id?: string;
        error?: string;
      };
      if (!r.ok || !body.ok || !body.id) {
        setError(body.error ?? "Failed to create invoice.");
        return;
      }
      router.push(`/admin/invoices/manual/${body.id}`);
      router.refresh();
    });
  }

  const sym = currencySymbol(currency);

  return (
    <div style={{ maxWidth: 920 }}>
      {error && (
        <div className="form-error" style={{ marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Buyer */}
      <h2 style={{ marginTop: 8 }}>Bill to</h2>
      <div className="admin-form">
        <label>
          Buyer name *
          <input
            type="text"
            value={buyerName}
            onChange={(e) => setBuyerName(e.target.value)}
            placeholder="Acme Pvt Ltd / John Smith"
          />
        </label>
        <label>
          Buyer email
          <input
            type="email"
            value={buyerEmail}
            onChange={(e) => setBuyerEmail(e.target.value)}
            placeholder="billing@acme.com (optional)"
          />
        </label>
        <div className="grid-2">
          <label>
            Address line 1
            <input
              type="text"
              value={addr.line1}
              onChange={(e) => setAddr({ ...addr, line1: e.target.value })}
            />
          </label>
          <label>
            Address line 2
            <input
              type="text"
              value={addr.line2}
              onChange={(e) => setAddr({ ...addr, line2: e.target.value })}
            />
          </label>
        </div>
        <div className="grid-2">
          <label>
            City
            <input
              type="text"
              value={addr.city}
              onChange={(e) => setAddr({ ...addr, city: e.target.value })}
            />
          </label>
          <label>
            State / Region
            <input
              type="text"
              value={addr.state}
              onChange={(e) => setAddr({ ...addr, state: e.target.value })}
            />
          </label>
        </div>
        <div className="grid-2">
          <label>
            Postal code
            <input
              type="text"
              value={addr.pincode}
              onChange={(e) => setAddr({ ...addr, pincode: e.target.value })}
            />
          </label>
          <label>
            Country
            <input
              type="text"
              value={addr.country}
              onChange={(e) => setAddr({ ...addr, country: e.target.value })}
            />
          </label>
        </div>
      </div>

      {/* Invoice */}
      <h2 style={{ marginTop: 32 }}>Invoice</h2>
      <div className="admin-form">
        <label>
          Currency
          <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
            <optgroup label="Common">
              {options
                .filter((c) => c.pinned)
                .map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
            </optgroup>
            <optgroup label="All Razorpay currencies">
              {options
                .filter((c) => !c.pinned)
                .map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
            </optgroup>
          </select>
        </label>
      </div>

      {/* Line items */}
      <h3 style={{ marginTop: 24, marginBottom: 8 }}>Line items</h3>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Description</th>
            <th style={{ width: 90 }}>Qty</th>
            <th style={{ width: 150 }}>Unit price ({sym})</th>
            <th style={{ width: 130, textAlign: "right" }}>Amount</th>
            <th style={{ width: 56 }}>
              {/* Visually hidden header so the column isn't announced as blank. */}
              <span style={visuallyHidden}>Remove</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => {
            const lineMajor = (Number(it.quantity) || 0) * (Number(it.unitAmount) || 0);
            return (
              <tr key={i}>
                <td>
                  <input
                    type="text"
                    value={it.description}
                    onChange={(e) => setItem(i, { description: e.target.value })}
                    placeholder="Consulting — discovery phase"
                    aria-label={`Description, line ${i + 1}`}
                    style={inputStyle}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    inputMode="decimal"
                    value={it.quantity}
                    onChange={(e) => setItem(i, { quantity: e.target.value })}
                    aria-label={`Quantity, line ${i + 1}`}
                    style={inputStyle}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    inputMode="decimal"
                    value={it.unitAmount}
                    onChange={(e) => setItem(i, { unitAmount: e.target.value })}
                    placeholder="0.00"
                    aria-label={`Unit price (${currency}), line ${i + 1}`}
                    style={inputStyle}
                  />
                </td>
                <td
                  style={{
                    textAlign: "right",
                    fontFamily: "var(--mono)",
                    fontSize: 13,
                  }}
                >
                  {sym}
                  {lineMajor.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td style={{ textAlign: "center" }}>
                  <button
                    type="button"
                    onClick={() => removeItem(i)}
                    disabled={items.length === 1}
                    aria-label={`Remove line ${i + 1}`}
                    title={items.length === 1 ? "An invoice needs at least one line" : "Remove line"}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minWidth: 32,
                      minHeight: 32,
                      padding: 0,
                      border: "none",
                      borderRadius: 8,
                      background: "none",
                      cursor: items.length === 1 ? "not-allowed" : "pointer",
                      color: items.length === 1 ? "var(--line-strong)" : "var(--c-red)",
                      fontSize: 20,
                      lineHeight: 1,
                    }}
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <button
        type="button"
        onClick={addItem}
        className="btn btn-ghost"
        style={{ marginTop: 10, padding: "6px 12px", fontSize: 13 }}
      >
        + Add line item
      </button>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: 16,
          fontSize: 16,
        }}
      >
        <div style={{ minWidth: 260 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontWeight: 600,
              borderTop: "1px solid var(--ink)",
              paddingTop: 8,
            }}
          >
            <span>Total {currency}</span>
            <span style={{ fontFamily: "var(--mono)" }}>
              {sym}
              {totalMinor.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="admin-form" style={{ marginTop: 20 }}>
        <label>
          Notes (optional)
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Payment terms, PO number, thank-you note…"
          />
        </label>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="btn btn-solid"
          style={{ padding: "10px 18px" }}
        >
          {pending ? "Creating…" : "Create invoice"}
        </button>
        <a href="/admin/invoices" className="btn btn-ghost" style={{ padding: "10px 18px" }}>
          Cancel
        </a>
      </div>
      <p style={{ color: "var(--muted)", fontSize: 12, marginTop: 10 }}>
        The invoice is created as <strong>unpaid</strong> with a sequential
        number. You can download the PDF and mark it paid from the next screen.
      </p>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "7px 9px",
  border: "1px solid var(--line)",
  borderRadius: 8,
  fontFamily: "var(--sans)",
  background: "rgba(255,255,255,0.7)",
};

const visuallyHidden: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
};
