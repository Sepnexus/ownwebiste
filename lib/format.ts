/**
 * Currency formatting helpers used across the app. Plans store the major-unit
 * amount (e.g. priceMonthlyUsd = 35 means $35 or ₹35 depending on the plan's
 * currency). Invoices store amount_cents in the smallest unit.
 */

export function currencySymbol(currency: string): string {
  if (currency === "INR") return "₹";
  if (currency === "USD") return "$";
  return currency + " ";
}

/** Format a major-unit price with the right symbol. e.g. (99, "USD") → "$99" */
export function formatPrice(amount: number, currency: string): string {
  return `${currencySymbol(currency)}${amount.toLocaleString()}`;
}

/** Format a smallest-unit amount (cents/paise). e.g. (3500, "USD") → "$35.00" */
export function formatMoneyCents(cents: number, currency: string): string {
  const amount = (cents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${currencySymbol(currency)}${amount}`;
}

export function periodSuffix(period: string, currency: string): string {
  const unit = period === "monthly" ? "month" : period === "yearly" ? "year" : period;
  return `/ ${unit} · ${currency}`;
}
