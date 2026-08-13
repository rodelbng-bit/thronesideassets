# Throneside Assets — site

Next.js + Tailwind frontend for thronesideassets.com. Built to be edited
locally with **Claude Code**.

## Architecture

- **This repo**: all marketing pages (Home, About, Pricing, Contact) —
  the part you want to iterate on quickly.
- **GoHighLevel** (unchanged, stays as-is):
  - Membership + Stripe billing → `thronesideassets.app.clientclub.net`
  - CRM, pipelines, and workflows (reservation status flips, pipeline
    notifications, chat widget)
  - The contact form on this site (`/contact`) posts to `/api/contact`,
    which forwards into GHL's Contacts API via `src/lib/ghl.ts` — so your
    existing GHL workflows keep firing exactly like before.

Nothing about your GHL setup needs to change to start using this repo.
Domain DNS only gets switched over once you're happy with the new site.

## Local development

```bash
npm install
cp .env.example .env.local   # fill in GHL_API_KEY and GHL_LOCATION_ID
npm run dev
```

Open http://localhost:3000.

## Getting your GHL API credentials

1. In GHL: **Settings → Business Profile → API Keys → Private Integrations**
   → create a token with **Contacts: write** scope.
2. Copy your **Location ID** from the same Business Profile screen.
3. Put both into `.env.local` (never commit this file).

## Deploying

Recommended: [Vercel](https://vercel.com).

1. Push this repo to GitHub.
2. Import it in Vercel.
3. Add `GHL_API_KEY` and `GHL_LOCATION_ID` as environment variables in the
   Vercel project settings.
4. Vercel gives you a preview URL immediately — check everything there
   before touching DNS.
5. When ready, point `thronesideassets.com`'s DNS at Vercel (Vercel walks
   you through the exact records under Project → Settings → Domains).

## Working with Claude Code

Open this folder in Claude Code (`claude` in the repo root, or via the
desktop app) to make ongoing edits — copy changes, new sections, new
pages, styling tweaks, etc. Each page is a small file under `src/app/`,
and shared UI lives in `src/components/`, so most edits are scoped to
one or two files.

## Still to do

- [ ] Swap the logo/images (currently referencing GHL's CDN — worth
      re-hosting locally in `public/` or via Vercel's asset handling)
- [ ] Write real About Us copy
- [ ] Fill in real pricing tiers on `/pricing` (currently placeholders)
- [ ] Build out a real `/deals` listing (this is the big one — likely
      wants its own data source rather than living in GHL custom code,
      happy to help design that next)
- [ ] Add FAQ page
- [ ] Point DNS once ready
