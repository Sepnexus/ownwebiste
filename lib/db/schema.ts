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
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("pricing_plans_slug_uniq").on(t.slug),
    index("pricing_plans_category_idx").on(t.category, t.sortOrder),
    index("pricing_plans_visible_idx").on(t.visible),
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

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Contact = typeof contacts.$inferSelect;
export type NewContact = typeof contacts.$inferInsert;
export type PricingPlan = typeof pricingPlans.$inferSelect;
export type NewPricingPlan = typeof pricingPlans.$inferInsert;
export type PortfolioEntry = typeof portfolioEntries.$inferSelect;
export type NewPortfolioEntry = typeof portfolioEntries.$inferInsert;
