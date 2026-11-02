"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, Dices } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  createLocalLarp,
  getLocalLarp,
  syncLarpSnapshot,
  updateLocalLarp,
} from "@/lib/larps/local-store";
import { hashSeed, mulberry32 } from "@/lib/larps/realistic";
import { cn } from "@/lib/utils";

const SALES_PRESETS = [
  { id: "side", label: "$500/d", today: "$ 512.40", payout: "$ 1,240.00", customers: 48 },
  { id: "growing", label: "$5k/d", today: "$ 5,180.00", payout: "$ 18,400.00", customers: 290 },
  { id: "scale", label: "$50k/d", today: "$ 48,920.00", payout: "$ 164,000.00", customers: 2_400 },
  { id: "huge", label: "$500k/d", today: "$ 512,000.00", payout: "$ 1,840,000.00", customers: 18_500 },
] as const;

const QUICK_STARTS = [
  { id: "tee", label: "Apparel brand", hint: "Tees and drops, steady DTC", sales: "growing" },
  { id: "beauty", label: "Beauty store", hint: "High AOV skincare kits", sales: "scale" },
  { id: "gadget", label: "Gadget shop", hint: "Tech accessories, fast turns", sales: "growing" },
  { id: "side", label: "Side hustle", hint: "A few orders a day", sales: "side" },
  { id: "mega", label: "Viral brand", hint: "Huge daily volume", sales: "huge" },
] as const;

type AccordionId = "quick" | "currency" | "live";

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
  prefix,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  prefix?: string;
}) {
  return (
    <div className="flex items-center rounded-lg border border-[var(--hairline)] bg-[var(--surface-alt)] focus-within:border-[var(--ink)]/40 focus-within:outline-2 focus-within:outline-[var(--accent-ring)] focus-within:outline-offset-2">
      {prefix ? (
        <span className="pl-3.5 text-sm text-[var(--text-secondary)]">{prefix}</span>
      ) : null}
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--text-muted)]"
      />
    </div>
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
    <div className="border-b border-[var(--hairline)]">
      <button
        type="button"
        onClick={() => setOpenId(open ? null : id)}
        className="flex w-full items-center gap-3 py-4 text-left"
      >
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[var(--ink)]">{title}</p>
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

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "store"
  );
}

