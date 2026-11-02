"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  createLocalLarp,
  getLocalLarp,
  syncLarpSnapshot,
  updateLocalLarp,
} from "@/lib/larps/local-store";
import { cn } from "@/lib/utils";

const BAG_PRESETS = [
  {
    id: "starter",
    label: "Starter",
    hint: "First real job money. Believable checking.",
    total: 12400,
    income: 5200,
    score: 710,
  },
  {
    id: "comfortable",
    label: "Comfortable",
    hint: "Dual income, Sapphire lifestyle.",
    total: 186000,
    income: 18400,
    score: 780,
  },
  {
    id: "private",
    label: "Private client",
    hint: "Chase Private Client vibes.",
    total: 86000000,
    income: 4850000,
    score: 836,
  },
  {
    id: "absurd",
    label: "Absurd",
    hint: "Family office numbers.",
    total: 420000000,
    income: 22000000,
    score: 850,
  },
] as const;

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
      className="w-full rounded-lg border border-[var(--hairline)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--ink)]/40 focus:outline-2 focus:outline-[var(--accent-ring)] focus:outline-offset-2"
    />
  );
}

function formatUsd(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function parseUsd(raw: string): number {
  const n = Number(String(raw).replace(/[,$]/g, "").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

function slugUser(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")
      .slice(0, 16) || "chaseuser"
  );
}

export function ChaseNewLarpForm({
  cancelHref = "/platforms/chase",
  editId,
}: {
  cancelHref?: string;
  editId?: string;
}) {
  const router = useRouter();
  const editing = Boolean(editId);
  const [hydratedEdit, setHydratedEdit] = useState(false);
  const [creating, setCreating] = useState(false);

  const [profileName, setProfileName] = useState("Main Chase");
  const [holder, setHolder] = useState("Alex Morgan");
  const [username, setUsername] = useState("alexm1992");
  const [preset, setPreset] = useState("private");
  const [totalUsd, setTotalUsd] = useState(86000000);
  const [totalText, setTotalText] = useState(formatUsd(86000000));
  const [monthlyIncome, setMonthlyIncome] = useState(4850000);
  const [incomeText, setIncomeText] = useState(formatUsd(4850000));
  const [creditScore, setCreditScore] = useState(836);
  const [goalName, setGoalName] = useState("Gulfstream G700");
  const [debitLast4, setDebitLast4] = useState("2471");

  useEffect(() => {
    if (!editId || hydratedEdit) return;
    const existing = getLocalLarp(editId);
    if (!existing) {
      setHydratedEdit(true);
      return;
    }
    const d = existing.data ?? {};
    setProfileName(existing.title || String(d.profileName || "Main Chase"));
    setHolder(String(d.holder || d.displayName || "Alex Morgan"));
    setUsername(String(d.username || "alexm1992").replace(/^@/, ""));
    const total = parseUsd(String(d.totalUsd ?? d.balance ?? 86000000));
    setTotalUsd(total);
    setTotalText(formatUsd(total));
    const income = parseUsd(String(d.monthlyIncome ?? 4850000));
    setMonthlyIncome(income);
    setIncomeText(formatUsd(income));
    setCreditScore(Number(d.creditScore ?? 836) || 836);
    setGoalName(String(d.goalName || "Gulfstream G700"));
    setDebitLast4(String(d.debitLast4 || "2471").slice(-4));
    setPreset(String(d.preset || "private"));
    setHydratedEdit(true);
  }, [editId, hydratedEdit]);

  function applyPreset(id: string) {
    const p = BAG_PRESETS.find((x) => x.id === id);
    if (!p) return;
    setPreset(id);
    setTotalUsd(p.total);
    setTotalText(formatUsd(p.total));
    setMonthlyIncome(p.income);
    setIncomeText(formatUsd(p.income));
    setCreditScore(p.score);
  }

  function collectData() {
    return {
      profileName,
      holder,
      displayName: holder,
      businessName: holder,
      username,
      totalUsd,
      balance: formatUsd(totalUsd),
      monthlyIncome,
      creditScore,
      goalName,
      debitLast4: debitLast4.replace(/\D/g, "").slice(-4).padStart(4, "0"),
      preset,
    };
  }

  return (
    <div className="mx-auto w-full max-w-3xl pb-28">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="page-title">
            {editing ? "Edit Chase LARP" : "New Chase LARP"}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[var(--text-secondary)]">
            Mobile Chase banking app with checking, savings, Sapphire, and
            activity. Balances scale from your net-worth target.
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
          <FieldLabel hint="Internal label vs the name shown in the app.">
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
                Account holder
              </p>
              <TextInput
                value={holder}
                onChange={(v) => {
                  setHolder(v);
                  if (!editing && (!username || username === slugUser(holder))) {
                    setUsername(slugUser(v));
                  }
                }}
              />
            </div>
            <div>
              <p className="mb-1.5 text-xs text-[var(--text-secondary)]">
                Username
              </p>
              <TextInput value={username} onChange={setUsername} />
            </div>
            <div>
              <p className="mb-1.5 text-xs text-[var(--text-secondary)]">
                Debit last 4
              </p>
              <TextInput value={debitLast4} onChange={setDebitLast4} />
            </div>
          </div>
        </section>

        <section className="ll-panel p-5 sm:p-6">
          <FieldLabel hint="Pick a vibe or type an exact net worth.">
            Net worth
          </FieldLabel>
          <div className="grid gap-2 sm:grid-cols-2">
            {BAG_PRESETS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => applyPreset(item.id)}
                className={cn(
                  "rounded-xl border p-3 text-left transition",
                  preset === item.id
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
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="mb-1.5 text-xs text-[var(--text-secondary)]">
                Target net worth
              </p>
              <TextInput
                value={totalText}
                onChange={(v) => {
                  setPreset("custom");
                  setTotalText(v);
                  setTotalUsd(parseUsd(v));
                }}
              />
            </div>
            <div>
              <p className="mb-1.5 text-xs text-[var(--text-secondary)]">
                Monthly income
              </p>
              <TextInput
                value={incomeText}
                onChange={(v) => {
                  setPreset("custom");
                  setIncomeText(v);
                  setMonthlyIncome(parseUsd(v));
                }}
              />
            </div>
          </div>
        </section>

        <section className="ll-panel p-5 sm:p-6">
          <FieldLabel>Extras</FieldLabel>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="mb-1.5 text-xs text-[var(--text-secondary)]">
                Credit score
              </p>
              <TextInput
                value={String(creditScore)}
                onChange={(v) =>
                  setCreditScore(
                    Math.max(300, Math.min(850, Number(v.replace(/\D/g, "")) || 300)),
                  )
                }
              />
            </div>
            <div>
              <p className="mb-1.5 text-xs text-[var(--text-secondary)]">
                Savings goal name
              </p>
              <TextInput value={goalName} onChange={setGoalName} />
            </div>
          </div>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--hairline)] bg-[var(--surface)]/95 px-4 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl gap-2">
          <Link href={cancelHref} className="hidden sm:block">
            <Button variant="ghost">Cancel</Button>
          </Link>
          <Button
            className="flex-1"
            disabled={creating || !holder.trim()}
            onClick={async () => {
              setCreating(true);
              try {
                const data = collectData();
                if (editing && editId) {
                  const updated = updateLocalLarp(editId, {
                    title: profileName.trim() || holder.trim(),
                    data,
                  });
                  if (updated) {
                    syncLarpSnapshot(updated);
                    router.push(`/larps/${updated.id}`);
                    return;
                  }
                }
                const created = createLocalLarp({
                  platform_slug: "chase",
                  title: profileName.trim() || holder.trim(),
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
                ? "Save Chase LARP"
                : "Create Chase LARP"}
          </Button>
        </div>
      </div>
    </div>
  );
}
