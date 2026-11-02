/** Parse display money like "$ 3,522.72" or "3522.72" into integer cents. */
export function moneyToCents(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.round(value * 100);
  }
  const raw = String(value ?? "").trim();
  if (!raw) return 0;
  const negative = raw.includes("(") || raw.trim().startsWith("-");
  const cleaned = raw.replace(/[^0-9.]/g, "");
  const n = Number.parseFloat(cleaned || "0");
  if (!Number.isFinite(n)) return 0;
  const cents = Math.round(n * 100);
  return negative ? -cents : cents;
}

export function parsePct(value: unknown, fallback = 0): number {
  const n = Number.parseFloat(String(value ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : fallback;
}

const CURRENCY: Record<string, { sym: string; flag: string }> = {
  USD: { sym: "$", flag: "us" },
  EUR: { sym: "€", flag: "eu" },
  GBP: { sym: "£", flag: "gb" },
  CAD: { sym: "CA$", flag: "ca" },
  AUD: { sym: "A$", flag: "au" },
};

export function currencyMeta(code: unknown) {
  const cur = String(code || "USD").toUpperCase();
  return { cur, ...(CURRENCY[cur] ?? CURRENCY.USD) };
}
