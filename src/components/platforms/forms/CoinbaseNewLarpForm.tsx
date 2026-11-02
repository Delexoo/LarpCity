"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, Monitor, Moon, Smartphone, Sparkles, Sun } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  createLocalLarp,
  getLocalLarp,
  syncLarpSnapshot,
  updateLocalLarp,
} from "@/lib/larps/local-store";
import { cn } from "@/lib/utils";

const BAG_VIBES = [
  {
    id: "modest",
    label: "Modest",
    hint: "Believable side hustle. Reads as real.",
    total: 18420,
  },
  {
    id: "cocky",
    label: "Cocky",
    hint: "Soft launch flex. People DM you.",
    total: 128500,
  },
  {
    id: "whale",
    label: "Whale",
    hint: "Top 0.5% bag. Course-seller numbers.",
    total: 759000,
  },
  {
    id: "absurd",
    label: "Absurd",
    hint: "Obvious joke. Group chat bait.",
    total: 12400000,
  },
] as const;

const QUICK_STARTS = [
  { id: "quiet-whale", label: "Quiet whale" },
  { id: "day-trader", label: "Day trader" },
  { id: "long-term", label: "Long-term holder" },
] as const;

const STRATEGIES = [
  { id: "BLUE_CHIP", label: "Blue chip" },
  { id: "MEME", label: "Meme heavy" },
  { id: "STABLE", label: "Mostly stables" },
] as const;

const MARKET_VIBES = [
  { id: "CRAB", label: "Crab" },
  { id: "BULL", label: "Bull" },
  { id: "BEAR", label: "Bear" },
] as const;

type AccordionId =
  | "quick"
  | "strategy"
  | "transactions"
  | "market"
  | "currency"
  | "buypanel";

function FieldLabel({
  children,
  hint,
}: {
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="mb-2">
      <p className="text-sm font-medium text-[var(--ink)]">{children}</p>
      {hint ? (
        <p className="mt-0.5 text-xs text-[var(--text-secondary)]">{hint}</p>
      ) : null}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "w-full rounded-lg border border-[var(--hairline)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--ink)]/40 focus:outline-2 focus:outline-[var(--accent-ring)] focus:outline-offset-2",
        className,
      )}
    />
  );
}

function Accordion({
  id,
  openId,
  setOpenId,
  title,
  summary,
  children,
}: {
  id: AccordionId;
  openId: AccordionId | null;
  setOpenId: (id: AccordionId | null) => void;
  title: string;
  summary: string;
  children: React.ReactNode;
}) {
  const open = openId === id;
  return (
    <div className="border-b border-[var(--hairline)] last:border-0">
      <button
        type="button"
        onClick={() => setOpenId(open ? null : id)}
        className="flex w-full items-center justify-between gap-3 py-4 text-left"
      >
        <div className="min-w-0">
          <p className="text-sm font-semibold tracking-tight text-[var(--ink)]">
            {title}
          </p>
          <p className="mt-0.5 truncate text-xs text-[var(--text-secondary)]">
            {summary}
          </p>
        </div>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-[var(--text-secondary)] transition-transform",
            open && "rotate-180",
          )}
          strokeWidth={2}
        />
      </button>
      {open ? <div className="pb-4">{children}</div> : null}
    </div>
  );
}

function formatUsd(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n);
}

