import {
  pgTable,
  uuid,
  text,
  jsonb,
  integer,
  boolean,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/**
 * users — admin + customer accounts. Single table, role-based.
 * Phase 1 only writes the admin row (seeded). Phase 2 adds invite-based customer signup.
 */
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    passwordHash: text("password_hash"),
    name: text("name"),
    role: text("role").notNull().default("customer"),
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
    invitedAt: timestamp("invited_at", { withTimezone: true }),
    invitedByUserId: uuid("invited_by_user_id"),
    inviteAcceptedAt: timestamp("invite_accepted_at", { withTimezone: true }),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    // 2FA (TOTP)
    totpSecret: text("totp_secret"),
    totpEnabled: boolean("totp_enabled").notNull().default(false),
    totpEnabledAt: timestamp("totp_enabled_at", { withTimezone: true }),
    totpRecoveryCodes: jsonb("totp_recovery_codes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("users_email_uniq").on(t.email),
    index("users_role_idx").on(t.role),
  ],
);

/**
 * contacts — public contact-form submissions and "request access" inquiries.
 * Visible in admin panel (Phase 2).
 */
export const contacts = pgTable(
  "contacts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    type: text("type").notNull().default("contact"),
    name: text("name").notNull(),
    email: text("email").notNull(),
    company: text("company"),
    message: text("message").notNull(),
    metadata: jsonb("metadata"),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    consent: boolean("consent").notNull().default(false),
    handledAt: timestamp("handled_at", { withTimezone: true }),
    handledByUserId: uuid("handled_by_user_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("contacts_type_idx").on(t.type),
    index("contacts_created_idx").on(t.createdAt),
    index("contacts_handled_idx").on(t.handledAt),
  ],
);

/**
 * pricing_plans — admin-editable subscription products. Phase 3 enables CRUD.
 * Seed defaults loaded on first boot (lib/seed.ts).
 */
export const pricingPlans = pgTable(
  "pricing_plans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    category: text("category").notNull(),
    name: text("name").notNull(),
    tagline: text("tagline"),
    priceMonthlyUsd: integer("price_monthly_usd").notNull(),
    priceYearlyUsd: integer("price_yearly_usd").notNull(),
    executionsIncluded: integer("executions_included"),
    overageUsdPer1k: integer("overage_usd_per_1k"),
    features: jsonb("features").notNull().default([]),
    highlight: boolean("highlight").notNull().default(false),
    razorpayPlanIdMonthly: text("razorpay_plan_id_monthly"),
    razorpayPlanIdYearly: text("razorpay_plan_id_yearly"),
    sortOrder: integer("sort_order").notNull().default(0),
    visible: boolean("visible").notNull().default(true),
    /** ISO 4217 — 'USD' or 'INR'. Razorpay plan + checkout currency. */
    currency: text("currency").notNull().default("USD"),
    /**
     * If set, this plan is private — only the named user sees it on the
     * public pricing page and in their dashboard. NULL = global plan.
     */
    customForUserId: uuid("custom_for_user_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("pricing_plans_slug_uniq").on(t.slug),
    index("pricing_plans_category_idx").on(t.category, t.sortOrder),
    index("pricing_plans_visible_idx").on(t.visible),
    index("pricing_plans_custom_for_idx").on(t.customForUserId),
  ],
);

/**
 * portfolio_entries — admin-editable case studies. Phase 3 enables CRUD.
 */
export const portfolioEntries = pgTable(
  "portfolio_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    client: text("client"),
    year: integer("year"),
    summary: text("summary"),
    body: text("body"),
    coverImageUrl: text("cover_image_url"),
    tags: jsonb("tags").notNull().default([]),
    metrics: jsonb("metrics").notNull().default([]),
    sortOrder: integer("sort_order").notNull().default(0),
    published: boolean("published").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("portfolio_entries_slug_uniq").on(t.slug),
    index("portfolio_entries_published_idx").on(t.published, t.sortOrder),
  ],
);

/**
 * subscriptions — one row per (customer × Razorpay subscription).
 * Source of truth for status is what comes back from Razorpay webhooks.
 */
