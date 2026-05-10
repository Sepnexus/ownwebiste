CREATE TABLE "contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text DEFAULT 'contact' NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"company" text,
	"message" text NOT NULL,
	"metadata" jsonb,
	"ip_address" text,
	"user_agent" text,
	"consent" boolean DEFAULT false NOT NULL,
	"handled_at" timestamp with time zone,
	"handled_by_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portfolio_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"client" text,
	"year" integer,
	"summary" text,
	"body" text,
	"cover_image_url" text,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"metrics" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pricing_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"category" text NOT NULL,
	"name" text NOT NULL,
	"tagline" text,
	"price_monthly_usd" integer NOT NULL,
	"price_yearly_usd" integer NOT NULL,
	"executions_included" integer,
	"overage_usd_per_1k" integer,
	"features" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"highlight" boolean DEFAULT false NOT NULL,
	"razorpay_plan_id_monthly" text,
	"razorpay_plan_id_yearly" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text,
	"name" text,
	"role" text DEFAULT 'customer' NOT NULL,
	"email_verified_at" timestamp with time zone,
	"invited_at" timestamp with time zone,
	"invited_by_user_id" uuid,
	"invite_accepted_at" timestamp with time zone,
	"last_login_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "contacts_type_idx" ON "contacts" USING btree ("type");--> statement-breakpoint
CREATE INDEX "contacts_created_idx" ON "contacts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "contacts_handled_idx" ON "contacts" USING btree ("handled_at");--> statement-breakpoint
CREATE UNIQUE INDEX "portfolio_entries_slug_uniq" ON "portfolio_entries" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "portfolio_entries_published_idx" ON "portfolio_entries" USING btree ("published","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "pricing_plans_slug_uniq" ON "pricing_plans" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "pricing_plans_category_idx" ON "pricing_plans" USING btree ("category","sort_order");--> statement-breakpoint
CREATE INDEX "pricing_plans_visible_idx" ON "pricing_plans" USING btree ("visible");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_uniq" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");