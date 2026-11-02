import { hashSeed, mulberry32 } from "./realistic";

export type InstagramHighlight = string | { title: string; color?: string; color2?: string };
export type InstagramGridItem = {
  src?: string;
  color?: string;
  color2?: string;
  multi?: boolean;
  video?: boolean;
};

export type InstagramPayload = {
  username: string;
  fullName: string;
  bio: string;
  link?: string;
  posts: number;
  followers: number;
  following: number;
  initials?: string;
  avatarUrl?: string;
  avatarSymbol?: string;
  avatarBg?: string;
  avatarFg?: string;
  note?: string;
  reelsBadge?: number;
  highlights: InstagramHighlight[];
  grid: InstagramGridItem[];
};

const FIRST = [
  "Ava", "Noah", "Mia", "Liam", "Zoe", "Kai", "Iris", "Leo", "Nora", "Ezra",
  "Ruby", "Omar", "Luna", "Theo", "Skye", "Jude", "Vera", "Cole", "June", "Remy",
  "Miles", "Elena", "Felix", "Sienna", "Hugo", "Clara", "Adrian", "Ivy", "Marcus", "Nina",
];

const LAST = [
  "Hayes", "Quill", "Voss", "Lane", "Park", "Reed", "Cruz", "Shaw", "Beck", "North",
  "Vale", "Stone", "West", "Chen", "Brooks", "Ortiz", "Kim", "Frost", "Wells", "Gray",
];

const HANDLE_BITS = [
  "only", "just", "the", "real", "its", "hey", "daily", "studio", "labs", "co",
  "hq", "now", "off", "on",
];

const BIO_LINES = [
  (a: string, b: string) => `@${a} alumni 💻 / @${b} cybersecurity 🎓`,
  (a: string, b: string) => `product @${a} · previously @${b}`,
  (a: string, b: string) => `building @${a}\n${b} · dm for collabs`,
  (a: string, b: string) => `@${a} research · @${b} online`,
  (a: string) => `nyc ↔ sf\nshipping quietly · @${a}`,
  (a: string) => `founder · @${a}\nphotos & notes`,
  (a: string, b: string) => `${a} · design systems\n@${b}`,
  (a: string) => `engineer @${a}\nviews are my own`,
];

const ORGS = [
  "cs50", "stanfordonline", "mitx", "harvardonline", "figma", "vercel", "stripe",
  "notionhq", "linear", "openai", "anthropic", "github", "spotify", "a16z",
];

const CITIES = ["nyc", "sf", "la", "austin", "miami", "chicago", "seattle", "boston"];

const HL_TITLES = [
  "Work", "Travel", "Gym", "Food", "Cars", "Labs", "Build", "Life", "Friends",
  "Events", "Campus", "Studio", "Recaps", "Gear", "Weekends",
];

const AVATAR_SYMBOLS = [";", "✦", "◆", "◎", "△", "◇", "●", "□", "♂", "♀", "∞", "·"];
const AVATAR_BGS = ["#ffffff", "#f5f5f5", "#e8e8e8", "#1a1a1a", "#262626", "#0095f6", "#e1306c"];
const AVATAR_FGS = ["#000000", "#121212", "#ffffff", "#fafafa"];

const HL_COLORS: [string, string][] = [
  ["#3a3a3a", "#1a1a1a"],
  ["#ffffff", "#d4d4d4"],
  ["#2d3436", "#636e72"],
  ["#6c5ce7", "#a29bfe"],
  ["#00b894", "#55efc4"],
  ["#e17055", "#fdcb6e"],
  ["#0984e3", "#74b9ff"],
  ["#d63031", "#ff7675"],
];

function pick<T>(rand: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)]!;
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 12);
}