export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    planId: uuid("plan_id")
      .notNull()
      .references(() => pricingPlans.id, { onDelete: "restrict" }),
    period: text("period").notNull(), // 'monthly' | 'yearly'

    razorpaySubscriptionId: text("razorpay_subscription_id"),
    razorpayCustomerId: text("razorpay_customer_id"),
    razorpayPlanId: text("razorpay_plan_id"),

    // created | authenticated | active | pending | paused | halted | cancelled | completed | expired
    status: text("status").notNull().default("created"),

    currentPeriodStart: timestamp("current_period_start", { withTimezone: true }),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),

    cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),

    /** Razorpay-hosted Checkout fallback URL (in case the modal SDK fails). */
    shortUrl: text("short_url"),

    metadata: jsonb("metadata"),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("subscriptions_razorpay_uniq").on(t.razorpaySubscriptionId),
    index("subscriptions_user_idx").on(t.userId, t.status),
    index("subscriptions_status_idx").on(t.status),
  ],
);

/**
 * invoices — billing history. One row per Razorpay invoice (per period).
 */
export const invoices = pgTable(
  "invoices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    subscriptionId: uuid("subscription_id")
      .notNull()
      .references(() => subscriptions.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),

    razorpayInvoiceId: text("razorpay_invoice_id"),
    razorpayPaymentId: text("razorpay_payment_id"),
    razorpayOrderId: text("razorpay_order_id"),
    /** Razorpay-hosted invoice page; doubles as the customer-facing PDF download. */
    razorpayShortUrl: text("razorpay_short_url"),

    amountCents: integer("amount_cents").notNull(),
    currency: text("currency").notNull().default("USD"),
    // pending | paid | failed | refunded | partially_refunded
    status: text("status").notNull().default("pending"),

    periodStart: timestamp("period_start", { withTimezone: true }),
    periodEnd: timestamp("period_end", { withTimezone: true }),
    paidAt: timestamp("paid_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("invoices_razorpay_uniq").on(t.razorpayInvoiceId),
    index("invoices_subscription_idx").on(t.subscriptionId, t.createdAt),
    index("invoices_user_idx").on(t.userId, t.createdAt),
  ],
);

/**
 * usage_events — raw record of every metered event we receive
 * (one row per n8n execution, API call, etc.). Used both as an
 * audit log and as the source of truth for the usage counters.
 *
 * Idempotent on (userId, externalId): if the same n8n execution
 * fires the lifecycle webhook twice, we keep only one row.
 */
export const usageEvents = pgTable(
  "usage_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    subscriptionId: uuid("subscription_id").references(() => subscriptions.id, {
      onDelete: "set null",
    }),

    kind: text("kind").notNull().default("execution"),
    source: text("source").notNull(), // 'shared-n8n' | 'dedicated-n8n' | 'manual'
    externalId: text("external_id"), // n8n execution id (for dedupe)

    workflowId: text("workflow_id"),
    workflowName: text("workflow_name"),
    status: text("status"), // success | error | canceled
    durationMs: integer("duration_ms"),

    meta: jsonb("meta"),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("usage_events_external_uniq").on(t.userId, t.externalId),
    index("usage_events_user_time_idx").on(t.userId, t.occurredAt),
    index("usage_events_subscription_idx").on(t.subscriptionId),
  ],
);

/**
 * usage_counters — one row per (user × billing period). Aggregates
 * `executions_used` from `usage_events`. We snapshot the plan limits
 * at period start so mid-period plan edits don't retroactively change
 * overage math. Period-close fields populated by /api/cron/period-close.
 */
export const usageCounters = pgTable(
  "usage_counters",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    subscriptionId: uuid("subscription_id")
      .notNull()
      .references(() => subscriptions.id, { onDelete: "cascade" }),

    periodStart: timestamp("period_start", { withTimezone: true }).notNull(),
    periodEnd: timestamp("period_end", { withTimezone: true }).notNull(),

    executionsUsed: integer("executions_used").notNull().default(0),
    executionsIncluded: integer("executions_included").notNull().default(0),
    overageUsdPer1k: integer("overage_usd_per_1k"),

    warning80SentAt: timestamp("warning_80_sent_at", { withTimezone: true }),
    warning100SentAt: timestamp("warning_100_sent_at", { withTimezone: true }),

    overageUnits: integer("overage_units"),
    overageCents: integer("overage_cents"),
    razorpayAddonId: text("razorpay_addon_id"),
    closedAt: timestamp("closed_at", { withTimezone: true }),

    lastEventAt: timestamp("last_event_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("usage_counters_user_period_uniq").on(t.userId, t.periodStart),
    index("usage_counters_period_end_idx").on(t.periodEnd, t.closedAt),
    index("usage_counters_subscription_idx").on(t.subscriptionId),
  ],
);

