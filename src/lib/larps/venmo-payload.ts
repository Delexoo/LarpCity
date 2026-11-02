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
  [key: string]: unknown;
};

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
  // Values like 342.18 → cents; big integers already cents-ish stay as-is if huge
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

  return {
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
  if (opts.mobile) {
    html = html.replace(
      'var A = "/larp-assets/venmo-mobile"',
      'var A = "/larp-assets/venmo-desktop"',
    );
    html = html.replace(
      /function stickerUrl\(k\) \{ return A \+ "\/stickers\/" \+ k \+ "\.webp"; \}/,
      'function stickerUrl(k) { return ""; }',
    );
  }

  // Drop remote larplabs PWA tags so home-screen install uses our Venmo logo.
  html = html.replace(
    /<link rel="manifest"[^>]*>/gi,
    '<link rel="manifest" href="/api/pwa/manifest/' +
      encodeURIComponent(payload.S.id) +
      '?name=Venmo&slug=venmo">',
  );
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
</style>
<link rel="icon" href="/larp-assets/venmo-desktop/favicon.svg"/>
<link rel="apple-touch-icon" href="/brand-logos/venmo.png"/>`
    : `<style id="lc-venmo-fit">
html,body{min-height:100%;margin:0;background:#fff}
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
