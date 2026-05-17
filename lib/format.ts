/**
 * Currency formatting helpers used across the app. Plans store the major-unit
 * amount (e.g. priceMonthlyUsd = 35 means 35 in the plan's own currency).
 * Invoices store amount_cents in the smallest unit.
 *
 * Formatting goes through Intl.NumberFormat, which knows the correct symbol
 * and decimal rules for every ISO currency Razorpay supports — so EUR renders
 * as "€", JPY as "¥" with no decimals, KWD with three, etc.
 */
import { currencyDecimals } from "./currencies";

/** Bare symbol for a currency, e.g. "USD" → "$", "EUR" → "€". */
export function currencySymbol(currency: string): string {
  try {
    const parts = new Intl.NumberFormat("en", {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
    }).formatToParts(0);
    return parts.find((p) => p.type === "currency")?.value ?? currency + " ";
  } catch {
    return currency + " ";
  }
}

/** Format a major-unit price with the right symbol. e.g. (99, "USD") → "$99" */
export function formatPrice(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currencySymbol(currency)}${amount.toLocaleString()}`;
  }
}

/**
 * Format a smallest-unit amount into a human string. e.g. (3500, "USD") →
 * "$35.00", (1000, "JPY") → "¥1,000". Respects each currency's decimal count.
 */
export function formatMoneyCents(minor: number, currency: string): string {
  const decimals = currencyDecimals(currency);
  const major = minor / 10 ** decimals;
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
    }).format(major);
  } catch {
    return `${currencySymbol(currency)}${major.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;
  }
}

export function periodSuffix(period: string, currency: string): string {
  const unit = period === "monthly" ? "month" : period === "yearly" ? "year" : period;
  return `/ ${unit} · ${currency}`;
}
