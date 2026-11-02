export type CashAppDesktopPayload = {
  S: {
    v: number;
    id: string;
    name: string;
    tag: string;
    ini: string;
    col: string;
    cash: number;
    sav: number;
    stk: number;
    btc: number;
    sats: number;
    card: { has: boolean; key: string; l4: string; exp: string };
    bl4: string;
    rt: string;
    ac: string;
    vibe: string;
    now: number;
    opened: number;
    preview: boolean;
  };
  R: unknown[];
  MI?: Record<string, unknown>;
  B?: unknown;
  [key: string]: unknown;
};

export type CashAppMobilePayload = {
  id: string;
  name: string;
  handle: string;
  init: string;
  cash: number;
  savings: number;
  stocks: number;
  btc: { cents: number; sats: number };
  last4: string;
  routing: string;
  account: string;
  start: string;
  hasCard: boolean;
  contacts: unknown[];
  acts: unknown[];
  colors?: unknown;
  [key: string]: unknown;
};

function moneyToCents(raw: unknown, fallback = 0): number {
  if (typeof raw === "number" && Number.isFinite(raw)) {
    // Heuristic: large ints already cents; small floats are dollars
    if (Number.isInteger(raw) && Math.abs(raw) >= 1000) return Math.round(raw);
    return Math.round(raw * 100);
  }
  const s = String(raw ?? "")
    .replace(/[^0-9.]/g, "")
    .trim();
  if (!s) return fallback;
  const n = Number(s);
  if (!Number.isFinite(n)) return fallback;
  if (s.includes(".")) return Math.round(n * 100);
  return Math.round(n * 100);
}

function cashtag(raw: unknown, fallback: string): string {
  const t = String(raw ?? "")
    .trim()
    .replace(/^\$/, "")
    .replace(/[^a-zA-Z0-9_]/g, "")
    .slice(0, 20);
  return `$${t || fallback.replace(/^\$/, "")}`;
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "CA";
  const a = parts[0].charAt(0);
  const b = parts.length > 1 ? parts[parts.length - 1].charAt(0) : "";
  return (a + b).toUpperCase().slice(0, 2);
}

function last4(raw: unknown, fallback = "0000"): string {
  const d = String(raw ?? "")
    .replace(/\D/g, "")
    .slice(-4);
  return (d || fallback).padStart(4, "0");
}

function routing(raw: unknown, fallback = "000000000"): string {
  const d = String(raw ?? "")
    .replace(/\D/g, "")
    .slice(0, 9);
  return (d || fallback).padStart(9, "0");
}

export function buildCashAppDesktopPayload(
  base: CashAppDesktopPayload,
  data: Record<string, unknown>,
  meta: { id: string; title: string },
): CashAppDesktopPayload {
  const name = String(
    data.displayName || data.businessName || data.name || meta.title || "Cash",
  ).trim();
  const tag = cashtag(data.cashtag || data.tag || data.handle || data.username, "cash");
  const cash = moneyToCents(data.balance ?? data.cash, base.S.cash);
  const sav = moneyToCents(data.savings ?? data.sav, base.S.sav);
  const stk = moneyToCents(data.stocks ?? data.stk, base.S.stk);
  const btc = moneyToCents(data.btc ?? data.bitcoin, base.S.btc);
  const sats =
    Number(data.sats ?? base.S.sats) ||
    Math.max(0, Math.round(btc * 10.2));
  const cardKey = String(data.cardKey || base.S.card?.key || "BLACK").toUpperCase();
  const cardL4 = last4(data.cardLast4 || data.bankLast4 || base.S.card?.l4, "2587");
  const now = Date.now();

  return {
    ...base,
    S: {
      ...base.S,
      v: 1,
      id: meta.id,
      name,
      tag,
      ini: String(data.initials || initialsOf(name)).slice(0, 2).toUpperCase(),
      col: String(data.color || base.S.col || "#00d632"),
      cash,
      sav,
      stk,
      btc,
      sats,
      card: {
        has: data.hasCard !== false,
        key: cardKey,
        l4: cardL4,
        exp: String(data.cardExp || base.S.card?.exp || "11/30"),
      },
      bl4: last4(data.bankLast4 || base.S.bl4, "0000"),
      rt: routing(data.routing || base.S.rt),
      ac: last4(data.account || data.bankAccount || base.S.ac, "0000"),
      vibe: String(data.vibe || base.S.vibe || "STEADY").toUpperCase(),
      now,
      opened: Number(base.S.opened) || now - 1000 * 60 * 60 * 24 * 400,
      preview: false,
    },
  };
}

