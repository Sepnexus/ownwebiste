# Sepnexus

Public marketing site, customer dashboard and admin panel for Sepnexus.com.
Deploys to a single VPS alongside the existing Traefik / Postgres / n8n stack.

## Stack

- **Next.js 16** (App Router, server components, server actions)
- **TypeScript 5** (strict)
- **Postgres** via Drizzle ORM (shared with `webhook-buffer` on the same VPS)
- **Resend** for transactional email
- **Razorpay** for USD subscriptions (Phase 4)
- **Docker + Traefik** for deploy + auto-SSL

## Quickstart

```bash
npm install
cp .env.example .env.local
# fill in values, see DEPLOY.md "Local dev" for a quick Postgres
npm run db:push      # create tables
npm run dev          # http://localhost:3000
```

## Deploy

See [DEPLOY.md](./DEPLOY.md). Same pattern as `webhook-buffer`: clone, configure
`.env`, `docker compose up -d --build`. Traefik labels handle routing + SSL.

## Branches

- `main` — currently the static Vite site (live at `sepnexus.srv844822.hstgr.cloud`).
- `next-rebuild` — Next.js + DB rebuild. Replaces `main` once verified.
