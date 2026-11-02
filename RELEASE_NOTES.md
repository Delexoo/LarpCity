# LarpCity Release Notes

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

### Not in this release
- Live Stripe billing / OAuth / cloud sync (local LARP store only)
- GitHub remote push (requires GitHub auth on this machine)

### Deploy
- Production: https://app-kohl-three-47.vercel.app
