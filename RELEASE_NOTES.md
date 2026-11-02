# LarpCity Release Notes

## v0.4.1 — LarpLabs parity pass (web-safe)

**Production:** https://larpcity-delexo.vercel.app  
**GitHub:** https://github.com/Delexoo/LarpCity

### Research
- Deep capture of [larplabs.io](https://larplabs.io) marketing + authenticated Pro dashboard (2026-11-02)
- Sources under `../larplabs.io/capture-2026-11-02/` (reference only; not shipped)

### Shipped
- **Cmd+K command palette** — jump to any platform / page
- **Get started checklist** on Home
- **Public try routes** — `/try/shopify`, `/try/youtube`
- **Landing rewrite** — stronger hero, FAQ, try CTAs, legal footer links
- **Legal stubs** — `/legal/privacy`, `/legal/terms`, `/legal/refund-policy`, `/legal/security`

### Explicitly out of scope
- iPhone location spoofing, Apple Wallet overlays, real-hostname address spoofing (desktop app features)

---

## v0.4.0 — Home, Instagram, Shopify & Studio polish

**Production:** https://larpcity-delexo.vercel.app  
**GitHub:** https://github.com/Delexoo/LarpCity

### Highlights
- **Home** — dashboard and My LARPs combined; `/larps` redirects to Home
- **Sidebar cleanup** — AI Images, Community, and New Larp removed from nav
- **Soon platforms** — unfinished hubs stay in place, greyed, labeled Soon, still clickable
- **Instagram** — dark own-profile viewer matching real IG chrome; randomized name/bio/counts each create visit; empty posts grid by default
- **Shopify** — store dashboard LARP + create form
- **YouTube Studio** — viewer + create form polish from Studio dumps
- **Brand logos** — real platform marks across Home, hubs, and cards
- **PWA install** — manifest scoped per `/larps/{id}` so install targets the right LARP
- **UI chrome** — rounder surfaces, simpler Home grid, clearer empty states

### Fixes
- Install-to-Home targeting the wrong LARP
- Form cancel/save paths that still pointed at the old `/larps` library

### Not in this release
- Cloud sync / multi-device LARP accounts (still local `localStorage`)
- Full auth gate on every route (local-first entry remains open)

---

## v0.3.3 — Chase mobile banking LARP

**Production:** https://larpcity-delexo.vercel.app

### Highlights
- **Chase mobile app** — accounts, Sapphire, activity, goals from the Chase dump
- Create form for holder, net worth presets, income, credit score
- Local Chase art assets mirrored under `/display-apps/chase`

---

## v0.3.2 — Coinbase desktop + mobile LARPs

**Production:** https://larpcity-delexo.vercel.app

### Highlights
- **Coinbase viewers** — full desktop Home and mobile app shells from official dumps
- **Coinbase create form** — profile, bag vibes, device preference, theme, more settings
- Bag size scales cash / USDC / crypto holdings and transaction history

---

## v0.3.1 — Free all platforms + watermark; Pro removes it

**Production:** https://larpcity-delexo.vercel.app

### Highlights
- **Free:** every active platform unlocked, with a LarpCity watermark on viewers
- **Pro:** everything in Free plus watermark removed forever (lifetime-first pricing)
- Pricing page and Settings plan controls updated for the new model

---

## v0.3.0 — Ink + Paper UI, Venmo, manage LARPs

**Production:** https://larpcity-delexo.vercel.app

### Highlights
- **Ink + Paper redesign** — primarily white black-and-white shell; no lime/acid accents in chrome
- **One typeface** — Figtree everywhere (titles, wordmark, body) for a simple professional look
- **My LARPs manage actions** — edit, open, share, and delete from the library
- **Venmo LARP** — desktop + mobile viewers, brand assets, create form, notifications helpers
- **Stripe polish** — official wordmark, deeper mobile viewer, Settings snippet updates
- **PWA / install** — service worker, install prompt, snapshot + manifest API routes
- **Sentence-case UI copy** — clearer page titles and empty states

### Fixes
- Stripe logo path/viewBox corruption in protect overlay and mobile viewer
- Invalid button-inside-link markup on LARP cards (links wrap actions cleanly)

### Not in this release
- Live cloud LARP sync / multi-device accounts (local `localStorage` store)
- Full Google OAuth gate on every route (entry still open for local-first use)

---

## v0.2.0 — Stripe deep dashboard & Settings

### Highlights
- Full Stripe desktop LARP viewer (vanilla HTML) with Home, Balances, Transactions, and more
- Auto device detection: desktop dashboard on PC, mobile Stripe app UI on phones
- Official-style **Settings** hub with descriptions (aligned to real Stripe layout)
- Editable Settings subpages that **save on-device** (Personal details, Communication preferences, Business, Team & security, Payouts, Developers, product stubs)
- Randomized realistic balances/charts; amounts stay editable anytime via **Edit amounts** / Randomize
- Create → My LARPs flow with highlight; open LARP for immersive viewer
- Removed manual Desktop/Mobile device toggle
- Cleaned legacy `web/`, reference dumps, and temp scripts

### Deploy
- Production: https://larpcity-delexo.vercel.app