export function generateRandomInstagram(seed?: string): InstagramPayload {
  const rand = mulberry32(
    seed ? hashSeed(seed) : (Math.random() * 1e9) >>> 0,
  );
  const first = pick(rand, FIRST);
  const last = pick(rand, LAST);
  const initial = last[0] || "M";
  const fullName =
    rand() < 0.55 ? `${first} ${initial}.` : `${first} ${last}`;

  const handleStyle = Math.floor(rand() * 4);
  let username = "";
  if (handleStyle === 0) {
    username = `${pick(rand, HANDLE_BITS)}${slugify(first)}${slugify(last).slice(0, 4)}`;
  } else if (handleStyle === 1) {
    username = `${slugify(first)}.${slugify(last)}`;
  } else if (handleStyle === 2) {
    username = `${pick(rand, HANDLE_BITS)}${slugify(first)}${Math.floor(rand() * 90 + 10)}`;
  } else {
    username = `${slugify(first)}${slugify(last)}${Math.floor(rand() * 9 + 1)}`;
  }

  const orgA = pick(rand, ORGS);
  let orgB = pick(rand, ORGS);
  while (orgB === orgA) orgB = pick(rand, ORGS);
  const bioFn = pick(rand, BIO_LINES);
  const bio = bioFn(orgA, orgB).replace(/\bnyc\b/i, pick(rand, CITIES));

  const followers =
    rand() < 0.7
      ? 80 + Math.floor(rand() * 920)
      : 1200 + Math.floor(rand() * 18000);
  const following = 120 + Math.floor(rand() * 1400);

  const hlCount = 3 + Math.floor(rand() * 3);
  const usedTitles = new Set<string>();
  const highlights: InstagramHighlight[] = [];
  while (highlights.length < hlCount) {
    const title = pick(rand, HL_TITLES);
    if (usedTitles.has(title)) continue;
    usedTitles.add(title);
    const [color, color2] = pick(rand, HL_COLORS);
    highlights.push({ title, color, color2 });
  }

  const bg = pick(rand, AVATAR_BGS);
  let fg = pick(rand, AVATAR_FGS);
  if (bg === "#ffffff" || bg === "#f5f5f5" || bg === "#e8e8e8") fg = "#000000";
  if (bg === "#1a1a1a" || bg === "#262626") fg = "#ffffff";

  return {
    username,
    fullName,
    bio,
    link: rand() < 0.35 ? `${slugify(first)}${slugify(last)}.dev` : undefined,
    posts: 0,
    followers,
    following,
    initials: `${first[0] || "I"}${last[0] || "G"}`.toUpperCase(),
    avatarSymbol: pick(rand, AVATAR_SYMBOLS),
    avatarBg: bg,
    avatarFg: fg,
    note: rand() < 0.55 ? "Note..." : undefined,
    reelsBadge: rand() < 0.6 ? 1 + Math.floor(rand() * 9) : 0,
    highlights,
    grid: [],
  };
}

/** Default = fresh random profile with empty posts grid. */
export const DEFAULT_INSTAGRAM: InstagramPayload = generateRandomInstagram("default-ig-v2");

function num(v: unknown, fallback: number): number {
  if (typeof v === "number" && Number.isFinite(v)) return Math.max(0, Math.round(v));
  const n = Number(String(v ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? Math.max(0, Math.round(n)) : fallback;
}

export function buildInstagramPayload(
  data: Record<string, unknown>,
): InstagramPayload {
  const base =
    Object.keys(data).length === 0
      ? generateRandomInstagram()
      : DEFAULT_INSTAGRAM;

  const username = String(
    data.username || data.handle || base.username,
  )
    .replace(/^@/, "")
    .trim() || base.username;
  const fullName = String(
    data.fullName || data.displayName || data.businessName || base.fullName,
  ).trim();
  const bio = String(data.bio ?? base.bio);
  const link =
    data.link != null && String(data.link).trim()
      ? String(data.link).trim()
      : undefined;
  const posts = num(data.posts, 0);
  const followers = num(data.followers, base.followers);
  const following = num(data.following, base.following);
  const initials = String(
    data.initials ||
      fullName
        .split(/\s+/)
        .map((p) => p[0] || "")
        .join("")
        .slice(0, 2) ||
      "IG",
  )
    .slice(0, 2)
    .toUpperCase();

  const highlights = Array.isArray(data.highlights)
    ? (data.highlights as InstagramHighlight[])
    : base.highlights;

  // Empty by default — only render cells the user (or data) explicitly provides.
  const grid = Array.isArray(data.grid)
    ? (data.grid as InstagramGridItem[])
    : [];

  return {
    username,
    fullName,
    bio,
    link,
    posts,
    followers,
    following,
    initials,
    avatarUrl: data.avatarUrl ? String(data.avatarUrl) : undefined,
    avatarSymbol:
      data.avatarSymbol != null
        ? String(data.avatarSymbol)
        : base.avatarSymbol,
    avatarBg: data.avatarBg ? String(data.avatarBg) : base.avatarBg,
    avatarFg: data.avatarFg ? String(data.avatarFg) : base.avatarFg,
    note:
      data.note === null || data.note === ""
        ? undefined
        : data.note != null
          ? String(data.note)
          : base.note,
    reelsBadge: num(data.reelsBadge, base.reelsBadge ?? 0),
    highlights,
    grid: grid.slice(0, Math.max(0, posts)),
  };
}

export function injectInstagramHtml(
  template: string,
  payload: InstagramPayload,
): string {
  let html = template;
  html = html.replace(
    /<title>[\s\S]*?<\/title>/,
    `<title>${payload.username} • Instagram</title>`,
  );
  html = html.replace(
    /<script id="payload" type="application\/json">[\s\S]*?<\/script>/,
    `<script id="payload" type="application/json">${JSON.stringify(payload)}</script>`,
  );
  return html;
}
