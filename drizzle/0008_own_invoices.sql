CREATE TABLE "invoice_counters" (
	"year" integer PRIMARY KEY NOT NULL,
	"last_seq" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "invoice_number" text;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "billing_snapshot" jsonb;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "business_snapshot" jsonb;--> statement-breakpoint
CREATE UNIQUE INDEX "invoices_number_uniq" ON "invoices" USING btree ("invoice_number");