export function buildCashAppMobilePayload(
  base: CashAppMobilePayload,
  data: Record<string, unknown>,
  meta: { id: string; title: string },
): CashAppMobilePayload {
  const name = String(
    data.displayName || data.businessName || data.name || meta.title || "Cash",
  ).trim();
  const handle = cashtag(
    data.cashtag || data.tag || data.handle || data.username,
    "cash",
  );
  const cash = moneyToCents(data.balance ?? data.cash, base.cash);
  const savings = moneyToCents(data.savings ?? data.sav, base.savings);
  const stocks = moneyToCents(data.stocks ?? data.stk, base.stocks);
  const btcCents = moneyToCents(
    data.btc ?? data.bitcoin,
    base.btc?.cents ?? 0,
  );
  const sats =
    Number(data.sats ?? base.btc?.sats) ||
    Math.max(0, Math.round(btcCents * 10.2));

  return {
    ...base,
    id: meta.id,
    name,
    handle,
    init: String(data.initials || initialsOf(name)).slice(0, 2).toUpperCase(),
    cash,
    savings,
    stocks,
    btc: { cents: btcCents, sats },
    last4: last4(data.bankLast4 || base.last4, "0000"),
    routing: routing(data.routing || base.routing),
    account: last4(data.account || data.bankAccount || base.account, "0000"),
    start: String(data.start || base.start || "pay"),
    hasCard: data.hasCard !== false,
  };
}

/** Extract a top-level `{...}` object after `window.__CA=` (handles nesting). */
export function extractCashAppMobileJson(html: string): string {
  const marker = "window.__CA=";
  const i = html.indexOf(marker);
  if (i < 0) throw new Error("Cash App mobile payload missing");
  let j = i + marker.length;
  while (j < html.length && /\s/.test(html[j])) j++;
  if (html[j] !== "{") throw new Error("Cash App mobile payload missing");
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let k = j; k < html.length; k++) {
    const c = html[k];
    if (inStr) {
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') inStr = true;
    else if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) return html.slice(j, k + 1);
    }
  }
  throw new Error("Cash App mobile payload incomplete");
}

export function injectCashAppViewerHtml(
  template: string,
  opts:
    | { mobile: false; payload: CashAppDesktopPayload }
    | { mobile: true; payload: CashAppMobilePayload },
): string {
  let html = template;
  const titleName = opts.mobile
    ? opts.payload.name || "Cash App"
    : opts.payload.S.name || "Cash App";

  html = html.replace(
    /<title>[\s\S]*?<\/title>/,
    `<title>${titleName} – Cash App</title>`,
  );

  if (opts.mobile) {
    const marker = "window.__CA=";
    const i = html.indexOf(marker);
    if (i < 0) throw new Error("Cash App mobile payload missing");
    let j = i + marker.length;
    while (j < html.length && /\s/.test(html[j])) j++;
    const raw = extractCashAppMobileJson(html);
    const end = j + raw.length;
    html =
      html.slice(0, i) +
      `window.__CA=${JSON.stringify(opts.payload)}` +
      html.slice(end);
  } else {
    html = html.replace(
      /<script id="payload" type="application\/json">[\s\S]*?<\/script>/,
      `<script id="payload" type="application/json">${JSON.stringify(opts.payload)}</script>`,
    );
  }

  // Ensure brand icons for home-screen installs
  html = html.replace(
    /<link rel="manifest"[^>]*>/gi,
    `<link rel="manifest" href="/api/pwa/manifest/${encodeURIComponent(
      opts.mobile ? opts.payload.id : opts.payload.S.id,
    )}?name=Cash%20App&slug=cash-app">`,
  );
  html = html.replace(
    /<link rel="apple-touch-icon"[^>]*>/gi,
    '<link rel="apple-touch-icon" href="/brand-logos/cash-app.png">',
  );

  return html;
}
