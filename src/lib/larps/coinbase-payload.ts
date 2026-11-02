import type { LocalLarp } from "@/lib/larps/local-store";

export type CoinbaseQuoteRow = unknown[];

export type CoinbasePayload = {
  st: {
    id: string;
    name: string;
    ini: string;
    cur: string;
    sym: string;
    now: number;
    opened: number;
    from: number;
    total: number;
    cash: number;
    usdc: number;
    crypto: number;
    c24: number;
    theme: "dark" | "light";
    reviewing: boolean;
    preview: boolean;
    actions: boolean;
    email: string;
    bank: { name: string; last4: string };
    pm: unknown[];
    apy: Record<string, number>;
    usdcApy: number;
    [key: string]: unknown;
  };
  q: CoinbaseQuoteRow[];
  tx: unknown[];
  man: unknown[];
  led: unknown[];
  addr: Record<string, unknown>;
  [key: string]: unknown;
};

const BANKS = [
  "Chase",
  "Bank of America",
  "Capital One",
  "Wells Fargo",
  "Citi",
  "US Bank",
] as const;

const CURRENCY: Record<string, { cur: string; sym: string }> = {
  USD: { cur: "USD", sym: "$" },
  EUR: { cur: "EUR", sym: "€" },
  GBP: { cur: "GBP", sym: "£" },
};

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "C";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function parseMoney(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) return Math.max(0, value);
  const raw = String(value ?? "")
    .replace(/[,$]/g, "")
    .replace(/[^\d.]/g, "");
  const n = Number(raw);
  return Number.isFinite(n) ? Math.max(0, n) : fallback;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function scaleQuotes(
  quotes: CoinbaseQuoteRow[],
  targetCrypto: number,
  holdingsCount: number,
): CoinbaseQuoteRow[] {
  const withQty = quotes
    .map((row, index) => {
      const qty = Number(row[row.length - 1]) || 0;
      const px = Number(row[4]) || 0;
      return { index, qty, px, value: qty * px };
    })
    .filter((r) => r.qty > 0 && r.px > 0);

  if (!withQty.length || targetCrypto <= 0) {
    return quotes.map((row) => {
      const next = [...row];
      next[next.length - 1] = 0;
      return next;
    });
  }

  // Keep top N by value, zero the rest, then scale remaining to targetCrypto.
  const ranked = [...withQty].sort((a, b) => b.value - a.value);
  const keep = new Set(
    ranked.slice(0, Math.max(1, Math.min(holdingsCount, ranked.length))).map((r) => r.index),
  );
  const keepValue = ranked
    .filter((r) => keep.has(r.index))
    .reduce((sum, r) => sum + r.value, 0);

  const factor = keepValue > 0 ? targetCrypto / keepValue : 1;

  return quotes.map((row, index) => {
    const next = [...row];
    if (!keep.has(index)) {
      next[next.length - 1] = 0;
      return next;
    }
    const qty = Number(row[row.length - 1]) || 0;
    next[next.length - 1] = Number((qty * factor).toFixed(8));
    return next;
  });
}

function scaleTxAmounts(tx: unknown[], factor: number): unknown[] {
  if (!Array.isArray(tx) || !Number.isFinite(factor) || factor === 1) return tx;
  return tx.map((row) => {
    if (!Array.isArray(row)) return row;
    const next = [...row];
    // Common shape: amount-like number near end; scale finite numbers that look like USD sizes.
    for (let i = 0; i < next.length; i++) {
      const v = next[i];
      if (typeof v === "number" && Math.abs(v) >= 1) {
        next[i] = round2(v * factor);
      }
    }
    return next;
  });
}