export function ShopifyNewLarpForm({
  cancelHref = "/platforms/shopify",
  editId,
}: {
  cancelHref?: string;
  editId?: string;
}) {
  const [internalName, setInternalName] = useState("");
  const [storeName, setStoreName] = useState("DELEXO ''s Store");
  const [handle, setHandle] = useState("delexo-s-store");
  const [salesId, setSalesId] = useState("growing");
  const [todaySales, setTodaySales] = useState("$ 5,180.00");
  const [payout, setPayout] = useState("$ 18,400.00");
  const [customers, setCustomers] = useState("290");
  const [currency, setCurrency] = useState("USD");
  const [country, setCountry] = useState("US");
  const [pops, setPops] = useState(true);
  const [openId, setOpenId] = useState<AccordionId | null>(null);
  const [creating, setCreating] = useState(false);
  const [hydratedEdit, setHydratedEdit] = useState(false);
  const [handleTouched, setHandleTouched] = useState(false);
  const router = useRouter();
  const editing = Boolean(editId);

  function applySales(id: string) {
    const p = SALES_PRESETS.find((s) => s.id === id);
    if (!p) return;
    setSalesId(id);
    setTodaySales(p.today);
    setPayout(p.payout);
    setCustomers(String(p.customers));
  }

  function randomize() {
    const rand = mulberry32(hashSeed(`shop|${Date.now()}`));
    const p = SALES_PRESETS[Math.floor(rand() * SALES_PRESETS.length)]!;
    const qs = QUICK_STARTS[Math.floor(rand() * QUICK_STARTS.length)]!;
    const names = [
      "DELEXO ''s Store",
      "Nova Supply Co",
      "Orbit Goods",
      "Marlow Market",
      "Pixel Drop Shop",
    ];
    const name = names[Math.floor(rand() * names.length)]!;
    setStoreName(name);
    setHandle(slugify(name));
    setHandleTouched(false);
    applySales(p.id);
    void qs;
  }

  useEffect(() => {
    if (!editId || hydratedEdit) return;
    const existing = getLocalLarp(editId);
    if (!existing) {
      setHydratedEdit(true);
      return;
    }
    const d = existing.data ?? {};
    setInternalName(existing.title || "");
    setStoreName(String(d.storeName || d.businessName || "DELEXO ''s Store"));
    setHandle(String(d.handle || "delexo-s-store"));
    setHandleTouched(true);
    setTodaySales(String(d.todaySales || "$ 5,180.00"));
    setPayout(String(d.payout || d.balance || "$ 18,400.00"));
    setCustomers(String(d.customers || d.custTotal || "290"));
    setCurrency(String(d.currency || "USD"));
    setCountry(String(d.country || "US"));
    setPops(d.pops !== false);
    setSalesId(String(d.salesId || "growing"));
    setHydratedEdit(true);
  }, [editId, hydratedEdit]);

  const believable = useMemo(() => {
    const sales = Number.parseFloat(todaySales.replace(/[^0-9.]/g, "")) || 0;
    const bal = Number.parseFloat(payout.replace(/[^0-9.]/g, "")) || 0;
    return sales > 0 && bal >= 0;
  }, [todaySales, payout]);

  function collectData() {
    return {
      businessName: storeName,
      storeName,
      handle: handle.trim() || slugify(storeName),
      todaySales,
      payout,
      balance: payout,
      customers: Number.parseInt(customers.replace(/[^0-9]/g, ""), 10) || 0,
      currency,
      country,
      pops,
      salesId,
      chartSeed: Date.now(),
    };
  }

  return (
    <div className="mx-auto w-full max-w-3xl pb-28">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="page-title">
            {editing ? "Edit Shopify LARP" : "New Shopify LARP"}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[var(--text-secondary)]">
            Configure the store. Desktop admin vs mobile Shopify is auto-detected
            when you open the LARP.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={randomize}>
            <Dices className="size-3.5" strokeWidth={2} />
            Randomize
          </Button>
          <Link href={cancelHref}>
            <Button variant="ghost" size="sm">
              Cancel
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        <section className="ll-panel space-y-5 p-5">
          <h2 className="text-sm font-semibold text-[var(--ink)]">Store identity</h2>
          <div>
            <FieldLabel hint="Only in your LarpingKit list.">Internal name</FieldLabel>
            <TextInput
              value={internalName}
              onChange={setInternalName}
              placeholder="Main Shopify store"
            />
          </div>
          <div>
            <FieldLabel>Store name</FieldLabel>
            <TextInput
              value={storeName}
              onChange={(v) => {
                setStoreName(v);
                if (!handleTouched) setHandle(slugify(v));
              }}
            />
          </div>
          <div>
            <FieldLabel>Store handle</FieldLabel>
            <TextInput
              value={handle}
              onChange={(v) => {
                setHandleTouched(true);
                setHandle(v);
              }}
              prefix="myshopify.com/"
            />
          </div>
        </section>

        <section className="ll-panel space-y-5 p-5">
          <h2 className="text-sm font-semibold text-[var(--ink)]">Sales &amp; payouts</h2>
          <div className="flex flex-wrap gap-2">
            {SALES_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applySales(p.id)}
                className={cn(
                  "min-h-11 rounded-full px-4 text-sm font-semibold transition",
                  salesId === p.id
                    ? "bg-[var(--ink)] text-[var(--on-ink)]"
                    : "border border-[var(--hairline)] bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--ink)]/35",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <FieldLabel>Today&apos;s sales</FieldLabel>
              <TextInput value={todaySales} onChange={setTodaySales} />
            </div>
            <div>
              <FieldLabel>Available payout</FieldLabel>
              <TextInput value={payout} onChange={setPayout} />
            </div>
            <div>
              <FieldLabel>Customers</FieldLabel>
              <TextInput value={customers} onChange={setCustomers} />
            </div>
          </div>
          <p
            className={cn(
              "flex items-center gap-2 text-xs",
              believable ? "text-[var(--ink)]" : "text-[var(--text-secondary)]",
            )}
          >
            {believable ? (
              <Check className="size-3.5 shrink-0" strokeWidth={2.5} />
            ) : null}
            {believable
              ? "Numbers look ready."
              : "Add today’s sales to generate charts and orders."}
          </p>
        </section>

        <section className="ll-panel px-5">
          <Accordion
            id="quick"
            openId={openId}
            setOpenId={setOpenId}
            title="Quick start"
            summary={`${QUICK_STARTS.length} store presets`}
          >
            <div className="grid gap-2 sm:grid-cols-2">
              {QUICK_STARTS.map((q) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => applySales(q.sales)}
                  className="rounded-xl border border-[var(--hairline)] px-4 py-3 text-left hover:border-[var(--ink)]/35"
                >
                  <p className="text-sm font-semibold text-[var(--ink)]">{q.label}</p>
                  <p className="mt-0.5 text-xs text-[var(--text-secondary)]">{q.hint}</p>
                </button>
              ))}
            </div>
          </Accordion>

          <Accordion
            id="currency"
            openId={openId}
            setOpenId={setOpenId}
            title="Currency & country"
            summary={`${currency} · ${country === "US" ? "United States" : country}`}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel>Currency</FieldLabel>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="h-11 w-full rounded-lg border border-[var(--hairline)] bg-[var(--surface-alt)] px-3 text-sm"
                >
                  {["USD", "EUR", "GBP", "CAD", "AUD"].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <FieldLabel>Country</FieldLabel>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="h-11 w-full rounded-lg border border-[var(--hairline)] bg-[var(--surface-alt)] px-3 text-sm"
                >
                  {Object.entries({
                    US: "United States",
                    GB: "United Kingdom",
                    CA: "Canada",
                    AU: "Australia",
                    DE: "Germany",
                    FR: "France",
                  }).map(([code, label]) => (
                    <option key={code} value={code}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Accordion>

          <Accordion
            id="live"
            openId={openId}
            setOpenId={setOpenId}
            title="Live view"
            summary={pops ? "Live visitor pops on" : "Live visitor pops off"}
          >
            <button
              type="button"
              onClick={() => setPops((v) => !v)}
              className="flex w-full items-center justify-between rounded-xl border border-[var(--hairline)] px-4 py-3 text-left"
            >
              <span className="text-sm font-medium text-[var(--ink)]">
                Show live visitor pops
              </span>
              <span
                className={cn(
                  "relative h-7 w-[51px] rounded-full transition",
                  pops ? "bg-[var(--ink)]" : "bg-[var(--track-off)]",
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 size-6 rounded-full bg-white transition",
                    pops ? "left-[23px]" : "left-0.5",
                  )}
                />
              </span>
            </button>
          </Accordion>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--hairline)] bg-[var(--surface)]/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-3xl gap-3">
          <Link href={cancelHref} className="hidden sm:block">
            <Button variant="outline" size="lg" className="min-w-[7rem]">
              Cancel
            </Button>
          </Link>
          <Button
            size="lg"
            className="min-w-0 flex-1"
            disabled={creating || !storeName.trim()}
            onClick={() => {
              setCreating(true);
              try {
                const data = collectData();
                const title =
                  internalName.trim() || storeName.trim() || "Shopify";
                if (editing && editId) {
                  const updated = updateLocalLarp(editId, { title, data });
                  if (updated) void syncLarpSnapshot(updated);
                  router.push(`/larps/${editId}`);
                } else {
                  const larp = createLocalLarp({
                    title,
                    platform_slug: "shopify",
                    data,
                  });
                  void syncLarpSnapshot(larp);
                  router.push(`/larps/${larp.id}`);
                }
              } finally {
                setCreating(false);
              }
            }}
          >
            {creating ? "Saving…" : editing ? "Save changes" : "Create LARP"}
          </Button>
        </div>
      </div>
    </div>
  );
}
