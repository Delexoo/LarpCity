import { currencyMeta, moneyToCents, parsePct } from "./money";
import {
  generateDailySeries,
  hashSeed,
  mulberry32,
  randomMoneyCents,
} from "./realistic";

export type StripePayload = {
  biz: string;
  cur: string;
  sym: string;
  flag: string;
  tz: string;
  now: number;
  day0: number;
  n: number;
  subsBiz: boolean;
  start: string;
  d: Record<string, number[]>;
  pays: unknown[];
  custs: unknown[];
  subs: unknown[];
  invs: unknown[];
  links: unknown[];
  payouts: unknown[];
  incoming: [number, number][];
  bank: { name: string; logo: string; last4: string };
  bal: number;
  inc: number;
  x: {
    id: string;
    acct: string;
    theme: string;
    preview: boolean;
    failedN: number;
    capital: number;
    country: string;
    countryName: string;
    declineRate: number;
    disputeRate: number;
    refundRate: number;
    mix: Record<string, number>;
    products: Array<{
      name: string;
      priceCents: number;
      allocationPct: number;
      recurring: boolean;
    }>;
  };
};

const COUNTRY_NAMES: Record<string, string> = {
  US: "United States",
  GB: "United Kingdom",
  CA: "Canada",
  AU: "Australia",
  DE: "Germany",
  FR: "France",
  NL: "Netherlands",
};

function scaleMoneyRows(rows: unknown[], amountIndex: number, factor: number) {
  return rows.map((row) => {
    const r = [...(row as unknown[])];
    if (typeof r[amountIndex] === "number") {
      r[amountIndex] = Math.max(0, Math.round((r[amountIndex] as number) * factor));
    }
    return r;
  });
}

function jitterTimes(rows: unknown[], timeIndex: number, rand: () => number) {
  const day = 86_400_000;
  return rows.map((row) => {
    const r = [...(row as unknown[])];
    if (typeof r[timeIndex] === "number") {
      r[timeIndex] = (r[timeIndex] as number) + Math.round((rand() - 0.5) * day);
    }
    return r;
  });
}

/** Build a Stripe viewer payload from form/local LARP data + base reference. */
export function buildStripePayload(
  base: StripePayload,
  data: Record<string, unknown>,
  opts?: { id?: string; title?: string },
): StripePayload {
  const biz =
    String(data.businessName || opts?.title || base.biz || "Business").trim() ||
    "Business";
  const { cur, sym, flag } = currencyMeta(data.currency);
  const country = String(data.country || base.x.country || "US").toUpperCase();
  const seed = hashSeed(
    `${opts?.id || base.x.id}|${biz}|${data.balance}|${data.gross}|${data.net}|${Date.now() >> 16}`,
  );
  const rand = mulberry32(seed);

  const bal = moneyToCents(data.balance) || base.bal;
  const gross = moneyToCents(data.gross) || randomMoneyCents(rand, 400_000, 8_000_000);
  const net =
    moneyToCents(data.net) || Math.round(gross * (0.92 + rand() * 0.05));
  const incomingCents =
    moneyToCents(data.incoming) ||
    randomMoneyCents(rand, Math.round(bal * 0.2), Math.round(bal * 0.85));
  const capital =
    moneyToCents(data.capital) ||
    Math.round((20_000 + rand() * 80_000) / 1000) * 100_000;
  const theme =
    String(data.theme || base.x.theme || "light").toLowerCase() === "dark"
      ? "dark"
      : "light";
  const vibe = String(data.vibe || data.preset || "growing");

  const pm = (data.paymentMethods || {}) as Record<string, unknown>;
  const mix = {
    link: parsePct(pm.link, base.x.mix.link),
    visa: parsePct(pm.visa, base.x.mix.visa),
    mastercard: parsePct(pm.mastercard, base.x.mix.mastercard),
    amex: parsePct(pm.amex, base.x.mix.amex),
  };

  const days = base.d.g?.length || base.n || 120;
  const d: Record<string, number[]> = { ...base.d };
  d.g = generateDailySeries(days, gross, rand, { vibe });
  d.nt = generateDailySeries(days, net, rand, { vibe });
  const refundRate = parsePct(data.refunded, base.x.refundRate);
  const disputeRate = parsePct(data.disputed, base.x.disputeRate);
  const declineRate = parsePct(data.declined, base.x.declineRate);
  d.rf = generateDailySeries(days, Math.round(gross * (refundRate / 100)), rand, {
    vibe,
  });
  d.dp = generateDailySeries(days, Math.round(gross * (disputeRate / 100)), rand, {
    vibe,
  });
  if (base.d.n) {
    const payCount = Math.max(
      20,
      Math.round((parsePct(data.newCustomers, 200) || 200) * (0.8 + rand())),
    );
    d.n = generateDailySeries(days, payCount, rand, { vibe });
  }
  if (base.d.f) {
    d.f = generateDailySeries(
      days,
      Math.max(1, Math.round(parsePct(data.failed, 8) * 10)),
      rand,
      { vibe },
    );
  }
  if (base.d.c) {
    d.c = generateDailySeries(
      days,
      Math.max(10, Math.round(parsePct(data.newCustomers, 200))),
      rand,
      { vibe },
    );
  }

  const avgPay = Math.max(500, Math.round(gross / Math.max(30, days * 0.35)));
  const payFactor = avgPay / 12_000;
  const pays = jitterTimes(
    scaleMoneyRows(base.pays || [], 2, Math.max(0.15, Math.min(8, payFactor * (0.7 + rand())))),
    1,
    rand,
  );

  const custFactor = 0.7 + rand() * 0.8;
  const custs = (base.custs || []).map((row) => {
    const r = [...(row as unknown[])];
    return r;
  });

  const payouts = scaleMoneyRows(base.payouts || [], 3, Math.max(0.2, bal / Math.max(1, base.bal)));
  const now = Date.now();
  const incoming: [number, number][] = [
    [now + 86_400_000, Math.round(incomingCents * (0.45 + rand() * 0.2))],
    [now + 172_800_000, Math.round(incomingCents * (0.35 + rand() * 0.2))],
  ];
  // normalize incoming sum
  const inSum = incoming.reduce((a, [, v]) => a + v, 0) || 1;
  incoming[0][1] = Math.round((incoming[0][1] / inSum) * incomingCents);
  incoming[1][1] = Math.max(0, incomingCents - incoming[0][1]);

  return {
    ...base,
    biz,
    cur,
    sym,
    flag,
    now,
    n: days,
    bal,
    inc: incomingCents,
    incoming,
    payouts,
    pays,
    custs: custs.length ? custs : base.custs,
    d,
    x: {
      ...base.x,
      id: opts?.id || base.x.id,
      theme,
      capital,
      country,
      countryName: COUNTRY_NAMES[country] || base.x.countryName || country,
      failedN: Math.max(0, Math.round(parsePct(data.failed, base.x.failedN))),
      declineRate,
      disputeRate,
      refundRate,
      mix,
      preview: true,
    },
  };
}

