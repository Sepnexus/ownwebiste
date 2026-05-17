import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { BUSINESS } from "@/lib/business";

/**
 * Atomically allocate the next sequential invoice number for the given calendar year.
 *
 * Postgres `INSERT … ON CONFLICT DO UPDATE … RETURNING` is fully atomic and
 * lock-free under concurrency, so two simultaneous webhook hits can never
 * produce the same number. The counter row is one per year; it starts at 1 on
 * first call of the year and increments monotonically.
 *
 * Format: SEP-YYYY-NNNN  (e.g. SEP-2026-0001)
 */
export async function allocateInvoiceNumber(year?: number): Promise<string> {
  const y = year ?? new Date().getFullYear();
  const result = await db.execute(sql`
    INSERT INTO invoice_counters (year, last_seq, updated_at)
    VALUES (${y}, 1, NOW())
    ON CONFLICT (year) DO UPDATE
      SET last_seq = invoice_counters.last_seq + 1,
          updated_at = NOW()
    RETURNING last_seq
  `);
  const rows = (result as unknown as { rows: Array<{ last_seq: number }> }).rows;
  const seq = rows[0]?.last_seq;
  if (!seq) throw new Error("Failed to allocate invoice number");
  return `${BUSINESS.invoicePrefix}-${y}-${String(seq).padStart(4, "0")}`;
}
