CREATE TABLE "email_verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"code_hash" text NOT NULL,
	"purpose" text DEFAULT 'checkout' NOT NULL,
	"attempts_remaining" integer DEFAULT 5 NOT NULL,
	"verified_at" timestamp with time zone,
	"expires_at" timestamp with time zone NOT NULL,
	"consumed_at" timestamp with time zone,
	"ip_address" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "razorpay_short_url" text;--> statement-breakpoint
ALTER TABLE "pricing_plans" ADD COLUMN "currency" text DEFAULT 'USD' NOT NULL;--> statement-breakpoint
CREATE INDEX "email_verifications_email_idx" ON "email_verifications" USING btree ("email","created_at");--> statement-breakpoint
CREATE INDEX "email_verifications_expires_idx" ON "email_verifications" USING btree ("expires_at");