function parseUsd(raw: string): number {
  const n = Number(String(raw).replace(/[,$]/g, "").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

function compactUsd(n: number): string {
  if (n >= 1_000_000) {
    return `$${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
  }
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return formatUsd(n);
}

function holdingsForBag(total: number): number {
  if (total >= 1_000_000) return 8;
  if (total >= 250_000) return 5;
  if (total >= 50_000) return 4;
  return 3;
}

export function CoinbaseNewLarpForm({
  cancelHref = "/platforms/coinbase",
  editId,
}: {
  cancelHref?: string;
  editId?: string;
}) {
  const router = useRouter();
  const editing = Boolean(editId);
  const [hydratedEdit, setHydratedEdit] = useState(false);
  const [creating, setCreating] = useState(false);

  const [profileName, setProfileName] = useState("delexo");
  const [displayName, setDisplayName] = useState("DELEXO");
  const [bagVibe, setBagVibe] = useState<string>("whale");
  const [totalUsd, setTotalUsd] = useState(759000);
  const [balanceText, setBalanceText] = useState(formatUsd(759000));
  const [device, setDevice] = useState<"web" | "mobile">("web");
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [showAll, setShowAll] = useState(false);
  const [openId, setOpenId] = useState<AccordionId | null>(null);
  const [quickStart, setQuickStart] = useState("quiet-whale");
  const [strategy, setStrategy] = useState("BLUE_CHIP");
  const [marketVibe, setMarketVibe] = useState("CRAB");
  const [currency, setCurrency] = useState("USD");
  const [buyPanel, setBuyPanel] = useState("NORMAL");

  useEffect(() => {
    if (!editId || hydratedEdit) return;
    const existing = getLocalLarp(editId);
    if (!existing) {
      setHydratedEdit(true);
      return;
    }
    const d = existing.data ?? {};
    setProfileName(existing.title || String(d.profileName || "delexo"));
    setDisplayName(String(d.displayName || d.businessName || "DELEXO"));
    const total = parseUsd(String(d.totalUsd ?? d.balance ?? 759000));
    setTotalUsd(total);
    setBalanceText(formatUsd(total));
    setBagVibe(String(d.bagVibe || "whale"));
    setDevice(d.device === "mobile" ? "mobile" : "web");
    setTheme(String(d.theme || "dark").toLowerCase() === "light" ? "light" : "dark");
    setQuickStart(String(d.quickStart || "quiet-whale"));
    setStrategy(String(d.strategy || "BLUE_CHIP"));
    setMarketVibe(String(d.marketVibe || "CRAB"));
    setCurrency(String(d.currency || "USD").toUpperCase());
    setBuyPanel(String(d.buyPanel || "NORMAL"));
    setHydratedEdit(true);
  }, [editId, hydratedEdit]);

  const sliderMax = 5_000_000;
  const sliderValue = Math.min(sliderMax, Math.max(0, totalUsd));

  const summaries = useMemo(
    () => ({
      quick: QUICK_STARTS.find((x) => x.id === quickStart)?.label || "Quiet whale",
      strategy: STRATEGIES.find((x) => x.id === strategy)?.label || "Blue chip",
      market: MARKET_VIBES.find((x) => x.id === marketVibe)?.label || "Crab",
    }),
    [quickStart, strategy, marketVibe],
  );

  function applyBagVibe(id: string) {
    const vibe = BAG_VIBES.find((x) => x.id === id);
    if (!vibe) return;
    setBagVibe(id);
    setTotalUsd(vibe.total);
    setBalanceText(formatUsd(vibe.total));
  }

  function makeBelievable() {
    const jitter = 0.92 + Math.random() * 0.16;
    const next = Math.round((totalUsd * jitter) / 100) * 100;
    setTotalUsd(next);
    setBalanceText(formatUsd(next));
  }

  function collectData() {
    return {
      profileName,
      displayName,
      businessName: displayName,
      name: displayName,
      totalUsd,
      balance: formatUsd(totalUsd),
      bagVibe,
      device,
      theme,
      quickStart,
      strategy,
      marketVibe,
      currency,
      buyPanel,
      holdingsCount: holdingsForBag(totalUsd),
      bankName: "Chase",
      bankLast4: "3725",
    };
  }

  return (
    <div className="mx-auto w-full max-w-3xl pb-28">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="page-title">
            {editing ? "Edit Coinbase LARP" : "New Coinbase LARP"}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[var(--text-secondary)]">
            Set the profile and bag. Desktop vs mobile is auto-detected when you
            open the LARP (you can still pick a preferred shell below).
          </p>
        </div>
        <Link href={cancelHref} className="shrink-0">
          <Button variant="ghost" size="sm">
            Cancel
          </Button>
        </Link>
      </div>

      <div className="mt-8 space-y-6">
        <section className="ll-panel p-5 sm:p-6">
          <FieldLabel hint="Name it for your reference. Display name shows in the LARP avatar.">
            Profile
          </FieldLabel>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="mb-1.5 text-xs text-[var(--text-secondary)]">
                Profile name
              </p>
              <TextInput value={profileName} onChange={setProfileName} />
            </div>
            <div>
              <p className="mb-1.5 text-xs text-[var(--text-secondary)]">
                Display name
              </p>
              <TextInput value={displayName} onChange={setDisplayName} />
            </div>
          </div>
        </section>

        <section className="ll-panel p-5 sm:p-6">
          <FieldLabel hint="Pick a vibe or type an exact number.">
            Bag size
          </FieldLabel>
          <div className="grid gap-2 sm:grid-cols-2">
            {BAG_VIBES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => applyBagVibe(item.id)}
                className={cn(
                  "rounded-xl border p-3 text-left transition",
                  bagVibe === item.id
                    ? "border-[var(--ink)] bg-[var(--accent-select)]"
                    : "border-[var(--hairline)] hover:border-[var(--ink)]/25",
                )}
              >
                <p className="text-sm font-medium text-[var(--ink)]">
                  {item.label}
                </p>
                <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                  {item.hint}
                </p>
              </button>
            ))}
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-xs text-[var(--text-secondary)]">
              <span>$0</span>
              <span className="font-medium text-[var(--ink)]">
                {compactUsd(totalUsd)}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={sliderMax}
              step={1000}
              value={sliderValue}
              onChange={(e) => {
                const next = Number(e.target.value);
                setBagVibe("custom");
                setTotalUsd(next);
                setBalanceText(formatUsd(next));
              }}
              className="w-full accent-[var(--ink)]"
            />
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <TextInput
              value={balanceText}
              onChange={(v) => {
                setBagVibe("custom");
                setBalanceText(v);
                setTotalUsd(parseUsd(v));
              }}
              className="sm:flex-1"
            />
            <Button
              type="button"
              variant="outline"
              className="shrink-0"
              onClick={makeBelievable}
            >
              <Sparkles className="size-3.5" strokeWidth={2} />
              Make believable
            </Button>
          </div>
        </section>

        <section className="ll-panel p-5 sm:p-6">
          <FieldLabel hint="Which Coinbase view to prefer.">Device</FieldLabel>
          <div className="grid gap-2 sm:grid-cols-2">
            {(
              [
                {
                  id: "web" as const,
                  label: "Web",
                  hint: "Desktop browser view. Three-column dashboard.",
                  icon: Monitor,
                },
                {
                  id: "mobile" as const,
                  label: "Mobile",
                  hint: "iOS app screens. Pixel-faithful clone.",
                  icon: Smartphone,
                },
              ] as const
            ).map((item) => {
              const Icon = item.icon;
              const on = device === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setDevice(item.id)}
                  className={cn(
                    "relative rounded-xl border p-4 text-left transition",
                    on
                      ? "border-[var(--ink)] bg-[var(--accent-select)]"
                      : "border-[var(--hairline)] hover:border-[var(--ink)]/25",
                  )}
                >
                  {on ? (
                    <span className="absolute right-3 top-3 flex size-5 items-center justify-center rounded-full bg-[var(--ink)] text-[var(--on-ink)]">
                      <Check className="size-3" strokeWidth={3} />
                    </span>
                  ) : null}
                  <Icon className="size-5 text-[var(--ink)]" strokeWidth={2} />
                  <p className="mt-3 text-sm font-semibold text-[var(--ink)]">
                    {item.label}
                  </p>
                  <p className="mt-1 text-xs text-[var(--text-secondary)]">
                    {item.hint}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="ll-panel p-5 sm:p-6">
          <FieldLabel hint="Coinbase ships both. Pick your vibe.">
            Theme
          </FieldLabel>
          <div className="inline-flex rounded-full border border-[var(--hairline)] bg-[var(--surface-alt)] p-1">
            {(
              [
                { id: "light" as const, label: "Light", icon: Sun },
                { id: "dark" as const, label: "Dark", icon: Moon },
              ] as const
            ).map((item) => {
              const Icon = item.icon;
              const on = theme === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTheme(item.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition",
                    on
                      ? "bg-[var(--ink)] text-[var(--on-ink)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--ink)]",
                  )}
                >
                  <Icon className="size-3.5" strokeWidth={2} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="ll-panel px-5 sm:px-6">
          <div className="flex items-center justify-between gap-3 border-b border-[var(--hairline)] py-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              More settings
            </p>
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="text-xs font-medium text-[var(--ink)] underline-offset-2 hover:underline"
            >
              {showAll ? "Hide settings" : "Show all settings"}
            </button>
          </div>
          {showAll ? (
            <div>
              <Accordion
                id="quick"
                openId={openId}
                setOpenId={setOpenId}
                title="Quick start"
                summary={summaries.quick}
              >
                <div className="flex flex-wrap gap-2">
                  {QUICK_STARTS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setQuickStart(item.id)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs",
                        quickStart === item.id
                          ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--on-ink)]"
                          : "border-[var(--hairline)] text-[var(--ink)]",
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </Accordion>
              <Accordion
                id="strategy"
                openId={openId}
                setOpenId={setOpenId}
                title="Strategy"
                summary={summaries.strategy}
              >
                <div className="flex flex-wrap gap-2">
                  {STRATEGIES.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setStrategy(item.id)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs",
                        strategy === item.id
                          ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--on-ink)]"
                          : "border-[var(--hairline)] text-[var(--ink)]",
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </Accordion>
              <Accordion
                id="transactions"
                openId={openId}
                setOpenId={setOpenId}
                title="Transactions"
                summary="Auto-generated history only"
              >
                <p className="text-xs text-[var(--text-secondary)]">
                  History scales with bag size when you open the LARP.
                </p>
              </Accordion>
              <Accordion
                id="market"
                openId={openId}
                setOpenId={setOpenId}
                title="Market vibe"
                summary={summaries.market}
              >
                <div className="flex flex-wrap gap-2">
                  {MARKET_VIBES.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setMarketVibe(item.id)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs",
                        marketVibe === item.id
                          ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--on-ink)]"
                          : "border-[var(--hairline)] text-[var(--ink)]",
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </Accordion>
              <Accordion
                id="currency"
                openId={openId}
                setOpenId={setOpenId}
                title="Currency"
                summary={currency}
              >
                <div className="flex flex-wrap gap-2">
                  {["USD", "EUR", "GBP"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCurrency(c)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs",
                        currency === c
                          ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--on-ink)]"
                          : "border-[var(--hairline)] text-[var(--ink)]",
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </Accordion>
              <Accordion
                id="buypanel"
                openId={openId}
                setOpenId={setOpenId}
                title="Buy panel"
                summary={buyPanel === "NORMAL" ? "Normal" : buyPanel}
              >
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "NORMAL", label: "Normal" },
                    { id: "AGGRESSIVE", label: "Aggressive" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setBuyPanel(item.id)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs",
                        buyPanel === item.id
                          ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--on-ink)]"
                          : "border-[var(--hairline)] text-[var(--ink)]",
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </Accordion>
            </div>
          ) : (
            <div className="space-y-0 py-1">
              {[
                ["Quick start", summaries.quick],
                ["Strategy", summaries.strategy],
                ["Transactions", "Auto-generated history only"],
                ["Market vibe", summaries.market],
                ["Currency", currency],
                ["Buy panel", buyPanel === "NORMAL" ? "Normal" : buyPanel],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-3 border-b border-[var(--hairline)] py-3.5 last:border-0"
                >
                  <p className="text-sm text-[var(--ink)]">{label}</p>
                  <p className="text-sm text-[var(--text-secondary)]">{value}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--hairline)] bg-[var(--surface)]/95 px-4 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl gap-2">
          <Link href={cancelHref} className="hidden sm:block">
            <Button variant="ghost">Cancel</Button>
          </Link>
          <Button
            className="flex-1"
            disabled={creating || !displayName.trim()}
            onClick={async () => {
              setCreating(true);
              try {
                const data = collectData();
                if (editing && editId) {
                  const updated = updateLocalLarp(editId, {
                    title: profileName.trim() || displayName.trim(),
                    data,
                  });
                  if (updated) {
                    syncLarpSnapshot(updated);
                    router.push(`/larps/${updated.id}`);
                    return;
                  }
                }
                const created = createLocalLarp({
                  platform_slug: "coinbase",
                  title: profileName.trim() || displayName.trim(),
                  data,
                });
                syncLarpSnapshot(created);
                router.push(`/larps/${created.id}`);
              } finally {
                setCreating(false);
              }
            }}
          >
            {creating
              ? editing
                ? "Saving…"
                : "Creating…"
              : editing
                ? "Save Coinbase LARP"
                : "Create Coinbase LARP"}
          </Button>
        </div>
      </div>
    </div>
  );
}
