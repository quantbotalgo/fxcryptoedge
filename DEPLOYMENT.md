# Deploying Fx Crypto Edge

Frontend on Vercel, backend + database on Render. Both connect to the
`quantbotalgo/fxcryptoedge` GitHub repo and auto-deploy on every push to
`master`.

Status as of writing:
- [x] Code pushed to `quantbotalgo/fxcryptoedge` on GitHub (Utkarsh added as collaborator with write access)
- [x] Vercel project created, Root Directory set to `apps/web`
- [x] Vercel env var `NEXT_PUBLIC_GOOGLE_CLIENT_ID` set
- [ ] Render Postgres instance
- [ ] Render Web Service for `apps/server`
- [ ] `NEXT_PUBLIC_API_URL` added to Vercel (needs Render URL first)
- [ ] `db:push` + `db:seed` run against the production database
- [ ] Google Cloud Console — Authorized JavaScript origins updated with live Vercel URL
- [ ] Final smoke test

Render requires the client to connect GitHub themselves (a collaborator's
login isn't enough to import someone else's repo) — this needs the client
logged into render.com.

## 1. Render — Postgres

1. render.com → New → PostgreSQL
2. Free tier, region close to India if available, create
3. Copy the **Internal Database URL** once it's up (this becomes `DATABASE_URL` below)

## 2. Render — Web Service (API)

1. New → Web Service → connect GitHub → select `quantbotalgo/fxcryptoedge`
2. Root Directory: `apps/server`
3. Build Command: `npm install && npm run build`
4. Start Command: `npm start`
5. Instance type: Free (or Starter, ~$7/mo, to avoid cold starts)

### Environment variables (Render)

Paste this block into the Key field (multi-line KEY=VALUE paste is supported):

```
NODE_ENV=production
JWT_EXPIRES_IN=7d
JWT_SECRET=ccc42f5ffd96ac3cc612ae56e2a71ad5d7c598dcf1039d7ad47bde357e7dd354cf88c0f4f9cf2c4826f64b3c9a2ce281
GOOGLE_CLIENT_ID=552810785606-qljm374fmisspcnnvhudg3m6l35i3c0p.apps.googleusercontent.com
```

Then add individually (values only you have):

- `DATABASE_URL` — Internal Database URL from step 1
- `CLIENT_ORIGIN` — the live Vercel URL, no trailing slash (e.g. `https://fxcryptoedge-web.vercel.app`)
- `RAZORPAY_KEY_ID` — test key from the Razorpay dashboard (Test Mode toggle on, Websites & API keys)
- `RAZORPAY_KEY_SECRET` — same, paired secret

`PORT` — don't set manually, Render injects it and the server already reads `process.env.PORT`.

Deploy. Once live, note the service URL (e.g. `https://fxcryptoedge-server.onrender.com`) — needed for step 4.

## 3. Run migrations against production

From your own machine, with `apps/server/.env`'s `DATABASE_URL` temporarily
pointed at the Render Postgres's **External** Database URL (Render shows this
on the same page as the internal one — needed here since you're connecting
from outside Render's network):

```
cd apps/server
npm run db:push
npm run db:seed
```

`db:seed` deletes and re-inserts the `signals` table — fine for a first
deploy, but don't rerun it later if real signals have been posted through the
admin panel.

Switch `DATABASE_URL` back to local Postgres afterward for local dev.

## 4. Vercel — finish env vars

Back in the Vercel project → Environments:

- `NEXT_PUBLIC_API_URL` = the Render service URL from step 2 (no trailing slash)

Redeploy (Vercel → Deployments → ⋯ → Redeploy) so the new env var gets baked into the build.

## 5. Google Cloud Console

console.cloud.google.com → APIs & Services → Credentials → the OAuth Client
ID (`552810785606-...`) → Authorized JavaScript origins → Add:

- the live Vercel URL (e.g. `https://fxcryptoedge-web.vercel.app`)

Without this, "Sign in with Google" will fail on the live site even though it
works locally.

## 6. Smoke test

- Sign up with email/password
- Log in with Google
- View Live Signals — confirm one free sample per market is visible, rest are locked
- Subscribe to a plan (Razorpay test card `4111 1111 1111 1111`) — confirm entitlement unlocks the signals for that market
- Log in as admin (`admin@fxcryptoedge.in`), post a signal, confirm it appears
- Check Performance page loads without login
