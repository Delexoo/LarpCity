export type ChaseAccount = {
  kind: string;
  name: string;
  last4: string;
  balance: number;
  limit: number;
  art: string;
  points: number;
  dueInDays: number;
  minDue: number;
  [key: string]: unknown;
};

export type ChaseTx = {
  merchant: string;
  amount: number;
  direction: "in" | "out" | string;
  daysAgo: number;
  category: string;
  pending: boolean;
  account: number;
  id?: number;
  dateMs?: number;
  signedAmount?: number;
  spending?: boolean;
  [key: string]: unknown;
};

export type ChasePayload = {
  id: string;
  now: number;
  owner: boolean;
  path: string;
  cfg: {
    version: string;
    holder: string;
    username: string;
    debitLast4: string;
    creditScore: number;
    monthlyIncome: number;
    goalName: string;
    goalTarget: number;
    goalSaved: number;
    accounts: ChaseAccount[];
    transactions: ChaseTx[];
    [key: string]: unknown;
  };
  model: {
    accounts: ChaseAccount[];
    transactions: ChaseTx[];
    currentTransactions: ChaseTx[];
    spentThisMonth: number;
    incomeThisMonth: number;
    categories: Array<{ key: string; label: string; amount: number; share: number }>;
    bankBalance: number;
    cardBalance: number;
    netWorth: number;
    months: Array<Record<string, unknown>>;
    statements: unknown[];
    goalPercent: number;
    pendingCount: number;
    [key: string]: unknown;
  };
  categories: Record<string, string>;
  icons: Record<string, string>;
  [key: string]: unknown;
};

function parseMoney(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) return Math.max(0, value);
  const n = Number(
    String(value ?? "")
      .replace(/[,$]/g, "")
      .replace(/[^\d.]/g, ""),
  );
  return Number.isFinite(n) ? Math.max(0, n) : fallback;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function slugUser(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")
      .slice(0, 16) || "chaseuser"
  );
}

function rebuildModel(payload: ChasePayload): ChasePayload["model"] {
  const now = payload.now || Date.now();
  const accounts = (payload.cfg.accounts || []).map((a, i) => ({ ...a, id: i }));
  const txs = (payload.cfg.transactions || []).map((t, i) => {
    const amount = Number(t.amount) || 0;
    const out = t.direction === "out";
    return {
      ...t,
      id: i,
      dateMs: now - (Number(t.daysAgo) || 0) * 86400000,
      signedAmount: out ? amount : amount,
      spending: out,
    };
  });

  const bankBalance = round2(
    accounts
      .filter((a) => a.kind !== "credit")
      .reduce((sum, a) => sum + (Number(a.balance) || 0), 0),
  );
  const cardBalance = round2(
    accounts
      .filter((a) => a.kind === "credit")
      .reduce((sum, a) => sum + (Number(a.balance) || 0), 0),
  );
  const netWorth = round2(bankBalance - cardBalance);

  const spentThisMonth = round2(
    txs
      .filter((t) => t.direction === "out" && (Number(t.daysAgo) || 0) <= 31)
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0),
  );
  const incomeThisMonth = round2(
    txs
      .filter((t) => t.direction === "in" && (Number(t.daysAgo) || 0) <= 31)
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0) ||
      Number(payload.cfg.monthlyIncome) ||
      0,
  );

  const catMap = new Map<string, number>();
  for (const t of txs) {
    if (t.direction !== "out") continue;
    const key = String(t.category || "other");
    catMap.set(key, (catMap.get(key) || 0) + (Number(t.amount) || 0));
  }
  const catTotal = [...catMap.values()].reduce((a, b) => a + b, 0) || 1;
  const categories = [...catMap.entries()].map(([key, amount]) => ({
    key,
    label: payload.categories?.[key] || key,
    amount: round2(amount),
    share: amount / catTotal,
  }));

  const goalTarget = Math.max(1, Number(payload.cfg.goalTarget) || 1);
  const goalSaved = Number(payload.cfg.goalSaved) || 0;

  const baseMonths = Array.isArray(payload.model?.months) ? payload.model.months : [];
  const oldNet = Math.max(1, Number(payload.model?.netWorth) || netWorth || 1);
  const factor = netWorth / oldNet;
  const months = baseMonths.map((m) => ({
    ...m,
    netWorth: round2(Number(m.netWorth || 0) * factor),
    income: round2(Number(m.income || 0) * factor),
    spending: round2(Number(m.spending || 0) * factor),
  }));

  return {
    ...payload.model,
    accounts: accounts as ChaseAccount[],
    transactions: txs,
    currentTransactions: txs.filter((t) => (Number(t.daysAgo) || 0) <= 1).slice(0, 8),
    spentThisMonth,
    incomeThisMonth:
      incomeThisMonth || round2(Number(payload.cfg.monthlyIncome) || 0),
    categories,
    bankBalance,
    cardBalance,
    netWorth,
    months,
    statements: Array.isArray(payload.model?.statements)
      ? payload.model.statements
      : [],
    goalPercent: round2((goalSaved / goalTarget) * 100),
    pendingCount: txs.filter((t) => t.pending).length,
  };
}

