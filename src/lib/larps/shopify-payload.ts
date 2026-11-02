import { currencyMeta, moneyToCents } from "./money";
import { hashSeed } from "./realistic";

export type ShopifyPayload = {
  st: {
    name: string;
    ini: string;
    logo: string;
    cur: string;
    sym: string;
    country: string;
    loc: string;
    dec: number;
    tag: string;
    cname: string;
    handle: string;
    off: number;
    now: number;
    day0: number;
    n: number;
    frac: number;
    hist: number;
    custTotal: number;
    lastN: number;
    payout: number;
    preview: boolean;
    pops: boolean;
  };
  d: Record<string, number[]>;
  hr: unknown;
  ord: unknown[];
  cus: unknown[];
  pro: unknown[];
  pay: unknown[];
  live: {
    visitors: number;
    carts: number;
    checkingOut: number;
    purchased: number;
  };
  [key: string]: unknown;
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

function parseCount(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.round(value));
  }
  const n = Number.parseFloat(String(value ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? Math.max(0, Math.round(n)) : fallback;
}

function scaleSeries(arr: unknown, factor: number): number[] {
  if (!Array.isArray(arr)) return [];
  return arr.map((v) => {
    const n = typeof v === "number" ? v : Number(v);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.round(n * factor));
  });
}

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "S";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] || ""}${parts[1]![0] || ""}`.toUpperCase();
}

function slugHandle(raw: string): string {
  return (
    raw
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "store"
  );
}

function avgSeries(arr: number[]): number {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function scaleOrders(orders: unknown[], moneyFactor: number): unknown[] {
  return orders.map((row) => {
    if (!Array.isArray(row)) return row;
    const next = [...row];
    // indices from sample: [id, ts, items?, lines, ?, ?, ?, ?, shippingLabel, shipping?, taxRate?, total, ...]
    for (const i of [4, 9, 11]) {
      if (typeof next[i] === "number") {
        next[i] = Math.max(0, Math.round((next[i] as number) * moneyFactor));
      }
    }
    const lines = next[3];
    if (lines && typeof lines === "object" && Array.isArray((lines as { value?: unknown }).value)) {
      const value = ((lines as { value: unknown[] }).value || []).map((line) => {
        if (!Array.isArray(line)) return line;
        const l = [...line];
        if (typeof l[2] === "number") {
          l[2] = Math.max(0, Math.round((l[2] as number) * moneyFactor));
        }
        return l;
      });
      next[3] = { ...(lines as object), value };
    }
    return next;
  });
}

function scaleProducts(products: unknown[], moneyFactor: number, salesFactor: number): unknown[] {
  return products.map((row) => {
    if (!Array.isArray(row)) return row;
    const next = [...row];
    // [name, priceCents, ?, inventory?, ?, variants, type, vendor, sku, status, sold?, created, ?]
    if (typeof next[1] === "number") {
      next[1] = Math.max(0, Math.round((next[1] as number) * moneyFactor));
    }
    if (typeof next[10] === "number") {
      next[10] = Math.max(0, Math.round((next[10] as number) * salesFactor));
    }
    return next;
  });
}

function scaleCustomers(customers: unknown[], moneyFactor: number): unknown[] {
  return customers.map((row) => {
    if (!Array.isArray(row)) return row;
    const next = [...row];
    // [name, email, phone, city, state, ts, orders, spendCents, ...]
    if (typeof next[7] === "number") {
      next[7] = Math.max(0, Math.round((next[7] as number) * moneyFactor));
    }
    return next;
  });
}

function scalePayouts(payouts: unknown[], moneyFactor: number): unknown[] {
  return payouts.map((row) => {
    if (!Array.isArray(row)) return row;
    const next = [...row];
    for (let i = 0; i < next.length; i++) {
      if (typeof next[i] === "number" && (next[i] as number) > 100) {
        // Heuristic: larger ints are cents amounts
        next[i] = Math.max(0, Math.round((next[i] as number) * moneyFactor));
      }
    }
    return next;
  });
}

/** Build Shopify admin payload from form/local LARP data + base reference. */
export function buildShopifyPayload(
  base: ShopifyPayload,
  data: Record<string, unknown>,
  opts?: { id?: string; title?: string },
): ShopifyPayload {
  const storeName =
    String(data.storeName || data.businessName || opts?.title || base.st.name)
      .trim() || "Store";
  const { cur, sym } = currencyMeta(data.currency || base.st.cur);
  const country = String(data.country || base.st.country || "US").toUpperCase();
  const handle = slugHandle(
    String(data.handle || base.st.handle || storeName),
  );

  const payoutCents =
    moneyToCents(data.payout ?? data.balance) || base.st.payout || 0;
  const todaySalesCents =
    moneyToCents(data.todaySales) ||
    Math.round(avgSeries(base.d?.s || []) || 30_000);
  const baseToday = avgSeries(base.d?.s || []) || 1;
  const salesFactor = Math.max(0.05, todaySalesCents / baseToday);
  const moneyFactor = salesFactor;
  const custTotal = parseCount(data.customers ?? data.custTotal, base.st.custTotal);

  const seed = hashSeed(`${opts?.id || handle}|${storeName}|${payoutCents}|${todaySalesCents}`);
  void seed;

  const d: Record<string, number[]> = {};
  for (const [k, series] of Object.entries(base.d || {})) {
    const f =
      k === "o" || k === "nc" || k === "rc" || k === "u" || k === "se"
        ? salesFactor
        : moneyFactor;
    d[k] = scaleSeries(series, f);
  }

  const now = Date.now();
  const liveBase = base.live || {
    visitors: 5,
    carts: 1,
    checkingOut: 0,
    purchased: 7,
  };

  return {
    ...base,
    st: {
      ...base.st,
      name: storeName,
      ini: initialsFrom(storeName),
      logo: String(data.logoUrl || data.logo || base.st.logo || ""),
      cur,
      sym,
      country,
      loc: country === "US" ? "en-US" : base.st.loc || "en-US",
      tag: `${cur} ${sym}`,
      cname: COUNTRY_NAMES[country] || base.st.cname || country,
      handle,
      now,
      custTotal,
      payout: payoutCents,
      preview: false,
      pops: data.pops === false || data.pops === "false" ? false : true,
    },
    d,
    ord: scaleOrders(Array.isArray(base.ord) ? base.ord : [], moneyFactor),
    cus: scaleCustomers(Array.isArray(base.cus) ? base.cus : [], moneyFactor),
    pro: scaleProducts(
      Array.isArray(base.pro) ? base.pro : [],
      Math.sqrt(moneyFactor),
      salesFactor,
    ),
    pay: scalePayouts(Array.isArray(base.pay) ? base.pay : [], moneyFactor),
    live: {
      visitors: Math.max(1, Math.round(liveBase.visitors * Math.sqrt(salesFactor))),
      carts: Math.max(0, Math.round(liveBase.carts * Math.sqrt(salesFactor))),
      checkingOut: Math.max(
        0,
        Math.round(liveBase.checkingOut * Math.sqrt(salesFactor)),
      ),
      purchased: Math.max(
        0,
        Math.round(liveBase.purchased * Math.sqrt(salesFactor)),
      ),
    },
  };
}

export function injectShopifyViewerHtml(
  template: string,
  payload: ShopifyPayload,
  opts: { mobile: boolean },
): string {
  let html = template;
  const name = payload.st.name || "Store";
  html = html.replace(
    /<title>[\s\S]*?<\/title>/,
    opts.mobile
      ? `<title>Shopify</title>`
      : `<title>Home · ${name} · Shopify</title>`,
  );
  html = html.replace(
    /<script id="payload" type="application\/json">[\s\S]*?<\/script>/,
    `<script id="payload" type="application/json">${JSON.stringify(payload)}</script>`,
  );
  return html;
}
