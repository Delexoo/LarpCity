export type ReceiptKind = "SEND" | "RECEIVE" | "BUY" | "SELL";
export type ReceiptProvider = "COINBASE" | "VENMO" | "CASHAPP" | "STRIPE";
export type ReceiptAsset =
  | "BTC"
  | "ETH"
  | "SOL"
  | "USDC"
  | "USDT"
  | "DOGE"
  | "XRP";

export type ReceiptData = {
  name: string;
  provider: ReceiptProvider;
  kind: ReceiptKind;
  asset: ReceiptAsset;
  amountUsd: number;
  amountUnits: number | null;
  counterparty: string | null;
  memo: string | null;
  occurredAt?: number;
  txId?: string;
};

/** Rough spot prices for auto unit conversion when units are left blank. */
export const APPROX_USD: Record<ReceiptAsset, number> = {
  BTC: 95_000,
  ETH: 3_400,
  SOL: 180,
  USDC: 1,
  USDT: 1,
  DOGE: 0.18,
  XRP: 2.4,
};

export function parseReceiptData(
  data: Record<string, unknown>,
  meta: { title: string },
): ReceiptData {
  const asset = String(data.asset || "BTC").toUpperCase() as ReceiptAsset;
  const safeAsset = (APPROX_USD[asset] ? asset : "BTC") as ReceiptAsset;
  const amountUsd = Number(data.amountUsd ?? data.balance ?? 50_000) || 50_000;
  let amountUnits =
    data.amountUnits === "" || data.amountUnits == null
      ? null
      : Number(data.amountUnits);
  if (amountUnits != null && !Number.isFinite(amountUnits)) amountUnits = null;

  return {
    name: String(data.name || meta.title || "Receipt").trim() || "Receipt",
    provider: (String(data.provider || "COINBASE").toUpperCase() ||
      "COINBASE") as ReceiptProvider,
    kind: (String(data.kind || "SEND").toUpperCase() || "SEND") as ReceiptKind,
    asset: safeAsset,
    amountUsd,
    amountUnits,
    counterparty: String(data.counterparty || "").trim() || null,
    memo: String(data.memo || "").trim() || null,
    occurredAt: Number(data.occurredAt) || Date.now() - 1000 * 60 * 12,
    txId: String(data.txId || "").trim() || undefined,
  };
}

export function resolveUnits(r: ReceiptData): number {
  if (r.amountUnits != null && r.amountUnits > 0) return r.amountUnits;
  const px = APPROX_USD[r.asset] || 1;
  const raw = r.amountUsd / px;
  if (r.asset === "BTC" || r.asset === "ETH") return Number(raw.toFixed(8));
  if (r.asset === "SOL" || r.asset === "XRP") return Number(raw.toFixed(6));
  if (r.asset === "DOGE") return Number(raw.toFixed(2));
  return Number(raw.toFixed(2));
}

export function headline(kind: ReceiptKind): string {
  switch (kind) {
    case "RECEIVE":
      return "You received";
    case "BUY":
      return "You bought";
    case "SELL":
      return "You sold";
    default:
      return "You sent";
  }
}

export function directionLabel(kind: ReceiptKind): string {
  switch (kind) {
    case "RECEIVE":
      return "From";
    case "BUY":
      return "Paid with";
    case "SELL":
      return "Sold for";
    default:
      return "To";
  }
}