export function buildChasePayload(
  base: ChasePayload,
  data: Record<string, unknown>,
  meta: { id: string; title: string },
): ChasePayload {
  const holder = String(
    data.holder || data.displayName || data.businessName || meta.title || "Alex Morgan",
  ).trim();
  const username = String(data.username || data.handle || slugUser(holder)).replace(
    /^@/,
    "",
  );
  const targetNet = parseMoney(
    data.totalUsd ?? data.balance ?? data.netWorth,
    Number(base.model?.netWorth) || 10000,
  );
  const oldNet = Math.max(1, Number(base.model?.netWorth) || 1);
  const factor = targetNet / oldNet;

  const accounts = (base.cfg.accounts || []).map((a) => ({
    ...a,
    balance: round2((Number(a.balance) || 0) * factor),
    limit: a.kind === "credit" ? round2((Number(a.limit) || 0) * Math.max(1, factor * 0.4)) : 0,
    points: Math.round((Number(a.points) || 0) * factor),
    minDue: round2((Number(a.minDue) || 0) * Math.min(factor, 3)),
    last4: String(data[`last4_${a.kind}`] || a.last4).replace(/\D/g, "").slice(-4),
  }));

  const checking = accounts.find((a) => a.kind === "checking");
  const goalSaved = round2(
    parseMoney(data.goalSaved, Number(checking?.balance) || targetNet * 0.5),
  );

  const transactions = (base.cfg.transactions || []).map((t) => ({
    ...t,
    amount: round2((Number(t.amount) || 0) * factor),
  }));

  const next: ChasePayload = {
    ...base,
    id: meta.id,
    now: Date.now(),
    owner: true,
    path: "",
    cfg: {
      ...base.cfg,
      holder,
      username,
      debitLast4: String(data.debitLast4 || base.cfg.debitLast4 || "2471")
        .replace(/\D/g, "")
        .slice(-4),
      creditScore: Math.max(
        300,
        Math.min(850, Number(data.creditScore ?? base.cfg.creditScore ?? 780) || 780),
      ),
      monthlyIncome: round2(
        data.monthlyIncome != null
          ? parseMoney(data.monthlyIncome, Number(base.cfg.monthlyIncome) || 0)
          : (Number(base.cfg.monthlyIncome) || 0) *
              (factor > 0 ? Math.min(Math.max(factor, 0.2), 5) : 1),
      ),
      goalName: String(data.goalName || base.cfg.goalName || "Savings goal"),
      goalTarget: round2(
        parseMoney(data.goalTarget, Number(base.cfg.goalTarget) || targetNet),
      ),
      goalSaved,
      accounts,
      transactions,
    },
    model: { ...base.model },
  };

  next.model = rebuildModel(next);
  // Keep goalSaved aligned with primary checking after scale when not overridden.
  if (data.goalSaved == null && checking) {
    next.cfg.goalSaved = round2(Number(checking.balance) || 0);
    next.model.goalPercent = round2(
      (next.cfg.goalSaved / Math.max(1, next.cfg.goalTarget)) * 100,
    );
  }
  return next;
}

export function injectChaseViewerHtml(
  template: string,
  payload: ChasePayload,
): string {
  let html = template;
  const title = payload.cfg.holder || "Chase";

  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${title} · Chase</title>`);

  html = html.replace(
    /window\.__CH\s*=\s*\{[\s\S]*?\};/,
    `window.__CH=${JSON.stringify(payload)};`,
  );

  html = html.replace(/<script id="ll-install-data"[\s\S]*$/i, "");
  html = html.replace(/<button id="ll-install-btn"[\s\S]*?<\/button>/gi, "");
  html = html.replace(/https:\/\/larplabs\.io/gi, "");

  html = html.replace(
    /<link rel="manifest"[^>]*>/gi,
    `<link rel="manifest" href="/api/pwa/manifest/${encodeURIComponent(payload.id)}?name=Chase&slug=chase">`,
  );
  html = html.replace(
    /<link rel="apple-touch-icon"[^>]*>/gi,
    `<link rel="apple-touch-icon" href="/display-apps/chase/apple-touch-icon.png">`,
  );

  const fit = `<style id="lc-chase-fit">
html,body{height:100%;width:100%;margin:0;overflow:hidden;background:#0f1324}
#app{position:fixed;inset:0;max-width:100%;margin:0 auto}
#ll-install-btn{display:none!important}
@media (min-width:560px){
  html{background:#070a14}
  #app{max-width:390px;left:50%;right:auto;transform:translateX(-50%);
    top:16px;bottom:16px;height:auto;border-radius:28px;overflow:hidden;
    box-shadow:0 20px 60px rgba(0,0,0,.45)}
}
</style>
<link rel="icon" href="/display-apps/chase/icon-512.png"/>`;

  if (html.includes("</head>")) html = html.replace("</head>", `${fit}</head>`);
  else html = fit + html;
  if (!/<\/body>/i.test(html)) html += "</body></html>";
  return html;
}
