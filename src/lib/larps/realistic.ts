/** Seeded PRNG + realistic money/series helpers for LARP dashboards. */

export function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mulberry32(seed: number) {
  let t = seed >>> 0;
  return function rand() {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function formatMoney(cents: number, sym = "$"): string {
  const neg = cents < 0;
  const abs = Math.abs(cents);
  const whole = Math.floor(abs / 100);
  const frac = String(abs % 100).padStart(2, "0");
  const withCommas = whole.toLocaleString("en-US");
  return `${neg ? "-" : ""}${sym} ${withCommas}.${frac}`;
}

export function randomMoneyCents(
  rand: () => number,
  minCents: number,
  maxCents: number,
): number {
  const lo = Math.min(minCents, maxCents);
  const hi = Math.max(minCents, maxCents);
  return Math.round(lo + rand() * (hi - lo));
}

/** Realistic daily series that sums ~targetSum with weekday/weekend shape + noise. */
export function generateDailySeries(
  days: number,
  targetSum: number,
  rand: () => number,
  opts?: { vibe?: string },
): number[] {
  const vibe = (opts?.vibe || "growing").toLowerCase();
  const weights: number[] = [];
  for (let i = 0; i < days; i++) {
    const weekday = i % 7;
    let w = weekday === 0 || weekday === 6 ? 0.55 + rand() * 0.25 : 0.85 + rand() * 0.4;
    const t = i / Math.max(1, days - 1);
    if (vibe.includes("explod") || vibe.includes("launch")) {
      w *= 0.35 + Math.pow(t, 1.6) * 2.2;
    } else if (vibe.includes("side")) {
      w *= 0.7 + rand() * 0.5;
    } else if (vibe.includes("risk")) {
      w *= 0.5 + rand() * 1.2;
    } else {
      // growing / default — gentle upward drift
      w *= 0.75 + t * 0.55 + (rand() - 0.5) * 0.15;
    }
    weights.push(Math.max(0.05, w));
  }
  const wSum = weights.reduce((a, b) => a + b, 0) || 1;
  const out = weights.map((w) =>
    Math.max(0, Math.round((targetSum * w) / wSum)),
  );
  // Fix rounding drift on last bucket
  const diff = targetSum - out.reduce((a, b) => a + b, 0);
  if (out.length) out[out.length - 1] = Math.max(0, out[out.length - 1] + diff);
  return out;
}

export function generateHourlyToday(
  targetCents: number,
  hourNow: number,
  rand: () => number,
): number[] {
  const hours = Math.max(1, Math.min(24, hourNow + 1));
  const weights: number[] = [];
  for (let h = 0; h < 24; h++) {
    // Business-hours heavy curve
    const peak = Math.exp(-Math.pow((h - 14) / 5.5, 2));
    const w = h <= hourNow ? 0.15 + peak * (0.7 + rand() * 0.6) : 0;
    weights.push(w);
  }
  const active = weights.slice(0, hours);
  const wSum = active.reduce((a, b) => a + b, 0) || 1;
  const out = Array.from({ length: 24 }, (_, h) => {
    if (h >= hours) return 0;
    return Math.max(0, Math.round((targetCents * weights[h]) / wSum));
  });
  const diff = targetCents - out.reduce((a, b) => a + b, 0);
  if (hourNow >= 0) out[hourNow] = Math.max(0, out[hourNow] + diff);
  return out;
}

export type RandomStripeAmounts = {
  balance: string;
  gross: string;
  net: string;
  incoming: string;
  capital: string;
  newCustomers: string;
  failed: string;
  refunded: string;
  disputed: string;
  declined: string;
};

export function randomStripeAmounts(seed?: string): RandomStripeAmounts {
  const rand = mulberry32(
    seed ? hashSeed(seed) : (Math.random() * 1e9) >>> 0,
  );
  const balance = randomMoneyCents(rand, 80_000, 4_500_000); // $800 – $45k
  const gross = randomMoneyCents(rand, 250_000, 12_000_000); // $2.5k – $120k
  const feeRate = 0.025 + rand() * 0.035;
  const net = Math.max(0, Math.round(gross * (1 - feeRate)));
  const incoming = randomMoneyCents(rand, Math.round(balance * 0.15), Math.round(balance * 0.9));
  const capital = Math.round((15_000 + rand() * 120_000) / 1000) * 1000 * 100;
  return {
    balance: formatMoney(balance),
    gross: formatMoney(gross),
    net: formatMoney(net),
    incoming: formatMoney(incoming),
    capital: formatMoney(capital),
    newCustomers: String(40 + Math.floor(rand() * 900)),
    failed: String(1 + Math.floor(rand() * 18)),
    refunded: (1.2 + rand() * 3.5).toFixed(1),
    disputed: (0.1 + rand() * 0.8).toFixed(1),
    declined: (3.5 + rand() * 6).toFixed(1),
  };
}
