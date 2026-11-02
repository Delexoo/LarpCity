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
    hint: "$342 balance, splitting rent and dinners",
    balance: "$ 342.00",
    vibe: "STEADY",
  },
  {
    id: "crypto",
    label: "Crypto bro",
    hint: "$18K balance, Bitcoin and ETH flips",
    balance: "$ 18,420.00",
    vibe: "HUSTLER",
  },
  {
    id: "billionaire",
    label: "Billionaire owner",
    hint: "$2.4M balance, paying everyone's tab",
    balance: "$ 2,416,890.25",
    vibe: "INFLUENCER",
  },
  {
    id: "party",
    label: "Party host",
    hint: "Everyone paying back for the night",
    balance: "$ 1,240.00",
    vibe: "PARTYGOER",
  },
  {
    id: "creator",
    label: "Creator",
    hint: "Brand deals and fans paying in",
    balance: "$ 8,650.00",
    vibe: "INFLUENCER",
  },
  {
    id: "college",
    label: "College student",
    hint: "$12 balance, Mom to the rescue",
    balance: "$ 12.00",
    vibe: "STUDENT",
  },
] as const;

const VIBES = [
  { id: "STEADY", label: "Steady" },
  { id: "HUSTLER", label: "Hustler" },
  { id: "PARTYGOER", label: "Partygoer" },
  { id: "STUDENT", label: "Student" },
  { id: "INFLUENCER", label: "Influencer" },
] as const;

const BANK_BRANDS = ["Visa", "Mastercard", "Amex", "Chase", "Bank of America", "Capital One"] as const;

type AccordionId = "vibe" | "feed";

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
        "w-full rounded-lg border border-[var(--hairline)] bg-[var(--surface-alt)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--ink)]/40 focus:outline-2 focus:outline-[var(--accent-ring)] focus:outline-offset-2",
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

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "AM";
  const a = parts[0].charAt(0);
  const b = parts.length > 1 ? parts[parts.length - 1].charAt(0) : "";
  return (a + b).toUpperCase().slice(0, 2);
}

function slugHandle(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 24) || "alexm-1234"
  );
}