export function buildCoinbasePayload(
  base: CoinbasePayload,
  data: Record<string, unknown>,
  meta: { id: string; title: string },
): CoinbasePayload {
  const displayName = String(
    data.displayName || data.businessName || data.name || meta.title || "Coinbase",
  ).trim();
  const total = parseMoney(data.totalUsd ?? data.balance ?? data.bag, base.st.total || 10000);
  const themeRaw = String(data.theme || base.st.theme || "dark").toLowerCase();
  const theme: "dark" | "light" = themeRaw === "light" ? "light" : "dark";
  const currencyKey = String(data.currency || base.st.cur || "USD").toUpperCase();
  const currency = CURRENCY[currencyKey] || CURRENCY.USD;
  const holdingsCount = Math.max(
    1,
    Math.min(16, Number(data.holdingsCount ?? 3) || 3),
  );

  const cashRatio = 0.012;
  const usdcRatio = 0.018;
  const cash = round2(total * cashRatio);
  const usdc = round2(total * usdcRatio);
  const crypto = Math.max(0, round2(total - cash - usdc));
  const oldCrypto = Math.max(1, Number(base.st.crypto) || 1);
  const factor = crypto / oldCrypto;

  const bankName = String(data.bankName || base.st.bank?.name || BANKS[0]);
  const bankLast4 = String(data.bankLast4 || base.st.bank?.last4 || "3725").replace(
    /\D/g,
    "",
  ).slice(-4);

  const q = scaleQuotes(base.q || [], crypto, holdingsCount);
  const tx = scaleTxAmounts(base.tx || [], factor);

  return {
    ...base,
    st: {
      ...base.st,
      id: meta.id,
      name: displayName,
      ini: String(data.initials || initialsOf(displayName)).slice(0, 2),
      cur: currency.cur,
      sym: currency.sym,
      now: Date.now(),
      total: round2(total),
      cash,
      usdc,
      crypto,
      theme,
      reviewing: false,
      preview: false,
      actions: true,
      email: String(data.email || ""),
      bank: { name: bankName, last4: bankLast4 || "0000" },
    },
    q,
    tx,
    man: Array.isArray(base.man) ? base.man : [],
    led: Array.isArray(base.led) ? base.led : [],
    addr: base.addr && typeof base.addr === "object" ? base.addr : {},
  };
}

export function injectCoinbaseViewerHtml(
  template: string,
  payload: CoinbasePayload,
  opts: { mobile: boolean },
): string {
  let html = template;
  const titleName = payload.st.name || "Coinbase";

  html = html.replace(
    /<title>[\s\S]*?<\/title>/,
    opts.mobile
      ? `<title>Coinbase</title>`
      : `<title>Home · Coinbase</title>`,
  );

  if (opts.mobile) {
    html = html.replace(
      /<script id="acct" type="application\/json">[\s\S]*?<\/script>/,
      `<script id="acct" type="application/json">${JSON.stringify(payload)}</script>`,
    );
  } else {
    html = html.replace(
      /<script id="payload" type="application\/json">[\s\S]*?<\/script>/,
      `<script id="payload" type="application/json">${JSON.stringify(payload)}</script>`,
    );
    // Keep INITIAL in sync for any editor hooks inside the shell.
    html = html.replace(
      /var INITIAL = \{[\s\S]*?\};/,
      `var INITIAL = ${JSON.stringify({
        name: titleName.toLowerCase().replace(/\s+/g, ""),
        displayName: titleName,
        totalUsd: payload.st.total,
        currency: payload.st.cur,
        theme: payload.st.theme === "light" ? "LIGHT" : "DARK",
        vibe: "SIDEWAYS",
        strategy: "BLUE_CHIP",
        buyPanel: "NORMAL",
        holdingsCount: (payload.q || []).filter(
          (row) => Number(row[row.length - 1]) > 0,
        ).length,
      })};`,
    );
  }

  html = html.replace(/<script id="ll-install-data"[\s\S]*$/i, "");
  html = html.replace(/<button id="ll-install-btn"[\s\S]*?<\/button>/gi, "");
  html = html.replace(/https:\/\/larplabs\.io/gi, "");

  html = html.replace(
    /<link rel="manifest"[^>]*>/gi,
    `<link rel="manifest" href="/api/pwa/manifest/${encodeURIComponent(payload.st.id)}?name=Coinbase&slug=coinbase">`,
  );
  html = html.replace(
    /<link rel="apple-touch-icon"[^>]*>/gi,
    `<link rel="apple-touch-icon" href="/brand-logos/coinbase.png">`,
  );

  const fit = opts.mobile
    ? `<style id="lc-coinbase-fit">
html,body{height:100%;width:100%;overflow:hidden;background:#0A0B0D}
body.t-home,body{min-height:100%}
#ll-install-btn{display:none!important}
@media (min-width:560px){
  html{background:#050505}
  body{max-width:390px;margin:16px auto;height:calc(100% - 32px);
    border-radius:28px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.45)}
}
</style>
<link rel="icon" href="/brand-logos/coinbase.png"/>`
    : `<style id="lc-coinbase-fit">
html,body{min-height:100%;margin:0;background:#0A0B0D}
#ll-install-btn{display:none!important}
</style>
<link rel="icon" href="/brand-logos/coinbase.png"/>`;

  if (html.includes("</head>")) html = html.replace("</head>", `${fit}</head>`);
  else html = fit + html;

  if (!/<\/body>/i.test(html)) html += "</body></html>";
  return html;
}

export function coinbaseTitle(larp: LocalLarp): string {
  const name = String(
    larp.data?.displayName || larp.data?.businessName || larp.title || "Coinbase",
  ).trim();
  return `Home · ${name} · Coinbase`;
}
