import { db, schema } from "./db";
import { hashPassword } from "./auth";
import { sql } from "drizzle-orm";

export async function seedAdminIfEmpty() {
  await seedAdmin();
  await seedPricingPlansIfEmpty();
  await seedPortfolioIfEmpty();
}

async function seedAdmin() {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.users);
  if (count > 0) return;

  const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "";
  if (!email || !password) {
    console.log("[seed] skipping admin seed: ADMIN_EMAIL/ADMIN_PASSWORD not set");
    return;
  }

  const passwordHash = await hashPassword(password);
  await db.insert(schema.users).values({
    email,
    passwordHash,
    role: "admin",
    name: "Admin",
    emailVerifiedAt: new Date(),
  });
  console.log(`[seed] admin user created: ${email}`);
}

async function seedPricingPlansIfEmpty() {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.pricingPlans);
  if (count > 0) return;

  await db.insert(schema.pricingPlans).values([
    {
      slug: "n8n-starter",
      category: "n8n",
      name: "Starter",
      tagline: "For solo operators getting started with automation.",
      priceMonthlyUsd: 12,
      priceYearlyUsd: 120,
      executionsIncluded: 5_000,
      overageUsdPer1k: 2,
      features: [
        "Account on Sepnexus shared n8n",
        "5,000 executions / month",
        "5 active workflows",
        "Email support",
        "Daily backups",
      ],
      sortOrder: 10,
    },
    {
      slug: "n8n-pro",
      category: "n8n",
      name: "Pro",
      tagline: "For teams running production automations.",
      priceMonthlyUsd: 35,
      priceYearlyUsd: 350,
      executionsIncluded: 25_000,
      overageUsdPer1k: 1,
      features: [
        "Account on Sepnexus shared n8n",
        "25,000 executions / month",
        "25 active workflows",
        "Priority support",
        "Custom domain",
        "Webhook authentication",
      ],
      highlight: true,
      sortOrder: 20,
    },
    {
      slug: "n8n-dedicated",
      category: "n8n",
      name: "Dedicated",
      tagline: "Your own n8n VPS, queue mode, no shared neighbours.",
      priceMonthlyUsd: 99,
      priceYearlyUsd: 990,
      features: [
        "Dedicated VPS, isolated n8n",
        "Queue mode, unlimited workflows",
        "Unlimited executions",
        "99.9% uptime SLA",
        "1:1 onboarding session",
        "Direct Slack channel",
      ],
      sortOrder: 30,
    },
    {
      slug: "saas-launch",
      category: "saas",
      name: "Launch",
      tagline: "Run a single SaaS app on managed infrastructure — your MVP without the ops.",
      priceMonthlyUsd: 39,
      priceYearlyUsd: 390,
      features: [
        "1 SaaS application (any stack)",
        "2 GB RAM · 2 vCPU · 40 GB SSD",
        "Managed Postgres (5 GB)",
        "Auto-deploy from Git",
        "Daily off-host backups",
        "Application monitoring + alerts",
        "Email support, business hours",
      ],
      sortOrder: 10,
    },
    {
      slug: "saas-grow",
      category: "saas",
      name: "Grow",
      tagline: "For SaaS apps with paying customers — staging, scheduled jobs, more headroom.",
      priceMonthlyUsd: 99,
      priceYearlyUsd: 990,
      features: [
        "Up to 3 SaaS applications",
        "8 GB RAM · 4 vCPU · 100 GB SSD",
        "Managed Postgres (25 GB) + Redis",
        "Staging environments + preview deploys",
        "Background workers + scheduled jobs",
        "Cloudflare CDN + DDoS protection",
        "Zero-downtime rolling deploys",
        "Priority support",
      ],
      highlight: true,
      sortOrder: 20,
    },
    {
      slug: "saas-scale",
      category: "saas",
      name: "Scale",
      tagline: "Production SaaS at scale — autoscale, dedicated DB, audit-ready environment.",
      priceMonthlyUsd: 249,
      priceYearlyUsd: 2490,
      features: [
        "Unlimited SaaS applications",
        "Auto-scaling app tier (16+ GB pool)",
        "Dedicated Postgres (100 GB) + Redis",
        "Multi-region failover-ready",
        "SOC 2-aligned environment, audit log",
        "VPC isolation + private networking",
        "Sub-1 hr support response, on-call shared",
        "Quarterly architecture review",
      ],
      sortOrder: 30,
    },
  ]);
  console.log("[seed] pricing plans seeded");
}