export function VenmoNewLarpForm({
  cancelHref = "/platforms/venmo",
  editId,
}: {
  cancelHref?: string;
  editId?: string;
}) {
  const [preset, setPreset] = useState<string>("nine-five");
  const [internalName, setInternalName] = useState("Main Venmo");
  const [initials, setInitials] = useState("AM");
  const [displayName, setDisplayName] = useState("DELEXO '");
  const [handle, setHandle] = useState("alexm-1234");
  const [balance, setBalance] = useState("$ 342.00");
  const [bankBrand, setBankBrand] = useState<string>("Visa");
  const [bankLast4, setBankLast4] = useState("0000");
  const [vibe, setVibe] = useState("STEADY");
  const [openId, setOpenId] = useState<AccordionId | null>(null);
  const [showAll, setShowAll] = useState(false);
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
    setInternalName(existing.title || "Main Venmo");
    setDisplayName(String(d.displayName || d.businessName || d.name || "DELEXO '"));
    setHandle(String(d.handle || d.username || "alexm-1234").replace(/^@/, ""));
    setInitials(String(d.initials || initialsOf(String(d.displayName || d.businessName || ""))));
    setBalance(String(d.balance || "$ 342.00"));
    setBankBrand(String(d.bankBrand || "Visa"));
    setBankLast4(String(d.bankLast4 || "0000").slice(-4));
    setVibe(String(d.vibe || "STEADY").toUpperCase());
    setPreset(String(d.preset || "nine-five"));
    setHydratedEdit(true);
  }, [editId, hydratedEdit]);

  function applyPreset(id: string) {
    const p = PERSON_PRESETS.find((x) => x.id === id);
    if (!p) return;
    setPreset(id);
    setBalance(p.balance);
    setVibe(p.vibe);
  }

  function onDisplayNameChange(v: string) {
    setDisplayName(v);
    if (!editing) {
      setInitials(initialsOf(v));
      if (!handle || handle === slugHandle(displayName)) {
        setHandle(slugHandle(v));
      }
    }
  }

  function collectData() {
    return {
      displayName,
      businessName: displayName,
      name: displayName,
      handle: handle.replace(/^@/, ""),
      initials: initials.slice(0, 2).toUpperCase() || initialsOf(displayName),
      balance,
      bankBrand,
      bankLast4: bankLast4.replace(/\D/g, "").slice(-4).padStart(4, "0"),
      bankIsCard: true,
      vibe,
      preset,
    };
  }

  const vibeLabel = VIBES.find((v) => v.id === vibe)?.label || "Steady";

  return (
    <div className="mx-auto w-full max-w-3xl pb-28">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="page-title">
            {editing ? "Edit Venmo LARP" : "New Venmo LARP"}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[var(--text-secondary)]">
            Set the person, balance, and bank. Website vs phone app is
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
            placeholder="Main Venmo"
          />
        </section>

        <section className="grid gap-4 sm:grid-cols-[7rem_1fr]">
          <div>
            <FieldLabel>Avatar initials</FieldLabel>
            <TextInput
              value={initials}
              onChange={(v) => setInitials(v.slice(0, 2).toUpperCase())}
              placeholder="AM"
            />
          </div>
          <div>
            <FieldLabel>Display name</FieldLabel>
            <TextInput value={displayName} onChange={onDisplayNameChange} />
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel>@handle</FieldLabel>
            <div className="flex overflow-hidden rounded-lg border border-[var(--hairline)] bg-[var(--surface-alt)] focus-within:border-[var(--ink)]/40 focus-within:outline-2 focus-within:outline-[var(--accent-ring)] focus-within:outline-offset-2">
              <span className="grid place-items-center border-r border-[var(--hairline)] px-3 text-sm text-[var(--text-secondary)]">
                @
              </span>
              <input
                value={handle}
                onChange={(e) =>
                  setHandle(e.target.value.replace(/^@/, "").replace(/\s/g, ""))
                }
                className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--text-muted)]"
                placeholder="alexm-1234"
              />
            </div>
          </div>
          <div>
            <FieldLabel>Balance</FieldLabel>
            <TextInput value={balance} onChange={setBalance} placeholder="$ 0.00" />
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel>Bank brand</FieldLabel>
            <select
              value={bankBrand}
              onChange={(e) => setBankBrand(e.target.value)}
              className="w-full appearance-none rounded-lg border border-[var(--hairline)] bg-[var(--surface-alt)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--ink)]/40 focus:outline-2 focus:outline-[var(--accent-ring)] focus:outline-offset-2"
            >
              {BANK_BRANDS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <div>
            <FieldLabel>Bank last 4</FieldLabel>
            <TextInput
              value={bankLast4}
              onChange={(v) => setBankLast4(v.replace(/\D/g, "").slice(0, 4))}
              placeholder="0000"
            />
          </div>
        </section>

        <section>
          <div className="mb-2 flex items-end justify-between gap-3">
            <FieldLabel>More settings</FieldLabel>
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="mb-2 text-xs font-medium text-[var(--text-secondary)] underline-offset-2 hover:text-[var(--ink)] hover:underline"
            >
              {showAll ? "Hide extras" : "Show all settings"}
            </button>
          </div>
          <div className="rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] px-4 sm:px-5">
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
              id="feed"
              openId={openId}
              setOpenId={setOpenId}
              title="Activity feed"
              summary="Fills in to match the vibe."
            >
              <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
                Transactions, notes, and live friend payments are generated from
                the vibe you pick. Open the LARP to see the feed rebuild.
              </p>
            </Accordion>
            {showAll ? (
              <div className="border-t border-[var(--hairline)] py-4">
                <p className="text-xs text-[var(--text-secondary)]">
                  Friends, groups, debit card, and crypto screens follow the
                  balance and vibe automatically.
                </p>
              </div>
            ) : null}
          </div>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--hairline)] bg-[var(--surface)]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="inline-flex items-center gap-2 text-sm text-[var(--ink)]">
            <Check className="size-4" strokeWidth={2} />
            {editing ? "Ready to save Venmo LARP." : "Ready to create Venmo LARP."}
          </p>
          <div className="flex items-center gap-3">
            <Button
              disabled={creating}
              className="min-w-[140px]"
              onClick={() => {
                setCreating(true);
                const title =
                  internalName.trim() || displayName.trim() || "Venmo LARP";
                const data = collectData();

                if (editing && editId) {
                  const updated = updateLocalLarp(editId, { title, data });
                  if (updated) void syncLarpSnapshot(updated);
                  router.push(`/larps/${editId}`);
                  return;
                }

                const larp = createLocalLarp({
                  title,
                  platform_slug: "venmo",
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
