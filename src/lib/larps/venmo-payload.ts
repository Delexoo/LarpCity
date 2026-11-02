import type { LocalLarp } from "@/lib/larps/local-store";

export type VenmoPayload = {
  S: {
    id: string;
    name: string;
    short?: string;
    first: string;
    handle: string;
    initials: string;
    bal: number;
    bank: { brand: string; last4: string; isCard?: boolean };
    bank2: { brand: string; last4: string };
    vibe: string;
    preview: boolean;
    debit?: string;
    acct?: string;
    friends?: number;
    groups?: number;
  };
  R: unknown[];
  P?: unknown[];
  F?: unknown[];
  [key: string]: unknown;
};

const FIRST = [
  "Alex",
  "Jordan",
  "Sam",
  "Taylor",
  "Casey",
  "Riley",
  "Morgan",
  "Quinn",
  "Avery",
  "Cameron",
  "Drew",
  "Jamie",
  "Reese",
  "Skyler",
  "Parker",
  "Hayden",
  "Rowan",
  "Emerson",
  "Kai",
  "Noah",
  "Maya",
  "Zoe",
  "Liam",
  "Ava",
  "Elena",
  "Marcus",
  "Priya",
  "Diego",
  "Sofia",
  "Nina",
];

const LAST = [
  "Nguyen",
  "Patel",
  "Kim",
  "Garcia",
  "Johnson",
  "Lee",
  "Brown",
  "Martinez",
  "Davis",
  "Wilson",
  "Anderson",
  "Thomas",
  "Jackson",
  "White",
  "Harris",
  "Clark",
  "Lewis",
  "Young",
  "Walker",
  "Hall",
  "Allen",
  "Torres",
  "Ramirez",
  "Brooks",
  "Foster",
];

const BUSINESSES = [
  "Blue Bottle",
  "Shell",
  "Target",
  "Uber",
  "DoorDash",
  "Starbucks",
  "Chipotle",
  "Whole Foods",
  "CVS",
  "Costco",
  "Netflix",
  "Spotify",
  "Amazon",
  "Lyft",
  "Trader Joe's",
];

const PLACES = [
  "Brooklyn",
  "Austin",
  "Downtown",
  "Mission",
  "SoHo",
  "Capitol Hill",
  "Echo Park",
  "Wicker Park",
  "Williamsburg",
  "Silver Lake",
  "Cambridge",
  "Oakland",
  "Denver",
  "Miami",
  "Seattle",
];

const NOTES = [
  "Dinner 🍝",
  "Coffee ☕",
  "Rent 🏠",
  "Groceries 🛒",
  "Uber home",
  "Concert tickets 🎟️",
  "Brunch",
  "Gas ⛽",
  "Birthday 🎂",
  "Split the bill",
  "Airbnb",
  "Gym",
  "Haircut",
  "Movie night 🎬",
  "Thank you!",
  "Weekend trip",
  "Utilities",
  "Snacks",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function moneyToCents(raw: unknown, fallback = 0): number {
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return Math.round(raw > 1000 ? raw : raw * 100);
  }
  const s = String(raw ?? "")
    .replace(/[^0-9.]/g, "")
    .trim();
  if (!s) return fallback;
  const n = Number(s);
  if (!Number.isFinite(n)) return fallback;
  if (s.includes(".")) return Math.round(n * 100);
  return Math.round(n * (n < 1_000_000 ? 100 : 1));
}

function slugHandle(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 24) || "venmo-user"
  );
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "V";
  const a = parts[0].charAt(0);
  const b = parts.length > 1 ? parts[parts.length - 1].charAt(0) : "";
  return (a + b).toUpperCase();
}

function randomPerson(): { name: string; handle: string; friends: number } {
  const f = pick(FIRST);
  const l = pick(LAST);
  const name = `${f} ${l}`;
  const handle = `${f}-${l}-${Math.floor(Math.random() * 90 + 10)}`.toLowerCase();
  return {
    name,
    handle,
    friends: 18 + Math.floor(Math.random() * 420),
  };
}

