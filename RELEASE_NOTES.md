# LarpCity Release Notes

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
