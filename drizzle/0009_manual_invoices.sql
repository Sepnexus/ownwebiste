CREATE TABLE "manual_invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_number" text NOT NULL,
	"buyer_name" text NOT NULL,
	"buyer_email" text,
	"buyer_address" jsonb,
	"line_items" jsonb NOT NULL,
	"notes" text,
	"currency" text DEFAULT 'USD' NOT NULL,
	"amount_cents" integer NOT NULL,
	"status" text DEFAULT 'unpaid' NOT NULL,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"paid_at" timestamp with time zone,
	"business_snapshot" jsonb,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "manual_invoices" ADD CONSTRAINT "manual_invoices_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "manual_invoices_number_uniq" ON "manual_invoices" USING btree ("invoice_number");--> statement-breakpoint
CREATE INDEX "manual_invoices_status_idx" ON "manual_invoices" USING btree ("status","created_at");