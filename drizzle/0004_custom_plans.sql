ALTER TABLE "pricing_plans" ADD COLUMN "custom_for_user_id" uuid;--> statement-breakpoint
CREATE INDEX "pricing_plans_custom_for_idx" ON "pricing_plans" USING btree ("custom_for_user_id");