function money(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function unitsFmt(n: number, asset: string): string {
  const s =
    n >= 1000
      ? n.toLocaleString("en-US", { maximumFractionDigits: 2 })
      : n.toLocaleString("en-US", {
          maximumFractionDigits: 8,
          minimumFractionDigits: 0,
        });
  return `${s} ${asset}`;
}

function shortId(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return `0x${h.toString(16).padStart(8, "0")}…${((h * 7) >>> 0)
    .toString(16)
    .slice(0, 4)}`;
}

function fmtWhen(ts: number): string {
  try {
    return new Date(ts).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "Just now";
  }
}

/** Standalone Coinbase-style confirmation (mobile + centered phone on desktop). */
export function buildCoinbaseReceiptHtml(
  data: Record<string, unknown>,
  meta: { id: string; title: string },
): string {
  const r = parseReceiptData(data, meta);
  const units = resolveUnits(r);
  const who =
    r.counterparty ||
    (r.kind === "SEND"
      ? "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
      : r.kind === "RECEIVE"
        ? "Anonymous"
        : "Cash (USD)");
  const whoShort =
    who.length > 22 ? `${who.slice(0, 10)}…${who.slice(-6)}` : who;
  const tx = r.txId || shortId(meta.id + r.asset + r.amountUsd);
  const when = fmtWhen(r.occurredAt || Date.now());
  const head = headline(r.kind);
  const dir = directionLabel(r.kind);
  const fee =
    r.kind === "BUY" || r.kind === "SELL"
      ? money(Math.max(0.99, r.amountUsd * 0.0049))
      : `${(units * 0.00012).toPrecision(3)} ${r.asset}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"/>
<title>${escapeHtml(r.name)} – Receipt</title>
<link rel="icon" href="/brand-logos/coinbase.png"/>
<link rel="apple-touch-icon" href="/brand-logos/coinbase.png"/>
<meta name="theme-color" content="#0052FF"/>
<meta name="apple-mobile-web-app-capable" content="yes"/>
<meta name="apple-mobile-web-app-title" content="Coinbase"/>
<style>
  :root {
    --bg:#0a0b0d; --card:#141519; --fg:#fff; --mut:#8a919e; --line:#23262f;
    --blue:#0052FF; --ok:#0A7D3B; --ok-soft:#0f2a1c;
  }
  *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
  html,body{height:100%;margin:0;background:var(--bg);color:var(--fg);
    font:15px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif}
  #app{min-height:100%;display:flex;flex-direction:column;max-width:430px;margin:0 auto;
    padding:env(safe-area-inset-top,12px) 20px calc(20px + env(safe-area-inset-bottom,0))}
  @media (min-width:560px){
    html{background:#06070a}
    #app{min-height:calc(100% - 32px);margin:16px auto;border-radius:28px;overflow:hidden;
      box-shadow:0 20px 60px rgba(0,0,0,.5);border:1px solid #1c1f27}
  }
  .top{display:flex;align-items:center;justify-content:space-between;padding:8px 0 4px}
  .brand{display:flex;align-items:center;gap:8px;font-weight:650;letter-spacing:-.02em}
  .brand img{width:22px;height:22px;border-radius:6px}
  .done{border:0;background:transparent;color:var(--blue);font:600 15px/1 inherit;padding:8px}
  .hero{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px 8px 12px}
  .badge{width:72px;height:72px;border-radius:50%;background:var(--ok-soft);display:grid;place-items:center;margin-bottom:22px;
    box-shadow:0 0 0 10px rgba(10,125,59,.12)}
  .badge svg{width:34px;height:34px}
  h1{margin:0;font-size:22px;font-weight:650;letter-spacing:-.03em}
  .units{margin-top:8px;font-size:28px;font-weight:700;letter-spacing:-.04em}
  .usd{margin-top:6px;color:var(--mut);font-size:16px}
  .card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:6px 16px;margin-top:8px}
  .row{display:flex;justify-content:space-between;gap:16px;padding:14px 0;border-bottom:1px solid var(--line)}
  .row:last-child{border-bottom:0}
  .row span{color:var(--mut)}
  .row b{font-weight:600;text-align:right;word-break:break-all}
  .memo{margin-top:14px;padding:14px 16px;border-radius:14px;background:var(--card);border:1px solid var(--line);color:var(--mut);font-size:14px}
  .foot{margin-top:18px;display:grid;gap:10px}
  .btn{appearance:none;border:0;border-radius:999px;padding:14px 18px;font:650 15px/1 inherit;cursor:pointer}
  .btn.pri{background:var(--blue);color:#fff}
  .btn.sec{background:transparent;color:var(--fg);border:1px solid var(--line)}
  .status{display:inline-flex;align-items:center;gap:6px;color:#3DDC84;font-weight:650}
  .dot{width:7px;height:7px;border-radius:50%;background:#3DDC84}
</style>
</head>
<body>
<div id="app">
  <div class="top">
    <div class="brand"><img src="/brand-logos/coinbase.png" alt=""/><span>Coinbase</span></div>
    <button class="done" type="button" onclick="history.back()">Done</button>
  </div>
  <div class="hero">
    <div class="badge" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#3DDC84" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </div>
    <h1>${escapeHtml(head)}</h1>
    <div class="units">${escapeHtml(unitsFmt(units, r.asset))}</div>
    <div class="usd">${escapeHtml(money(r.amountUsd))}</div>
  </div>
  <div class="card">
    <div class="row"><span>Status</span><b class="status"><i class="dot"></i>Completed</b></div>
    <div class="row"><span>${escapeHtml(dir)}</span><b>${escapeHtml(whoShort)}</b></div>
    <div class="row"><span>Date</span><b>${escapeHtml(when)}</b></div>
    <div class="row"><span>Network fee</span><b>${escapeHtml(fee)}</b></div>
    <div class="row"><span>Transaction</span><b>${escapeHtml(tx)}</b></div>
  </div>
  ${r.memo ? `<div class="memo">${escapeHtml(r.memo)}</div>` : ""}
  <div class="foot">
    <button class="btn pri" type="button">Share receipt</button>
    <button class="btn sec" type="button">View on Coinbase</button>
  </div>
</div>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
