# Fx Crypto Edge

Trading signals platform for Forex, Crypto & Gold (XAU/USD) — built for Indian traders.

Monorepo with two apps:

- `apps/web` — Next.js 14 (App Router) frontend, styled to match the client's design prototype.
- `apps/server` — Express + TypeScript API, backed by Postgres (via Drizzle ORM).

## Prerequisites

- Node.js 20+
- Postgres — either Docker, or a local install via Homebrew (see below)

## 1. Install dependencies

```bash
npm install
```

This installs both `apps/web` and `apps/server` via npm workspaces.

## 2. Start Postgres

**Option A — Docker** (if you have Docker Desktop installed):

```bash
npm run db:up
```

Starts a Postgres 16 container (see `docker-compose.yml`) on `localhost:5432` with:

- user: `fxcryptoedge`
- password: `fxcryptoedge`
- database: `fxcryptoedge`

**Option B — Homebrew** (no Docker needed, macOS):

```bash
brew install postgresql@16
brew services start postgresql@16

# postgresql@16 is keg-only, so use its full path for this one-time setup
PG_BIN="$(brew --prefix postgresql@16)/bin"
"$PG_BIN/createuser" -s fxcryptoedge
"$PG_BIN/psql" postgres -c "ALTER USER fxcryptoedge WITH PASSWORD 'fxcryptoedge';"
"$PG_BIN/createdb" -O fxcryptoedge fxcryptoedge
```

This creates the same `fxcryptoedge` user/password/database that `apps/server/.env` already
expects, so no other config changes are needed. To stop Postgres later: `brew services stop postgresql@16`.

## 3. Configure environment variables

```bash
cp apps/server/.env.example apps/server/.env
cp apps/web/.env.local.example apps/web/.env.local
```

The defaults in `apps/server/.env` already match the Docker Postgres credentials above, so
the app works out of the box for local development. Before going live, fill in:

- `JWT_SECRET` — any long random string.
- `GOOGLE_CLIENT_ID` — from the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
  This uses the client-side "Sign in with Google" ID-token flow, so no client secret or redirect
  URI is needed. Also set `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in `apps/web/.env.local` to the same
  client ID.
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` / `RAZORPAY_WEBHOOK_SECRET` — from the
  [Razorpay dashboard](https://dashboard.razorpay.com/app/keys). Until these are set, the
  pricing page still displays correctly but checkout returns a clear "not configured yet" error
  instead of crashing.

Telegram/WhatsApp alert delivery is not wired up yet (per the current scope) — the "Instant
Telegram/WhatsApp alerts" copy on the site is marketing copy only for now.

## 4. Create the database schema and seed data

```bash
npm run db:push     # creates tables from apps/server/src/db/schema.ts
npm run db:seed     # seeds an admin user + sample signals + pricing plans
```

The seed script prints an admin login at the end, e.g.:

```
Admin login: admin@fxcryptoedge.in / ChangeMe123! (change this password!)
```

Log in with that account to reach `/admin` and manage live signals. **Change this password
immediately in a real deployment** (there's no "change password" UI yet — update it directly
in the database, or delete and re-seed).

## 5. Run the apps

In two terminals:

```bash
npm run dev:server   # http://localhost:4000
npm run dev:web      # http://localhost:3000
```

Visit `http://localhost:3000`.

## Project structure

```
apps/
  web/      Next.js frontend — pages for Home, Live Signals, Performance, Pricing, Refer & Earn,
            plus auth (login/signup), a user dashboard, and an admin signal manager.
  server/   Express API — auth (email/password + Google), signals CRUD, performance stats,
            pricing, referrals, and a Razorpay checkout stub.
docker-compose.yml   Local Postgres for development.
```

## Notes on scope / what's stubbed

- **Payments**: Razorpay order creation + signature verification are implemented
  (`apps/server/src/routes/payments.routes.ts`), but need real Razorpay keys to actually charge
  anyone. No subscription auto-renewal / dunning logic yet.
- **Signals data**: there's no external market-data feed. Signals are entered manually through
  `/admin`, matching the "admin panel for signals" scope decided at the start of this project.
- **Telegram/WhatsApp alerts**: not implemented — stubbed as marketing copy only.
- **Referral commissions**: signups/claims are tracked, but nothing automatically marks a
  referral as "converted" or pays out commission yet — that needs to hook into the payments flow
  once real Razorpay subscriptions exist.

## Design

The visual design (colors, typography — Plus Jakarta Sans / Space Grotesk / JetBrains Mono,
layout, spacing) was extracted directly from the client's HTML prototype and rebuilt as Tailwind
components in `apps/web/src/components/ui`. The content/data model (signal cards, pricing tiers,
referral commission tiers) was reverse-engineered from the same prototype's embedded logic to
make sure copy and numbers match exactly.