/** Inject patched payload + theme + responsive CSS into Stripe home.html. */
export function injectStripeViewerHtml(
  templateHtml: string,
  payload: StripePayload,
): string {
  const themeClass = payload.x.theme === "dark" ? "dk" : "lt";
  let html = templateHtml;

  html = html.replace(
    /<title>[\s\S]*?<\/title>/,
    `<title>Home – ${escapeHtml(payload.biz)} – Stripe</title>`,
  );

  html = html.replace(/<body class="[^"]*">/, `<body class="${themeClass}">`);

  html = html.replace(
    /<script id="payload" type="application\/json">[\s\S]*?<\/script>/,
    `<script id="payload" type="application/json">${JSON.stringify(payload)}</script>`,
  );

  // Soften fixed desktop min-width so tablets don't clip as hard.
  const responsive = `<style>@media (max-width:959px){body{min-width:0!important}#nav{position:fixed;transform:translateX(-100%)}#nav.open{transform:none}#main,#view,.work{margin-left:0!important;padding-left:12px!important;padding-right:12px!important}.today{grid-template-columns:1fr!important}}</style>`;

  const settingsBridge = `<script>(function(){var KEY="larpcity.stripe.settings.${payload.x.id.replace(/"/g, "")}";function load(){try{return JSON.parse(localStorage.getItem(KEY)||"{}")||{}}catch(e){return{}}}function save(patch){var next=Object.assign(load(),patch||{},{_updatedAt:Date.now()});try{localStorage.setItem(KEY,JSON.stringify(next))}catch(e){}return next}window.__LC_LOAD_SETTINGS=load;window.__LC_SAVE_SETTINGS=save;})();</script>`;

  const exit = `<style>#lc-exit{position:fixed;bottom:56px;right:12px;z-index:99999;font:12px/1 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end;max-width:calc(100vw - 24px)}#lc-exit a{display:inline-flex;align-items:center;gap:6px;padding:8px 12px;border-radius:999px;background:#1a2c44;color:#fff;text-decoration:none;box-shadow:0 8px 20px rgba(0,0,0,.18);opacity:.9}#lc-exit a.secondary{background:#635bff}#lc-exit a:hover{opacity:1}</style><div id="lc-exit"><a class="secondary" href="/platforms/stripe/new?edit=${encodeURIComponent(payload.x.id)}" target="_parent" rel="noopener">Edit amounts</a><a href="/larps" target="_parent" rel="noopener">← My LARPs</a></div>`;
  html = html.replace("</body>", `${responsive}${settingsBridge}${exit}</body>`);

  return html;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