function randomNote(): string {
  const note = pick(NOTES);
  if (Math.random() < 0.35) return `${note} · ${pick(PLACES)}`;
  return note;
}

function isRow(x: unknown): x is unknown[] {
  return Array.isArray(x);
}

/** Fresh people / places / notes on every open so the feed never looks frozen. */
export function randomizeVenmoWorld(payload: VenmoPayload): VenmoPayload {
  const people = (Array.isArray(payload.P) ? payload.P : []).map(() => {
    const p = randomPerson();
    return [p.name, p.handle, p.friends];
  });
  // Keep a pool for remapping existing handles in R/F.
  const pool = people.map((p) => ({
    name: String(p[0]),
    handle: String(p[1]),
  }));
  while (pool.length < 24) {
    const p = randomPerson();
    pool.push({ name: p.name, handle: p.handle });
  }

  let pi = 0;
  const nextPerson = () => {
    const p = pool[pi % pool.length]!;
    pi += 1;
    return p;
  };

  const rows = (Array.isArray(payload.R) ? payload.R : []).map((row) => {
    if (!isRow(row) || row.length < 6) return row;
    const next = row.slice();
    const kind = String(next[1] || "");
    if (kind === "card") {
      next[3] = pick(BUSINESSES);
      next[4] = "";
      next[5] = `${pick(PLACES)} · ${pick(NOTES).replace(/\s*·.*$/, "")}`;
    } else if (kind === "transfer") {
      next[5] = Math.random() < 0.5 ? "To linked bank" : "Instant transfer";
    } else if (kind === "payment" || kind === "request") {
      const p = nextPerson();
      next[3] = p.name;
      next[4] = p.handle;
      next[5] = randomNote();
    }
    return next;
  });

  const feed = (Array.isArray(payload.F) ? payload.F : []).map((row) => {
    if (!isRow(row) || row.length < 6) return row;
    const next = row.slice();
    const a = nextPerson();
    const b = nextPerson();
    next[1] = a.name;
    next[2] = a.handle;
    next[3] = b.name;
    next[4] = b.handle;
    next[5] = randomNote();
    return next;
  });

  return {
    ...payload,
    P: people.length ? people : pool.slice(0, 18).map((p) => [p.name, p.handle, 40 + Math.floor(Math.random() * 200)]),
    R: rows,
    F: feed,
  };
}

export function buildVenmoPayload(
  base: VenmoPayload,
  data: Record<string, unknown>,
  meta: { id: string; title: string },
): VenmoPayload {
  const name = String(
    data.businessName || data.displayName || data.name || meta.title || "Venmo",
  ).trim();
  const handle = String(data.handle || data.username || slugHandle(name)).replace(
    /^@/,
    "",
  );
  const first = name.split(/\s+/)[0] || name;
  const bal = moneyToCents(data.balance ?? data.bal, base.S.bal);
  const bankBrand = String(data.bankBrand || base.S.bank?.brand || "Visa");
  const bankLast4 = String(data.bankLast4 || base.S.bank?.last4 || "0000").slice(
    -4,
  );
  const bank2Brand = String(data.bank2Brand || base.S.bank2?.brand || "Chase");
  const bank2Last4 = String(
    data.bank2Last4 || base.S.bank2?.last4 || "3083",
  ).slice(-4);

  const built: VenmoPayload = {
    ...base,
    S: {
      ...base.S,
      id: meta.id,
      name,
      short: name.length > 18 ? `${name.slice(0, 16)}.` : name,
      first,
      handle,
      initials: String(data.initials || initialsOf(name)).slice(0, 2),
      bal,
      bank: {
        brand: bankBrand,
        last4: bankLast4,
        isCard: data.bankIsCard !== false,
      },
      bank2: { brand: bank2Brand, last4: bank2Last4 },
      vibe: String(data.vibe || base.S.vibe || "STEADY").toUpperCase(),
      preview: false,
      friends: Number(data.friends ?? base.S.friends ?? 12) || 12,
      groups: Number(data.groups ?? base.S.groups ?? 0) || 0,
    },
  };

  return randomizeVenmoWorld(built);
}

