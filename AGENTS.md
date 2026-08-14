# Agent instructions — thronesideassets.com

Next.js (App Router) + Tailwind CSS v4 marketing site for Throneside
Assets, a UK property-deal-sourcing membership business. See
`README.md` for local setup, deployment, and the current TODO list.

## Architecture

- **Marketing pages**: Home, About, Pricing, Contact, FAQ
  (`src/app/*/page.tsx`), shared UI in `src/components/`.
- **Membership billing + login now live in this repo** (moved off GHL):
  Postgres via Drizzle (`src/lib/db.ts`, `src/lib/schema.ts`), Auth.js
  Credentials-based sessions (`src/lib/auth.ts`, `src/lib/auth.config.ts`,
  `middleware.ts` gates `/members/*`), Stripe Checkout + webhook
  (`src/lib/stripe.ts`, `src/app/api/checkout`,
  `src/app/api/webhooks/stripe`) for the Essential plan, and Resend for
  password-reset/invite email (`src/lib/mailer.ts`). New members sign up
  at `/join` → pay → set a password → land on `/members`. See
  `.env.example` for the full list of required env vars.
- **Deal listings** live in the `deals` table (`src/lib/deals.ts`,
  `getDeals`/`getDeal`), with photos hosted on Vercel Blob. Admins (see
  `ADMIN_EMAILS`, `src/lib/admin.ts`) add new listings at
  `/admin/deals/new` (`src/components/NewDealForm.tsx`, which uploads
  photos client-side via `@vercel/blob/client` then posts to
  `/api/admin/deals`).
- **GoHighLevel (GHL)** stays the system of record for CRM, pipelines,
  workflows, and the "book a call" flow (Register buttons →
  `thronesideassets.app.clientclub.net` calendar widget). It is no
  longer used for membership billing or login — the Investor tier
  (no fixed price yet) still routes through GHL/a call until it has
  one.
- The `/contact` page posts to `src/app/api/contact/route.ts`, which
  forwards into GHL's Contacts API via `src/lib/ghl.ts` (needs
  `GHL_API_KEY` / `GHL_LOCATION_ID` in `.env.local`, see
  `.env.example`). Keep CRM/pipeline logic in GHL — don't reimplement
  that part locally.

## Design system

Dark "ledger" theme defined in `src/app/globals.css` as CSS custom
properties (`--ink`, `--paper`, `--brass`, `--ledger-green`, etc.),
exposed to Tailwind via `@theme inline`. Fonts: Fraunces (`font-display`,
headings), Work Sans (body), IBM Plex Mono (`.ledger-figure`, used for
stats/figures with tabular numerals). Reuse these tokens and existing
component patterns (bordered stat strips, numbered process lists,
pill buttons) rather than introducing new colors or one-off styles.

## Commands

```bash
npm run dev      # local dev server
npm run build    # production build, also type-checks
npm run lint      # eslint
```

## Conventions

- Don't invent real business facts (pricing, FAQ answers, deal data,
  testimonials) — flag what's missing and ask, rather than publishing
  placeholder content as if it were real.
- Billing/auth is now real, user-facing infrastructure (Postgres +
  Stripe + email) — treat schema changes, webhook logic, and password/
  token handling with the same care as production financial code, not
  as marketing-site copy edits.
- Keep GHL as the source of truth for CRM/pipelines/workflows only.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