async function seedPortfolioIfEmpty() {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.portfolioEntries);
  if (count > 0) return;

  await db.insert(schema.portfolioEntries).values([
    {
      slug: "ai-crm-automation-platform",
      year: 2026,
      title: "AI-Powered CRM Automation System for Multi-Client Operations",
      client: "Confidential",
      summary:
        "Designed and implemented a scalable AI-powered CRM automation ecosystem using GoHighLevel, AI workflows, and custom automation logic to streamline lead handling, appointment booking, follow-ups, customer engagement, and operational workflows across multiple client accounts.",
      body:
        "Built a large-scale automation infrastructure focused on reducing manual operational effort for agencies and SaaS businesses managing multiple client accounts.\n\n" +
        "The system combined GoHighLevel, n8n, AI agents, workflow automations, and custom integrations to automate customer communication, lead qualification, appointment scheduling, reporting, and internal operations.\n\n" +
        "Key responsibilities included:\n" +
        "- Product planning and workflow architecture\n" +
        "- Automation design and implementation\n" +
        "- AI workflow orchestration\n" +
        "- CRM customization\n" +
        "- Multi-client operational scaling\n" +
        "- Error handling and fallback systems\n" +
        "- Reporting and KPI automation\n\n" +
        "The platform supported AI-driven lead qualification, appointment scheduling flows, automated follow-ups, customer tagging logic, workflow routing, internal task creation, and multi-account automation handling.\n\n" +
        "Additional systems were developed for automated reporting delivery, Excel-based report imports, client KPI tracking, operational dashboards, and automated notifications.\n\n" +
        "The project significantly reduced manual effort while improving operational consistency and scalability.",
      tags: ["AI", "automation", "CRM", "GoHighLevel", "SaaS", "workflows", "n8n", "operations"],
      metrics: [
        { label: "Accounts Managed", value: "200+" },
        { label: "Automation Workflows", value: "100+" },
        { label: "Time Saved", value: "20 hrs/week" },
      ],
      sortOrder: 1,
      published: true,
    },
    {
      slug: "ai-note-summarizer-system",
      year: 2026,
      title: "AI Call Note Summarization & CRM Sync System",
      client: "Confidential",
      summary:
        "Developed an AI-powered workflow that transcribes call recordings, generates structured summaries, extracts action items, and syncs notes automatically into CRM systems.",
      body:
        "Created an AI-based call summarization system designed to automate post-call documentation for sales and support teams.\n\n" +
        "The workflow accepts audio recordings or audio URLs, processes the recordings using AI transcription services, generates structured summaries, extracts important discussion points, and updates CRM records automatically.\n\n" +
        "Core features included:\n" +
        "- Audio ingestion workflows\n" +
        "- AI transcription processing\n" +
        "- Structured AI-generated summaries\n" +
        "- Action item extraction\n" +
        "- CRM synchronization\n" +
        "- Automated note posting\n" +
        "- Workflow retries and monitoring\n\n" +
        "The system reduced manual documentation effort while improving consistency and follow-up quality across customer-facing teams. The workflow was designed to handle scalable processing and integrate seamlessly into existing operational systems.",
      tags: ["AI", "summarization", "transcription", "CRM", "automation", "workflows", "support"],
      metrics: [
        { label: "Processing Time Reduced", value: "80%" },
        { label: "Manual Work Reduced", value: "15 hrs/week" },
      ],
      sortOrder: 2,
      published: true,
    },
    {
      slug: "hubspot-crm-middleware-integration",
      year: 2025,
      title: "HubSpot & CRM Middleware Integration System",
      client: "Confidential",
      summary:
        "Designed and implemented a middleware integration system enabling two-way synchronization between HubSpot and internal CRM platforms using advanced automation workflows.",
      body:
        "Developed a complex middleware automation system to synchronize deals, customer data, workflow states, and pipeline updates between HubSpot and internal SaaS platforms.\n\n" +
        "The integration handled:\n" +
        "- Two-way deal synchronization\n" +
        "- Workflow mapping\n" +
        "- Pipeline status syncing\n" +
        "- Custom field synchronization\n" +
        "- Automated retries and validations\n" +
        "- Event-driven updates\n\n" +
        "The solution used n8n automation infrastructure and custom workflow orchestration to manage high-volume operational processing while maintaining reliability and scalability.\n\n" +
        "The project required close collaboration between operations, product, and technical teams to ensure seamless synchronization across multiple systems.",
      tags: ["HubSpot", "integration", "automation", "middleware", "CRM", "workflows", "APIs"],
      metrics: [
        { label: "Workflow Executions", value: "100+" },
        { label: "Sync Accuracy", value: "99%+" },
      ],
      sortOrder: 3,
      published: true,
    },
    {
      slug: "ai-real-estate-lead-qualification",
      year: 2026,
      title: "AI Real Estate Lead Qualification & Calling System",
      client: "Liv Estates",
      summary:
        "Built an AI-powered outbound calling and lead qualification system for real estate businesses capable of handling conversations, qualifying leads, and booking appointments automatically.",
      body:
        "Developed an AI-driven real estate lead qualification system integrating voice AI, automation workflows, and CRM systems.\n\n" +
        "The platform handled automated outbound calls, lead qualification conversations, buyer and seller intent analysis, appointment scheduling, CRM updates, and follow-up workflows.\n\n" +
        "The system combined Retell AI, n8n workflows, and CRM integrations to automate large portions of the lead qualification process. The workflow was designed to improve response times, reduce manual calling effort, and streamline lead management for real estate operations.\n\n" +
        "Special focus was placed on conversational flow quality, fallback handling, and CRM synchronization.",
      tags: ["AI", "voice AI", "real estate", "automation", "CRM", "Retell AI", "lead generation"],
      metrics: [
        { label: "Response Time Improved", value: "70%" },
        { label: "Manual Calling Reduced", value: "60%" },
      ],
      sortOrder: 4,
      published: true,
    },
    {
      slug: "multi-tenant-saas-platform",
      year: 2026,
      title: "Multi-Tenant SaaS Platform Architecture & Operations System",
      client: "Confidential",
      summary:
        "Planned and structured a scalable multi-tenant SaaS architecture with role-based access, operational dashboards, subscription systems, and tenant management capabilities.",
      body:
        "Worked on the planning, architecture, and operational structure for a scalable multi-tenant SaaS platform supporting multiple clients and tenant-level data isolation.\n\n" +
        "Key areas included:\n" +
        "- Tenant-based architecture planning\n" +
        "- Role and permission systems\n" +
        "- Admin panel workflows\n" +
        "- Subscription handling\n" +
        "- Operational dashboards\n" +
        "- Reporting systems\n" +
        "- Customer onboarding flows\n" +
        "- API integration planning\n\n" +
        "The system was designed with scalability and future AI integrations in mind while ensuring operational simplicity for administrators and end users.\n\n" +
        "Special attention was given to tenant isolation, scalable workflows, centralized management, analytics visibility, and operational efficiency.",
      tags: ["SaaS", "multi-tenant", "architecture", "operations", "dashboards", "subscriptions"],
      metrics: [
        { label: "Scalability Support", value: "Multi-tenant" },
        { label: "Admin Efficiency Improved", value: "50%" },
      ],
      sortOrder: 5,
      published: true,
    },
    {
      slug: "analytics-kpi-dashboard-system",
      year: 2025,
      title: "Analytics & KPI Reporting Dashboard Ecosystem",
      client: "Confidential",
      summary:
        "Built automated analytics and KPI reporting systems for customer success, operational leadership, and revenue monitoring across multiple client accounts.",
      body:
        "Designed and implemented reporting dashboards and KPI monitoring systems for operational teams, leadership teams, and customer success departments.\n\n" +
        "The dashboard ecosystem included:\n" +
        "- Revenue tracking dashboards\n" +
        "- Customer success reporting\n" +
        "- Operational KPI monitoring\n" +
        "- Automated monthly reporting\n" +
        "- Cross-platform data consolidation\n" +
        "- Excel and CSV processing workflows\n\n" +
        "The reporting systems automated recurring operational reporting and improved visibility into customer performance and business metrics.\n\n" +
        "Additional automation was implemented for scheduled report delivery, email-based reporting, data imports, automated summaries, and client performance comparisons.\n\n" +
        "The system reduced reporting effort significantly while improving consistency and visibility.",
      tags: ["analytics", "dashboards", "reporting", "KPIs", "automation", "operations"],
      metrics: [
        { label: "Clients Managed", value: "150+" },
        { label: "Reporting Time Reduced", value: "75%" },
      ],
      sortOrder: 6,
      published: true,
    },
  ]);
  console.log("[seed] portfolio entries seeded (6 entries)");
}
