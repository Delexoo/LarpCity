"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  createLocalLarp,
  getLocalLarp,
  syncLarpSnapshot,
  updateLocalLarp,
} from "@/lib/larps/local-store";
import { cn } from "@/lib/utils";

const PERSON_PRESETS = [
  {
    id: "nine-five",
    label: "9 to 5",
    hint: "$1.8K cash, paycheck every 2 weeks",
    balance: "$ 1,800.00",
    savings: "$ 2,400.00",
    stocks: "$ 0.00",
    btc: "$ 0.00",
    vibe: "STEADY",
  },
  {
    id: "crypto",
    label: "Crypto bro",
    hint: "Bitcoin bag, trading every day",
    balance: "$ 4,200.00",
    savings: "$ 500.00",
    stocks: "$ 1,200.00",
    btc: "$ 48,500.00",
    vibe: "STACKING",
  },
  {
    id: "billionaire",
    label: "Billionaire owner",
    hint: "Millions across cash, stocks and BTC",
    balance: "$ 9,846,210.40",
    savings: "$ 5,000,000.00",
    stocks: "$ 8,420,000.00",
    btc: "$ 2,100,000.00",
    vibe: "GRINDING",
  },
  {
    id: "hustler",
    label: "Side hustler",
    hint: "$640 cash, tips and gigs",
    balance: "$ 640.00",
    savings: "$ 1,100.00",
    stocks: "$ 0.00",
    btc: "$ 0.00",
    vibe: "GRINDING",
  },
  {
    id: "creator",
    label: "Creator",
    hint: "Brand deals landing in Cash App",
    balance: "$ 12,400.00",
    savings: "$ 3,000.00",
    stocks: "$ 2,500.00",
    btc: "$ 800.00",
    vibe: "SPENDING",
  },
  {
    id: "college",
    label: "College student",
    hint: "$47 cash, Venmo vibes on Cash",
    balance: "$ 47.00",
    savings: "$ 0.00",
    stocks: "$ 0.00",
    btc: "$ 0.00",
    vibe: "STEADY",
  },
] as const;

const BALANCE_PILLS = [
  { label: "$5", value: "$ 5.00" },
  { label: "$100", value: "$ 100.00" },
  { label: "$1K", value: "$ 1,000.00" },
  { label: "$10K", value: "$ 10,000.00" },
  { label: "$100K", value: "$ 100,000.00" },
] as const;

const VIBES = [
  { id: "STEADY", label: "Steady" },
  { id: "GRINDING", label: "Grinding" },
  { id: "STACKING", label: "Stacking" },
  { id: "SPENDING", label: "Spending" },
] as const;

const CARD_STYLES = [
  { id: "BLACK", label: "Black card" },
  { id: "HOLO", label: "Holo" },
  { id: "SNAKE", label: "Snake" },
  { id: "TEAL", label: "Teal" },
  { id: "TORTOISE", label: "Tortoise" },
] as const;

type AccordionId = "assets" | "bank" | "vibe" | "card" | "feed";

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
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-[var(--hairline)] bg-[var(--surface-alt)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--ink)]/40 focus:outline-2 focus:outline-[var(--accent-ring)] focus:outline-offset-2"
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

function slugTag(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")
      .slice(0, 16) || "alexm"
  );
}

