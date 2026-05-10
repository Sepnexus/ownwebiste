<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version (Next 16.x) has breaking changes — APIs, conventions, and file structure may all
differ from your training data. Notable points to remember:

- `cookies()` and `headers()` from `next/headers` are async — `await cookies()`.
- `proxy.ts` at the project root replaces `middleware.ts` (export `proxy()` not `middleware()`).
- `params` and `searchParams` in pages are async (`Promise`) — `const { id } = await params`.
- `useSearchParams()` in client components must be wrapped in `<Suspense>` to avoid bailing
  out from prerendering.
- Use `import "./globals.css"` once in `app/layout.tsx`. Other `import "*.css"` go in client
  components only.

When in doubt, read the relevant guide in `node_modules/next/dist/docs/`.
<!-- END:nextjs-agent-rules -->

## Project conventions

- TypeScript strict mode. No `any` unless commented why.
- Drizzle ORM with `node-postgres`. Schema in `lib/db/schema.ts`.
- Auth: scrypt-hashed passwords, JWT in HttpOnly cookies (`lib/auth.ts`).
- Email: Resend via `lib/email.ts`. Falls back to console log if not configured.
- Server Actions inline with `"use server"` for mutations from forms.
- API routes (`app/api/.../route.ts`) only when an external client (n8n, Razorpay
  webhook, browser fetch) needs them.
