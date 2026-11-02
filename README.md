# LarpCity

Create polished mock financial and social dashboards (LARPs) for screenshots — Stripe, Venmo, Coinbase, wallets, and more.

**Live demo:** [larpcity-delexo.vercel.app](https://larpcity-delexo.vercel.app)

## Features

- Platform hubs with create / edit / open / share / delete for local LARPs
- Stripe desktop + mobile viewers with Settings that save on-device
- Venmo desktop + mobile viewers with brand assets
- Ink + Paper UI: black/white shell, single Figtree typeface
- PWA install prompts and snapshot APIs for immersive viewing
- Supabase + Stripe hooks ready for auth and Pro billing

## Stack

| Layer | Tech |
| --- | --- |
| App | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4, Figtree |
| Data | Local LARP store (`localStorage`); Supabase-ready |
| Billing | Stripe Checkout, Customer Portal, webhooks |
| Hosting | Vercel |

## Quick start

```bash
npm install
cp .env.local.example .env.local
# fill in keys — see Environment below
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

Copy `.env.local.example` → `.env.local`. Never commit real secrets.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only service role |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL (`http://localhost:3000` locally) |
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
| `/login` | Sign-in entry (auth optional while local-first) |
| `/pricing` | Free vs Pro |
| `/dashboard` | Overview + recent LARPs |
| `/larps`, `/larps/new`, `/larps/[id]` | Library, create, immersive viewer |
| `/platforms/[slug]` | Platform hub + create form |
| `/settings` | Profile + billing portal |
| `/library`, `/community`, `/ai-images`, `/support`, `/refer` | Placeholders |

## Plans

- **Free:** All active platforms · LarpCity watermark on viewers
- **Pro:** Everything in Free · watermark removed forever (lifetime $99, or $29/mo later)

## Release notes

See [RELEASE_NOTES.md](./RELEASE_NOTES.md).

## License

MIT — see [LICENSE](./LICENSE).
