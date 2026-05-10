CREATE TABLE "usage_counters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"subscription_id" uuid NOT NULL,
	"period_start" timestamp with time zone NOT NULL,
	"period_end" timestamp with time zone NOT NULL,
	"executions_used" integer DEFAULT 0 NOT NULL,
	"executions_included" integer DEFAULT 0 NOT NULL,
	"overage_usd_per_1k" integer,
	"warning_80_sent_at" timestamp with time zone,
	"warning_100_sent_at" timestamp with time zone,
	"overage_units" integer,
	"overage_cents" integer,
	"razorpay_addon_id" text,
	"closed_at" timestamp with time zone,
	"last_event_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usage_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"subscription_id" uuid,
	"kind" text DEFAULT 'execution' NOT NULL,
	"source" text NOT NULL,
	"external_id" text,
	"workflow_id" text,
	"workflow_name" text,
	"status" text,
	"duration_ms" integer,
	"meta" jsonb,
	"occurred_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "usage_counters" ADD CONSTRAINT "usage_counters_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_counters" ADD CONSTRAINT "usage_counters_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_events" ADD CONSTRAINT "usage_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_events" ADD CONSTRAINT "usage_events_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "usage_counters_user_period_uniq" ON "usage_counters" USING btree ("user_id","period_start");--> statement-breakpoint
CREATE INDEX "usage_counters_period_end_idx" ON "usage_counters" USING btree ("period_end","closed_at");--> statement-breakpoint
CREATE INDEX "usage_counters_subscription_idx" ON "usage_counters" USING btree ("subscription_id");--> statement-breakpoint
CREATE UNIQUE INDEX "usage_events_external_uniq" ON "usage_events" USING btree ("user_id","external_id");--> statement-breakpoint
CREATE INDEX "usage_events_user_time_idx" ON "usage_events" USING btree ("user_id","occurred_at");--> statement-breakpoint
CREATE INDEX "usage_events_subscription_idx" ON "usage_events" USING btree ("subscription_id");