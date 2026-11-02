import { moneyToCents } from "./money";
import { hashSeed, mulberry32 } from "./realistic";

export type YoutubeDesktopPayload = {
  S: {
    v: number;
    id: string;
    name: string;
    handle: string;
    ucid: string;
    avatar: string;
    banner: string;
    theme: string;
    monetized: boolean;
    country: string;
    countryName: string;
    niche: string;
    vibe: string;
    subs: number;
    totalVideos: number;
    range: number;
    ai: boolean;
    preview: boolean;
    now: number;
    today: number;
    H: number;
    age: number;
    life: { vw: number; wh: number; rv: number };
    rpm: number;
    cpm: number;
    pcpm: number;
    vpv: number;
  };
  D: Record<string, number[]>;
  V: unknown[];
  AU: Record<string, unknown>;
  C: unknown[];
  SUBS: unknown[];
  [key: string]: unknown;
};

export type YoutubeMobilePayload = {
  tab?: string;
  today: number;
  channel: {
    name: string;
    handle: string;
    avatar: string;
    subs: number;
    views: number;
    videos: number;
    monetized: boolean;
    country: string;
    countryName: string;
    joined: number;
    copyright: number;
    ageRestricted: number;
    light: boolean;
  };
  cfg: {
    vpv: number;
    rpm: number;
    pcpm: number;
    shortAvd: number;
    swiped: number;
    monthlyAudience: number;
    comments28: number;
  };
  life: {
    tot: Record<string, number>;
    m0: number;
    [key: string]: unknown;
  };
  videos: unknown[];
  [key: string]: unknown;
};

const COUNTRY_NAMES: Record<string, string> = {
  US: "United States",
  GB: "United Kingdom",
  CA: "Canada",
  AU: "Australia",
  DE: "Germany",
  IN: "India",
  BR: "Brazil",
  JP: "Japan",
};