function randomCardLast4(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export function CashAppNewLarpForm({
  cancelHref = "/platforms/cash-app",
  editId,
}: {
  cancelHref?: string;
  editId?: string;
}) {
  const [preset, setPreset] = useState("nine-five");
  const [internalName, setInternalName] = useState("Main account");
  const [displayName, setDisplayName] = useState("DELEXO");
  const [cashtag, setCashtag] = useState("alexm");
  const [balance, setBalance] = useState("$ 3,000.00");
  const [savings, setSavings] = useState("$ 10,000.00");
  const [stocks, setStocks] = useState("$ 0.00");
  const [btc, setBtc] = useState("$ 0.00");
  const [routing, setRouting] = useState("000000000");
  const [account, setAccount] = useState("0000");
  const [vibe, setVibe] = useState("STEADY");
  const [cardKey, setCardKey] = useState("BLACK");
  const [cardLast4, setCardLast4] = useState(randomCardLast4);
  const [openId, setOpenId] = useState<AccordionId | null>(null);
  const [creating, setCreating] = useState(false);
  const [hydratedEdit, setHydratedEdit] = useState(false);
  const router = useRouter();
  const editing = Boolean(editId);

  useEffect(() => {
    if (!editId || hydratedEdit) return;
    const existing = getLocalLarp(editId);
    if (!existing) {
      setHydratedEdit(true);
      return;
    }
    const d = existing.data ?? {};
    setInternalName(existing.title || "Main account");
    setDisplayName(String(d.displayName || d.businessName || d.name || "DELEXO"));
    setCashtag(
      String(d.cashtag || d.tag || d.handle || "alexm").replace(/^\$/, ""),
    );
    setBalance(String(d.balance || d.cash || "$ 3,000.00"));
    setSavings(String(d.savings || d.sav || "$ 10,000.00"));
    setStocks(String(d.stocks || d.stk || "$ 0.00"));
    setBtc(String(d.btc || d.bitcoin || "$ 0.00"));
    setRouting(String(d.routing || "000000000").replace(/\D/g, "").slice(0, 9));
    setAccount(String(d.account || d.bankAccount || "0000").replace(/\D/g, "").slice(-4));
    setVibe(String(d.vibe || "STEADY").toUpperCase());
    setCardKey(String(d.cardKey || "BLACK").toUpperCase());
    setCardLast4(String(d.cardLast4 || randomCardLast4()).slice(-4));
    setPreset(String(d.preset || "nine-five"));
    setHydratedEdit(true);
  }, [editId, hydratedEdit]);

  function applyPreset(id: string) {
    const p = PERSON_PRESETS.find((x) => x.id === id);
    if (!p) return;
    setPreset(id);
    setBalance(p.balance);
    setSavings(p.savings);
    setStocks(p.stocks);
    setBtc(p.btc);
    setVibe(p.vibe);
  }

  function onDisplayNameChange(v: string) {
    setDisplayName(v);
    if (!editing && (!cashtag || cashtag === slugTag(displayName))) {
      setCashtag(slugTag(v));
    }
  }

  function collectData() {
    return {
      displayName,
      businessName: displayName,
      name: displayName,
      cashtag: cashtag.replace(/^\$/, ""),
      tag: `$${cashtag.replace(/^\$/, "")}`,
      handle: `$${cashtag.replace(/^\$/, "")}`,
      balance,
      cash: balance,
      savings,
      stocks,
      btc,
      routing: routing.replace(/\D/g, "").padStart(9, "0").slice(0, 9),
      account: account.replace(/\D/g, "").slice(-4).padStart(4, "0"),
      bankLast4: account.replace(/\D/g, "").slice(-4).padStart(4, "0"),
      vibe,
      cardKey,
      cardLast4: cardLast4.replace(/\D/g, "").slice(-4).padStart(4, "0"),
      hasCard: true,
      preset,
    };
  }

  const vibeLabel = VIBES.find((v) => v.id === vibe)?.label || "Steady";
  const cardLabel = CARD_STYLES.find((c) => c.id === cardKey)?.label || "Black card";

  return (
    <div className="mx-auto w-full max-w-3xl pb-28">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="page-title">
            {editing ? "Edit Cash App LARP" : "New Cash App LARP"}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[var(--text-secondary)]">
            Set cash, savings, stocks, and Bitcoin. Desktop vs phone app is
            auto-detected when you open the LARP.
          </p>
        </div>
        <Link href={cancelHref} className="shrink-0">
          <Button variant="ghost" size="sm">
            Cancel
          </Button>
        </Link>
      </div>

      <div className="mt-8 space-y-8">
        <section>
          <FieldLabel hint="Quick personas — balances and vibe fill in for you.">
            Start from a person
          </FieldLabel>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {PERSON_PRESETS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => applyPreset(item.id)}
                className={cn(
                  "rounded-xl border p-3 text-left transition",
                  preset === item.id
                    ? "border-[var(--ink)]/40 bg-[var(--accent-select)]"
                    : "border-[var(--hairline)] bg-transparent hover:border-[var(--ink)]/25",
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
        </section>

        <section>
          <FieldLabel hint="Just for your dashboard list. Not shown in the LARP.">
            Internal name
          </FieldLabel>
          <TextInput
            value={internalName}
            onChange={setInternalName}
            placeholder="Main account"
          />
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel>Display name</FieldLabel>
            <TextInput value={displayName} onChange={onDisplayNameChange} />
          </div>
          <div>
            <FieldLabel>$cashtag</FieldLabel>
            <div className="flex overflow-hidden rounded-lg border border-[var(--hairline)] bg-[var(--surface-alt)] focus-within:border-[var(--ink)]/40 focus-within:outline-2 focus-within:outline-[var(--accent-ring)] focus-within:outline-offset-2">
              <span className="grid place-items-center border-r border-[var(--hairline)] px-3 text-sm text-[var(--text-secondary)]">
                $
              </span>
              <input
                value={cashtag}
                onChange={(e) =>
                  setCashtag(
                    e.target.value.replace(/^\$/, "").replace(/[^a-zA-Z0-9_]/g, ""),
                  )
                }
                className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--text-muted)]"
                placeholder="alexm"
              />
            </div>
          </div>
        </section>

        <section>
          <FieldLabel>Cash balance</FieldLabel>
          <div className="mb-3 flex flex-wrap gap-2">
            {BALANCE_PILLS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setBalance(p.value)}
                className="rounded-full border border-[var(--hairline)] bg-[var(--surface-alt)] px-3 py-1.5 text-xs font-medium text-[var(--ink)]/80 transition hover:border-[var(--ink)]/40 hover:text-[var(--ink)]"
              >
                {p.label}
              </button>
            ))}
          </div>
          <TextInput value={balance} onChange={setBalance} placeholder="$ 0.00" />
        </section>

        <section>
          <FieldLabel>More settings</FieldLabel>
          <div className="rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] px-4 sm:px-5">
            <Accordion
              id="assets"
              openId={openId}
              setOpenId={setOpenId}
              title="Savings, stocks and Bitcoin"
              summary={`${savings} savings · ${stocks} stocks · ${btc} BTC`}
            >
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <p className="mb-1.5 text-xs text-[var(--text-secondary)]">Savings</p>
                  <TextInput value={savings} onChange={setSavings} />
                </div>
                <div>
                  <p className="mb-1.5 text-xs text-[var(--text-secondary)]">Stocks</p>
                  <TextInput value={stocks} onChange={setStocks} />
                </div>
                <div>
                  <p className="mb-1.5 text-xs text-[var(--text-secondary)]">Bitcoin</p>
                  <TextInput value={btc} onChange={setBtc} />
                </div>
              </div>
            </Accordion>

            <Accordion
              id="bank"
              openId={openId}
              setOpenId={setOpenId}
              title="Bank details"
              summary={`Routing ${routing} · Account ending ${account}`}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="mb-1.5 text-xs text-[var(--text-secondary)]">Routing</p>
                  <TextInput
                    value={routing}
                    onChange={(v) => setRouting(v.replace(/\D/g, "").slice(0, 9))}
                    placeholder="000000000"
                  />
                </div>
                <div>
                  <p className="mb-1.5 text-xs text-[var(--text-secondary)]">
                    Account last 4
                  </p>
                  <TextInput
                    value={account}
                    onChange={(v) => setAccount(v.replace(/\D/g, "").slice(0, 4))}
                    placeholder="0000"
                  />
                </div>
              </div>
            </Accordion>

            <Accordion
              id="vibe"
              openId={openId}
              setOpenId={setOpenId}
              title="Vibe"
              summary={vibeLabel}
            >
              <div className="grid gap-2 sm:grid-cols-2">
                {VIBES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setVibe(item.id)}
                    className={cn(
                      "rounded-xl border px-3 py-2.5 text-left text-sm transition",
                      vibe === item.id
                        ? "border-[var(--ink)]/40 bg-[var(--accent-select)] font-medium text-[var(--ink)]"
                        : "border-[var(--hairline)] text-[var(--ink)]/80 hover:border-[var(--ink)]/25",
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </Accordion>

            <Accordion
              id="card"
              openId={openId}
              setOpenId={setOpenId}
              title="Cash App Card"
              summary={`${cardLabel} · ···· ${cardLast4}`}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="mb-1.5 text-xs text-[var(--text-secondary)]">Style</p>
                  <div className="flex flex-wrap gap-2">
                    {CARD_STYLES.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCardKey(c.id)}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                          cardKey === c.id
                            ? "border-[var(--ink)]/40 bg-[var(--accent-select)] text-[var(--ink)]"
                            : "border-[var(--hairline)] text-[var(--ink)]/80",
                        )}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-1.5 text-xs text-[var(--text-secondary)]">Last 4</p>
                  <div className="flex gap-2">
                    <TextInput
                      value={cardLast4}
                      onChange={(v) =>
                        setCardLast4(v.replace(/\D/g, "").slice(0, 4))
                      }
                      placeholder="0000"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCardLast4(randomCardLast4())}
                    >
                      Random
                    </Button>
                  </div>
                </div>
              </div>
            </Accordion>

            <Accordion
              id="feed"
              openId={openId}
              setOpenId={setOpenId}
              title="Activity feed"
              summary="Fills in to match the vibe."
            >
              <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
                Activity, deposits, and Cash Card spend regenerate from the
                balances and vibe you set when the LARP opens.
              </p>
            </Accordion>
          </div>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--hairline)] bg-[var(--surface)]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="inline-flex items-center gap-2 text-sm text-[var(--ink)]">
            <Check className="size-4" strokeWidth={2} />
            {editing
              ? "Ready to save Cash App LARP."
              : "Ready to create Cash App LARP."}
          </p>
          <div className="flex items-center gap-3">
            <Button
              disabled={creating}
              className="min-w-[140px]"
              onClick={() => {
                setCreating(true);
                const title =
                  internalName.trim() || displayName.trim() || "Cash App LARP";
                const data = collectData();

                if (editing && editId) {
                  const updated = updateLocalLarp(editId, { title, data });
                  if (updated) void syncLarpSnapshot(updated);
                  router.push(`/larps/${editId}`);
                  return;
                }

                const larp = createLocalLarp({
                  title,
                  platform_slug: "cash-app",
                  data,
                });
                void syncLarpSnapshot(larp);
                router.push(`/larps/${encodeURIComponent(larp.id)}`);
              }}
            >
              {creating
                ? editing
                  ? "Saving…"
                  : "Creating…"
                : editing
                  ? "Save changes"
                  : "Create LARP"}
            </Button>
            <Link href={cancelHref}>
              <Button variant="ghost">Cancel</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
