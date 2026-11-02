<p align="center">
  <img src="public/larplabslogo.png" width="88" height="88" alt="LarpingKit">
</p>

<h1 align="center">LarpingKit</h1>

<p align="center">
  <strong>Polished mock dashboards for screenshots</strong><br>
  Stripe, Venmo, Cash App, Coinbase, Shopify, YouTube Studio, Instagram, Chase, and more.
</p>

<p align="center">
  <a href="https://larpcity-delexo.vercel.app"><img src="https://img.shields.io/badge/Live_demo-larpcity--delexo-111111?style=for-the-badge" alt="Live demo"></a>
  <a href="https://github.com/Delexoo/LarpCity/releases/latest"><img src="https://img.shields.io/github/v/release/Delexoo/LarpCity?style=for-the-badge&label=Latest%20release&color=111111" alt="Latest release"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-0f172a?style=for-the-badge" alt="License"></a>
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js"></a>
</p>

<p align="center">
  <a href="https://larpcity-delexo.vercel.app">Live demo</a> ·
  <a href="https://larpcity-delexo.vercel.app/pricing">Pricing</a> ·
  <a href="./RELEASE_NOTES.md">Release notes</a> ·
  <a href="https://github.com/Delexoo/LarpCity/releases">GitHub Releases</a>
</p>

---

## What it is

**LarpingKit** (larpingkit.com) lets you spin up realistic **LARPs** — local-first mock product UIs — so you can capture clean screenshots without touching live accounts.

| Ready now | Coming soon |
| --- | --- |
| Stripe · Venmo · Cash App · Coinbase · Shopify · YouTube Studio · Chase · iMessage · Instagram · Receipts | Greyed **Soon** hubs in the sidebar (clickable roadmap) |

**Free** unlocks every ready platform with a small watermark. **Pro** removes the watermark.

## Highlights

- **Home** — platforms + your LARPs in one place
- **Real brand logos** and Ink + Paper chrome
- **Immersive viewers** — desktop/mobile shells, PWA install scoped per LARP
- **Randomized onboarding** where it matters (e.g. Instagram dark profile)
- **Supabase + Stripe** hooks ready for auth and Pro billing

## Stack

| Layer | Tech |
| --- | --- |
| App | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4, Figtree |
| Data | Local LARP store (`localStorage`); Supabase-ready |
| Billing | Stripe Checkout, Customer Portal, webhooks |
| Hosting | [Vercel](https://larpcity-delexo.vercel.app) |

## Quick start

```bash
npm install
cp .env.local.example .env.local
# fill in keys — see Environment below
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

Copy `.env.local.example` → `.env.local`. **Never commit real secrets.**

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only service role |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret |
| `STRIPE_PRICE_PRO_MONTHLY` | Pro monthly price id |
| `STRIPE_PRICE_PRO_LIFETIME` | Pro lifetime price id |

Google OAuth is configured in the **Supabase dashboard** (Authentication → Providers), not via Next.js env vars.

## Scripts

```bash
npm run dev      # development server
npm run build    # production build
npm run start    # serve production build
npm run lint     # ESLint
```

## App routes

| Path | Notes |
| --- | --- |
| `/` | Marketing landing |
| `/dashboard` | Home — platforms + My LARPs |
| `/platforms/[slug]` | Platform hub |
| `/platforms/[slug]/new` | Create / edit LARP |
| `/larps/[id]` | Immersive viewer |
| `/pricing` | Free vs Pro |
| `/settings` | Profile + billing portal |

## Plans

- **Free** — all ready platforms · LarpingKit watermark on viewers  
- **Pro** — watermark removed (lifetime-first pricing)

## Release notes

Full changelog: [RELEASE_NOTES.md](./RELEASE_NOTES.md)  
Tagged releases: [GitHub Releases](https://github.com/Delexoo/LarpCity/releases)

## License

MIT — see [LICENSE](./LICENSE).