/**
 * webhook_events — raw audit log of every webhook we received.
 * Acts as both a replay buffer and an idempotency check.
 */
export const webhookEvents = pgTable(
  "webhook_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    source: text("source").notNull(), // 'razorpay'
    eventType: text("event_type").notNull(),
    razorpayEventId: text("razorpay_event_id"),
    payload: jsonb("payload").notNull(),
    signature: text("signature"),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    error: text("error"),
    receivedAt: timestamp("received_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("webhook_events_razorpay_uniq").on(t.razorpayEventId),
    index("webhook_events_received_idx").on(t.receivedAt),
    index("webhook_events_type_idx").on(t.eventType),
  ],
);

/**
 * audit_logs — append-only record of consequential admin actions.
 * Useful both for compliance ("who changed plan X on date Y") and for
 * debugging ("why did this customer get charged twice").
 */
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorUserId: uuid("actor_user_id"),
    actorEmail: text("actor_email"),
    action: text("action").notNull(),
    targetType: text("target_type"),
    targetId: text("target_id"),
    details: jsonb("details"),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("audit_logs_actor_idx").on(t.actorUserId, t.createdAt),
    index("audit_logs_action_idx").on(t.action, t.createdAt),
    index("audit_logs_target_idx").on(t.targetType, t.targetId),
    index("audit_logs_created_idx").on(t.createdAt),
  ],
);

/**
 * email_verifications — short-lived OTP codes used to verify a visitor's
 * email before they can complete public checkout. The code itself is stored
 * as a sha256 hash so a DB leak doesn't expose live codes; we also track
 * attempts to thwart brute force.
 */
export const emailVerifications = pgTable(
  "email_verifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    codeHash: text("code_hash").notNull(),
    purpose: text("purpose").notNull().default("checkout"),
    attemptsRemaining: integer("attempts_remaining").notNull().default(5),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    consumedAt: timestamp("consumed_at", { withTimezone: true }),
    ipAddress: text("ip_address"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("email_verifications_email_idx").on(t.email, t.createdAt),
    index("email_verifications_expires_idx").on(t.expiresAt),
  ],
);

/**
 * auth_tokens — single-use tokens for invite acceptance and password reset.
 * Token is stored as a sha256 hash so a DB leak doesn't expose live tokens.
 */
export const authTokens = pgTable(
  "auth_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("auth_tokens_hash_uniq").on(t.tokenHash),
    index("auth_tokens_user_kind_idx").on(t.userId, t.kind),
  ],
);

export type AuthToken = typeof authTokens.$inferSelect;
export type NewAuthToken = typeof authTokens.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
export type WebhookEvent = typeof webhookEvents.$inferSelect;
export type NewWebhookEvent = typeof webhookEvents.$inferInsert;
export type UsageEvent = typeof usageEvents.$inferSelect;
export type NewUsageEvent = typeof usageEvents.$inferInsert;
export type UsageCounter = typeof usageCounters.$inferSelect;
export type NewUsageCounter = typeof usageCounters.$inferInsert;
export type EmailVerification = typeof emailVerifications.$inferSelect;
export type NewEmailVerification = typeof emailVerifications.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Contact = typeof contacts.$inferSelect;
export type NewContact = typeof contacts.$inferInsert;
export type PricingPlan = typeof pricingPlans.$inferSelect;
export type NewPricingPlan = typeof pricingPlans.$inferInsert;
export type PortfolioEntry = typeof portfolioEntries.$inferSelect;
export type NewPortfolioEntry = typeof portfolioEntries.$inferInsert;