function parseCount(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.round(value));
  }
  const n = Number.parseFloat(String(value ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? Math.max(0, Math.round(n)) : fallback;
}

function parseMoneyUsd(value: unknown, fallback: number): number {
  const cents = moneyToCents(value);
  if (cents > 0) return cents / 100;
  const n = Number.parseFloat(String(value ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function scaleSeries(arr: unknown, factor: number): number[] {
  if (!Array.isArray(arr)) return [];
  return arr.map((v) => {
    const n = typeof v === "number" ? v : Number(v);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.round(n * factor));
  });
}

function normalizeHandle(raw: string): string {
  const h = raw.trim().replace(/^@+/, "");
  return h || "channel";
}

function initialFrom(name: string): string {
  const t = name.trim();
  if (!t) return "Y";
  return t[0]!.toUpperCase();
}

function hueFrom(seed: string): number {
  return hashSeed(seed) % 360;
}

/** Default circular avatar when no custom URL is provided. */
export function youtubeAvatarDataUri(name: string, seed = name): string {
  const letter = encodeURIComponent(initialFrom(name));
  const hue = hueFrom(seed);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="120" height="120" rx="60" fill="hsl(${hue},58%,46%)"/><text x="50%" y="50%" dy="0.35em" text-anchor="middle" font-family="-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif" font-size="50" font-weight="600" fill="#fff">${letter}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg).replace(/%20/g, "%20")}`;
}

function scaleDesktopVideos(videos: unknown[], factor: number): unknown[] {
  return videos.map((row) => {
    if (!row || typeof row !== "object") return row;
    const v = { ...(row as Record<string, unknown>) };
    for (const k of ["vw", "lk", "dl", "cm", "im", "wh", "sg", "rv", "d28", "o"]) {
      if (typeof v[k] === "number") {
        v[k] = Math.max(0, Math.round((v[k] as number) * factor));
      }
    }
    if (Array.isArray(v.dy)) v.dy = scaleSeries(v.dy, factor);
    if (Array.isArray(v.h48)) v.h48 = scaleSeries(v.h48, factor);
    if (Array.isArray(v.rs)) v.rs = scaleSeries(v.rs, factor);
    return v;
  });
}

function scaleMobileVideos(videos: unknown[], factor: number): unknown[] {
  return videos.map((row) => {
    if (!row || typeof row !== "object") return row;
    const v = { ...(row as Record<string, unknown>) };
    for (const k of ["v", "l", "dl", "c", "im", "wh", "sg", "rev", "d28"]) {
      if (typeof v[k] === "number") {
        v[k] = Math.max(0, Math.round((v[k] as number) * factor));
      }
    }
    if (Array.isArray(v.rs)) v.rs = scaleSeries(v.rs, factor);
    if (Array.isArray(v.h48)) v.h48 = scaleSeries(v.h48, factor);
    if (Array.isArray(v.s90)) v.s90 = scaleSeries(v.s90, factor);
    return v;
  });
}

export function buildYoutubeDesktopPayload(
  base: YoutubeDesktopPayload,
  data: Record<string, unknown>,
  opts?: { id?: string; title?: string },
): YoutubeDesktopPayload {
  const channelName =
    String(data.channelName || data.businessName || opts?.title || base.S.name)
      .trim() || "Channel";
  const handle = `@${normalizeHandle(String(data.handle || base.S.handle || channelName))}`;
  const country = String(data.country || base.S.country || "US").toUpperCase();
  const theme =
    String(data.theme || base.S.theme || "dark").toLowerCase() === "light"
      ? "light"
      : "dark";
  const subs = parseCount(data.subscribers ?? data.subs, base.S.subs);
  const views = parseCount(
    data.lifetimeViews ?? data.views,
    base.S.life?.vw || 1,
  );
  const uploads = parseCount(
    data.totalUploads ?? data.videos,
    base.S.totalVideos,
  );
  const rpm = Number.parseFloat(String(data.rpm ?? base.S.rpm)) || base.S.rpm;
  const monthly =
    parseMoneyUsd(data.monthlyRevenue, (base.S.life?.rv || 0) / 12) || 0;
  const lifeRv = monthly > 0 ? monthly * 12 : base.S.life?.rv || 0;
  const monetized =
    data.monetized === false || data.monetized === "false"
      ? false
      : data.monetized === true || data.monetized === "true"
        ? true
        : Boolean(base.S.monetized);
  const avatar =
    String(data.avatarUrl || data.avatar || "").trim() ||
    youtubeAvatarDataUri(channelName, opts?.id || channelName);

  const viewFactor =
    (base.S.life?.vw || 0) > 0 ? views / (base.S.life.vw || 1) : 1;
  const subFactor = base.S.subs > 0 ? subs / base.S.subs : 1;
  const revFactor =
    (base.S.life?.rv || 0) > 0 ? lifeRv / (base.S.life.rv || 1) : 1;
  const seed = hashSeed(`${opts?.id || base.S.id}|${channelName}|${subs}|${views}`);
  const rand = mulberry32(seed);
  void rand;

  const D: Record<string, number[]> = {};
  for (const [k, series] of Object.entries(base.D || {})) {
    const f =
      k === "sg" || k === "sl"
        ? subFactor
        : k === "rv"
          ? revFactor
          : viewFactor;
    D[k] = scaleSeries(series, f);
  }

  const now = Date.now();
  const day = 86_400_000;
  const today = now - (now % day);

  return {
    ...base,
    S: {
      ...base.S,
      id: opts?.id || base.S.id,
      name: channelName,
      handle,
      avatar,
      theme,
      monetized,
      country,
      countryName: COUNTRY_NAMES[country] || base.S.countryName || country,
      niche: String(data.niche || base.S.niche || "TECH").toUpperCase(),
      vibe: String(data.vibe || base.S.vibe || "STEADY").toUpperCase(),
      subs,
      totalVideos: uploads,
      range: parseCount(data.range, base.S.range || 28),
      ai: data.ai === false || data.ai === "false" ? false : true,
      preview: false,
      now,
      today,
      life: {
        vw: views,
        wh: Math.round((base.S.life?.wh || views * 0.06) * viewFactor),
        rv: Math.round(lifeRv * 100) / 100,
      },
      rpm: Math.round(rpm * 100) / 100,
    },
    D,
    V: scaleDesktopVideos(Array.isArray(base.V) ? base.V : [], viewFactor),
  };
}

export function buildYoutubeMobilePayload(
  base: YoutubeMobilePayload,
  data: Record<string, unknown>,
  opts?: { id?: string; title?: string },
): YoutubeMobilePayload {
  const channelName =
    String(
      data.channelName || data.businessName || opts?.title || base.channel.name,
    ).trim() || "Channel";
  const handle = normalizeHandle(
    String(data.handle || base.channel.handle || channelName),
  );
  const country = String(
    data.country || base.channel.country || "US",
  ).toUpperCase();
  const light =
    String(data.theme || (base.channel.light ? "light" : "dark")).toLowerCase() ===
    "light";
  const subs = parseCount(data.subscribers ?? data.subs, base.channel.subs);
  const views = parseCount(
    data.lifetimeViews ?? data.views,
    base.channel.views || 1,
  );
  const uploads = parseCount(
    data.totalUploads ?? data.videos,
    base.channel.videos,
  );
  const rpm =
    Number.parseFloat(String(data.rpm ?? base.cfg.rpm)) || base.cfg.rpm;
  const monthly = parseMoneyUsd(
    data.monthlyRevenue,
    (base.life?.tot?.r || 0) / 12,
  );
  const lifeR = monthly > 0 ? monthly * 12 : base.life?.tot?.r || 0;
  const monetized =
    data.monetized === false || data.monetized === "false"
      ? false
      : data.monetized === true || data.monetized === "true"
        ? true
        : Boolean(base.channel.monetized);
  const avatar =
    String(data.avatarUrl || data.avatar || "").trim() ||
    youtubeAvatarDataUri(channelName, opts?.id || channelName);

  const viewFactor = base.channel.views > 0 ? views / base.channel.views : 1;
  const subFactor = base.channel.subs > 0 ? subs / base.channel.subs : 1;
  const revFactor =
    (base.life?.tot?.r || 0) > 0 ? lifeR / (base.life.tot.r || 1) : 1;

  const lifeSeries: Record<string, unknown> = { ...(base.life || {}) };
  for (const k of ["v", "sh", "w", "ws", "s", "r", "im"]) {
    if (Array.isArray(lifeSeries[k])) {
      const f = k === "s" ? subFactor : k === "r" ? revFactor : viewFactor;
      lifeSeries[k] = scaleSeries(lifeSeries[k], f);
    }
  }
  const tot = { ...(base.life?.tot || {}) };
  tot.v = views;
  tot.s = subs;
  tot.r = Math.round(lifeR * 100) / 100;
  if (typeof tot.sv === "number") tot.sv = Math.round(tot.sv * viewFactor);
  if (typeof tot.w === "number") tot.w = Math.round(tot.w * viewFactor);
  if (typeof tot.sw === "number") tot.sw = Math.round(tot.sw * viewFactor);
  if (typeof tot.sg === "number") tot.sg = Math.round(tot.sg * subFactor);
  if (typeof tot.sl === "number") tot.sl = Math.round(tot.sl * subFactor);
  if (typeof tot.im === "number") tot.im = Math.round(tot.im * viewFactor);
  lifeSeries.tot = tot;

  const now = Date.now();
  const day = 86_400_000;

  return {
    ...base,
    today: now - (now % day),
    channel: {
      ...base.channel,
      name: channelName,
      handle,
      avatar,
      subs,
      views,
      videos: uploads,
      monetized,
      country,
      countryName: COUNTRY_NAMES[country] || base.channel.countryName || country,
      copyright: parseCount(data.copyright, base.channel.copyright || 0),
      ageRestricted: parseCount(
        data.ageRestricted,
        base.channel.ageRestricted || 0,
      ),
      light,
    },
    cfg: {
      ...base.cfg,
      rpm: Math.round(rpm * 1000) / 1000,
      monthlyAudience: Math.round(
        (base.cfg.monthlyAudience || subs) * Math.max(0.2, subFactor),
      ),
      comments28: Math.round((base.cfg.comments28 || 1000) * viewFactor),
    },
    life: lifeSeries as YoutubeMobilePayload["life"],
    videos: scaleMobileVideos(
      Array.isArray(base.videos) ? base.videos : [],
      viewFactor,
    ),
  };
}

export function injectYoutubeViewerHtml(
  template: string,
  payload: YoutubeDesktopPayload | YoutubeMobilePayload,
  opts: { mobile: boolean; channelName: string; theme: "dark" | "light" },
): string {
  let html = template;
  const title = opts.mobile
    ? "YouTube Studio"
    : `Channel dashboard - YouTube Studio`;
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`);
  const bodyClass = opts.theme === "light" ? "lt" : "dk";
  html = html.replace(/<body class="[^"]*">/, `<body class="${bodyClass}">`);
  html = html.replace(
    /<script id="payload" type="application\/json">[\s\S]*?<\/script>/,
    `<script id="payload" type="application/json">${JSON.stringify(payload)}</script>`,
  );
  return html;
}
