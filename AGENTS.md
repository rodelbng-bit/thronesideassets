# Agent instructions — thronesideassets.com

Next.js (App Router) + Tailwind CSS v4 marketing site for Throneside
Assets, a UK property-deal-sourcing membership business. See
`README.md` for local setup, deployment, and the current TODO list.

## Architecture

- **This repo**: marketing pages only — Home, About, Pricing, Contact,
  FAQ (`src/app/*/page.tsx`), shared UI in `src/components/`.
- **GoHighLevel (GHL)**, unchanged and out of scope for this repo:
  membership billing (Stripe), CRM, pipelines, workflows, member login
  at `thronesideassets.app.clientclub.net`.
- The `/contact` page posts to `src/app/api/contact/route.ts`, which
  forwards into GHL's Contacts API via `src/lib/ghl.ts` (needs
  `GHL_API_KEY` / `GHL_LOCATION_ID` in `.env.local`, see
  `.env.example`). Don't reimplement CRM/billing logic locally — GHL
  stays the system of record.

## Design system

Dark "ledger" theme defined in `src/app/globals.css` as CSS custom
properties (`--ink`, `--paper`, `--brass`, `--ledger-green`, etc.),
exposed to Tailwind via `@theme inline`. Fonts: Fraunces (`font-display`,
headings), Inter (body), IBM Plex Mono (`.ledger-figure`, used for
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
- Keep GHL as the source of truth for billing/CRM; this repo is
  frontend only.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