/** Device-fit + brand polish injected into Venmo shells. */
export function injectVenmoViewerHtml(
  template: string,
  payload: VenmoPayload,
  opts: { mobile: boolean },
): string {
  let html = template;
  const titleName = payload.S.name || "Venmo";
  html = html.replace(
    /<title>[\s\S]*?<\/title>/,
    `<title>${titleName} – Venmo</title>`,
  );
  html = html.replace(
    /<script id="payload" type="application\/json">[\s\S]*?<\/script>/,
    `<script id="payload" type="application/json">${JSON.stringify(payload)}</script>`,
  );

  // Prefer local brand assets; stickers/people packs aren't mirrored — skip broken imgs.
  html = html.replace(
    'var A = "/larp-assets/venmo-mobile"',
    'var A = "/larp-assets/venmo-desktop"',
  );
  html = html.replace(
    'var A = "/larp-assets/venmo-desktop"',
    'var A = "/larp-assets/venmo-desktop"',
  );
  html = html.replace(
    /function stickerUrl\(k\) \{ return A \+ "\/stickers\/" \+ k \+ "\.webp"; \}/,
    'function stickerUrl(k) { return ""; }',
  );
  // Don't pin faces to payload order — reshuffle photo picks each boot.
  html = html.replace(
    /\/\/ Photos are handed out in the payload's order so every visit shows the same faces\.\s*PEOPLE\.forEach\(function \(p\) \{ photoFor\(p\.name, p\.handle\); \}\);/,
    "usedPhoto = {}; PHOTO = {}; PEOPLE.sort(function(){ return Math.random() - 0.5; }); PEOPLE.forEach(function (p) { photoFor(p.name, p.handle); });",
  );

  // Strip embedded Install Venmo pill (LarpingKit already shows InstallLarpPrompt).
  html = html.replace(
    /<script id="ll-install-data"[\s\S]*$/i,
    "",
  );
  html = html.replace(
    /<button id="ll-install-btn"[\s\S]*?<\/button>/gi,
    "",
  );
  html = html.replace(/<\/?(?:twh|tps)-[^>]*>/gi, "");
  if (!/<\/body>/i.test(html)) html += "</body></html>";

  // Parent InstallLarpPrompt owns the real PWA manifest (correct LARP id).
  html = html.replace(/<link rel="manifest"[^>]*>/gi, "");
  html = html.replace(
    /<link rel="apple-touch-icon"[^>]*>/gi,
    '<link rel="apple-touch-icon" href="/brand-logos/venmo.png">',
  );
  html = html.replace(
    /<meta name="apple-mobile-web-app-title"[^>]*>/gi,
    '<meta name="apple-mobile-web-app-title" content="Venmo">',
  );

  const fit = opts.mobile
    ? `<style id="lc-venmo-fit">
html,body{height:100%;width:100%;overflow:hidden;background:#008CFF}
#app{position:fixed;inset:0;max-width:100%;margin:0 auto;
  padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px);
  box-sizing:border-box}
@media (min-width:560px){
  html{background:#0b1220}
  #app{max-width:390px;left:50%;right:auto;transform:translateX(-50%);
    border-radius:28px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.45);
    top:16px;bottom:16px;height:auto}
}
#ll-install-btn{display:none!important}
</style>
<link rel="icon" href="/larp-assets/venmo-desktop/favicon.svg"/>
<link rel="apple-touch-icon" href="/brand-logos/venmo.png"/>`
    : `<style id="lc-venmo-fit">
html,body{min-height:100%;margin:0;background:#fff}
#ll-install-btn{display:none!important}
</style>
<link rel="icon" href="/larp-assets/venmo-desktop/favicon.svg"/>
<link rel="apple-touch-icon" href="/brand-logos/venmo.png"/>`;

  if (html.includes("</head>")) {
    html = html.replace("</head>", `${fit}</head>`);
  } else {
    html = fit + html;
  }
  return html;
}
