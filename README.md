# Throneside Assets — site

Next.js + Tailwind frontend for thronesideassets.com. Built to be edited
locally with **Claude Code**.

## Architecture

- **Marketing pages** (Home, About, Pricing, Contact, FAQ) — the part
  you'll iterate on most.
- **Membership + login** now live here instead of GHL: clients pay via
  Stripe Checkout at `/join`, get a native email/password account
  (Postgres + Auth.js), and see their weekly deals at `/members`.
- **GoHighLevel**, still in use for:
  - CRM, pipelines, and workflows (reservation status flips, pipeline
    notifications, chat widget)
  - The "book a call" flow — Register buttons link to a GHL calendar
  - The contact form on this site (`/contact`) posts to `/api/contact`,
    which forwards into GHL's Contacts API via `src/lib/ghl.ts` — so your
    existing GHL workflows keep firing exactly like before.

## Local development

```bash
npm install
cp .env.example .env.local   # fill in every value — see below
npm run db:push              # creates the users / password_reset_tokens tables
npm run dev
```

Open http://localhost:3000.

### Env vars you need to fill in

- `GHL_API_KEY` / `GHL_LOCATION_ID` — GHL → Settings → Business Profile
  → API Keys → Private Integrations (Contacts: write scope).
- `DATABASE_URL` — a Postgres connection string. In Vercel: Storage tab
  → Create Database → Postgres; it's injected automatically once
  connected to the project, or copy it into `.env.local` for local dev.
- `AUTH_SECRET` — generate with `npx auth secret`.
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` — Stripe Dashboard →
  Developers → API keys / Webhooks (point the webhook at
  `/api/webhooks/stripe`, subscribe to `checkout.session.completed`,
  `customer.subscription.updated`, `customer.subscription.deleted`).
- `STRIPE_PRICE_ESSENTIAL_MONTHLY`, `STRIPE_PRICE_ESSENTIAL_ANNUAL` —
  create the Essential plan's two recurring Prices in Stripe and copy
  their IDs (£497/mo and £4,970/yr, per `/pricing`).
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL` — resend.com/api-keys, plus a
  verified sending domain/address — used for password-reset and
  account-setup emails.
- `SITE_URL` — the site's public base URL, used to build links in
  emails.

Never commit `.env.local` or paste real secret values into chat.

## Deploying

Deployed on [Vercel](https://vercel.com), connected to this GitHub repo —
every push to `master` auto-deploys.

1. Add a Postgres database: Vercel project → Storage → Create Database →
   Postgres. It injects `DATABASE_URL` automatically.
2. Add the rest of the env vars listed above under Vercel → Project →
   Settings → Environment Variables.
3. Run `npm run db:push` once (locally, pointed at the production
   `DATABASE_URL`, or via `vercel env pull` first) to create the tables.
4. In Stripe, add a webhook endpoint at
   `https://www.thronesideassets.com/api/webhooks/stripe` subscribed to
   `checkout.session.completed`, `customer.subscription.updated`, and
   `customer.subscription.deleted`; copy its signing secret into
   `STRIPE_WEBHOOK_SECRET`.

## Working with Claude Code

Open this folder in Claude Code (`claude` in the repo root, or via the
desktop app) to make ongoing edits — copy changes, new sections, new
pages, styling tweaks, etc. Each page is a small file under `src/app/`,
and shared UI lives in `src/components/`, so most edits are scoped to
one or two files.

## Still to do

- [ ] Provision the production Postgres database and Stripe/Resend env
      vars in Vercel (see Deploying above) — required before `/join`
      works live.
- [ ] Create the Essential plan's two Stripe Prices (£497/mo, £4,970/yr)
      and set `STRIPE_PRICE_ESSENTIAL_MONTHLY` / `_ANNUAL`.
- [ ] Run `scripts/invite-existing-members.ts` against the real list of
      existing GHL members once it's ready.
- [ ] Build the real `/members` deal content (currently a placeholder —
      see `src/app/members/page.tsx`).
- [ ] Swap the logo/images (currently referencing GHL's CDN — worth
      re-hosting locally in `public/` or via Vercel's asset handling)
- [ ] Write real About Us copy
