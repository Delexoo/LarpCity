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
import { randomStripeAmounts } from "@/lib/larps/realistic";
import { cn } from "@/lib/utils";

const BALANCE_PRESETS = ["$500", "$5k", "$50k", "$500k", "$5M"] as const;

const QUICK_STARTS = [
  { id: "side", label: "Side project", hint: "91 customers, a few thousand a month" },
  { id: "saas", label: "Growing SaaS", hint: "Steady MRR and subscription volume" },
  { id: "store", label: "Online store", hint: "Product catalog with mixed AOV" },
  { id: "agency", label: "Agency", hint: "23 clients on retainers and projects" },
  { id: "launch", label: "Exploding launch", hint: "Hockey-stick growth, high volume" },
  { id: "risk", label: "High risk", hint: "Supplements, lots of declines and disputes" },
] as const;

type AccordionId =
  | "quick"
  | "currency"
  | "numbers"
  | "vibe"
  | "products"
  | "status"
  | "methods";

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

export function StripeNewLarpForm({
  cancelHref = "/platforms/stripe",
  editId,
}: {
  cancelHref?: string;
  editId?: string;
}) {
  const initial = useMemo(() => randomStripeAmounts(), []);
  const [internalName, setInternalName] = useState("");
  const [businessName, setBusinessName] = useState("DELEXO *");
  const [balance, setBalance] = useState(initial.balance);
  const [gross, setGross] = useState(initial.gross);
  const [net, setNet] = useState(initial.net);
  const [openId, setOpenId] = useState<AccordionId | null>(null);
  const [preset, setPreset] = useState("saas");
  const [currency, setCurrency] = useState("USD");
  const [country, setCountry] = useState("US");
  const [incoming, setIncoming] = useState(initial.incoming);
  const [capital, setCapital] = useState(initial.capital);
  const [newCustomers, setNewCustomers] = useState(initial.newCustomers);
  const [failed, setFailed] = useState(initial.failed);
  const [vibe, setVibe] = useState("Growing");
  const [theme, setTheme] = useState<"Light" | "Dark">("Light");
  const [refunded, setRefunded] = useState(initial.refunded);
  const [disputed, setDisputed] = useState(initial.disputed);
  const [declined, setDeclined] = useState(initial.declined);
  const [linkPct, setLinkPct] = useState("40");
  const [visaPct, setVisaPct] = useState("30");
  const [mcPct, setMcPct] = useState("22");
  const [amexPct, setAmexPct] = useState("8");
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
    setInternalName(existing.title || "");
    setBusinessName(String(d.businessName || existing.title || "DELEXO *"));
    setBalance(String(d.balance || initial.balance));
    setGross(String(d.gross || initial.gross));
    setNet(String(d.net || initial.net));
    setPreset(String(d.preset || "saas"));
    setCurrency(String(d.currency || "USD"));
    setCountry(String(d.country || "US"));
    setIncoming(String(d.incoming || initial.incoming));
    setCapital(String(d.capital || initial.capital));
    setNewCustomers(String(d.newCustomers || initial.newCustomers));
    setFailed(String(d.failed || initial.failed));
    setVibe(String(d.vibe || "Growing"));
    setTheme(String(d.theme || "Light") === "Dark" ? "Dark" : "Light");
    setRefunded(String(d.refunded || initial.refunded));
    setDisputed(String(d.disputed || initial.disputed));
    setDeclined(String(d.declined || initial.declined));
    const pm = (d.paymentMethods || {}) as Record<string, unknown>;
    setLinkPct(String(pm.link ?? "40"));
    setVisaPct(String(pm.visa ?? "30"));
    setMcPct(String(pm.mastercard ?? "22"));
    setAmexPct(String(pm.amex ?? "8"));
    setHydratedEdit(true);
  }, [editId, hydratedEdit, initial]);

  const believable = useMemo(() => {
    const r = Number(refunded);
    const d = Number(disputed);
    const c = Number(declined);
    return r + d + c < 25;
  }, [refunded, disputed, declined]);

  function applyRandomAmounts() {
    const next = randomStripeAmounts(`${Date.now()}`);
    setBalance(next.balance);
    setGross(next.gross);
    setNet(next.net);
    setIncoming(next.incoming);
    setCapital(next.capital);
    setNewCustomers(next.newCustomers);
    setFailed(next.failed);
    setRefunded(next.refunded);
    setDisputed(next.disputed);
    setDeclined(next.declined);
  }

  function applyBalancePreset(presetLabel: string) {
    const map: Record<string, string> = {
      $500: "$ 500.00",
      $5k: "$ 5,000.00",
      $50k: "$ 50,000.00",
      $500k: "$ 500,000.00",
      $5M: "$ 5,000,000.00",
    };
    setBalance(map[presetLabel] ?? balance);
  }

  function collectData() {
    return {
      businessName,
      balance,
      gross,
      net,
      preset,
      currency,
      country,
      incoming,
      capital,
      newCustomers,
      failed,
      vibe,
      theme,
      refunded,
      disputed,
      declined,
      paymentMethods: {
        link: linkPct,
        visa: visaPct,
        mastercard: mcPct,
        amex: amexPct,
      },
      chartSeed: Date.now(),
    };
  }

  return (
    <div className="mx-auto w-full max-w-3xl pb-28">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="page-title">
            {editing ? "Edit Stripe LARP" : "New Stripe LARP"}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[var(--text-secondary)]">
            Amounts start randomized — change them anytime. Charts and activity
            regenerate to stay statistically realistic. Desktop vs mobile is
            auto-detected when you open the LARP.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={applyRandomAmounts}
          >
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

      <div className="mt-8 space-y-8">
        <section>
          <FieldLabel hint="Just for your dashboard list. Not shown in the LARP.">
            Internal name
          </FieldLabel>
          <TextInput
            value={internalName}
            onChange={setInternalName}
            placeholder="Acme main account"
          />
        </section>

        <section>
          <FieldLabel hint="Appears in the Stripe sidebar account switcher and the avatar tooltip.">
            Business name (shown in LARP)
          </FieldLabel>
          <TextInput value={businessName} onChange={setBusinessName} />
        </section>

        <section>
          <FieldLabel>Available balance</FieldLabel>
          <div className="mb-3 flex flex-wrap gap-2">
            {BALANCE_PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => applyBalancePreset(p)}
                className="rounded-full border border-[var(--hairline)] bg-[var(--surface-alt)] px-3 py-1.5 text-xs font-medium text-[var(--ink)]/80 transition hover:border-[var(--ink)]/40 hover:text-[var(--ink)]"
              >
                {p}
              </button>
            ))}
          </div>
          <TextInput value={balance} onChange={setBalance} />
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel>Gross volume (date range)</FieldLabel>
            <TextInput value={gross} onChange={setGross} />
          </div>
          <div>
            <FieldLabel>Net volume (date range)</FieldLabel>
            <TextInput value={net} onChange={setNet} />
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] px-4 sm:px-5">
          <Accordion
            id="quick"
            openId={openId}
            setOpenId={setOpenId}
            title="Quick start"
            summary="Side project · Growing SaaS · Online store · 3 more presets"
          >
            <p className="mb-3 text-xs text-[var(--text-secondary)]">
              Start from a preset
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {QUICK_STARTS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPreset(item.id)}
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
                  <p className="mt-1 text-xs text-[var(--text-secondary)]">
                    {item.hint}
                  </p>
                </button>
              ))}
            </div>
          </Accordion>

          <Accordion
            id="currency"
            openId={openId}
            setOpenId={setOpenId}
            title="Currency and country"
            summary={`${currency} · ${country}`}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel>Currency</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {["USD", "EUR", "GBP", "CAD", "AUD"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCurrency(c)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-medium",
                        currency === c
                          ? "border-[var(--ink)]/40 bg-[var(--accent-select)] text-[var(--ink)]"
                          : "border-[var(--hairline)] text-[var(--ink)]/80",
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <FieldLabel>Country (for bank label)</FieldLabel>
                <TextInput value={country} onChange={setCountry} />
              </div>
            </div>
          </Accordion>

          <Accordion
            id="numbers"
            openId={openId}
            setOpenId={setOpenId}
            title="More numbers"
            summary={`${incoming} incoming · ${capital} Capital offer · ${newCustomers} new customers · ${failed} failed`}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel>Incoming / pending</FieldLabel>
                <TextInput value={incoming} onChange={setIncoming} />
              </div>
              <div>
                <FieldLabel>Capital prequalified offer</FieldLabel>
                <TextInput value={capital} onChange={setCapital} />
              </div>
              <div>
                <FieldLabel>New customers</FieldLabel>
                <TextInput value={newCustomers} onChange={setNewCustomers} />
              </div>
              <div>
                <FieldLabel>Failed payments shown (0 to 4)</FieldLabel>
                <TextInput value={failed} onChange={setFailed} />
              </div>
            </div>
          </Accordion>

          <Accordion
            id="vibe"
            openId={openId}
            setOpenId={setOpenId}
            title="Vibe and theme"
            summary={`${vibe} · ${theme} theme`}
          >
            <div className="space-y-4">
              <div>
                <FieldLabel>Vibe</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Growing",
                    "Steady",
                    "Exploding",
                    "Declining",
                    "New business",
                  ].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setVibe(v)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-medium",
                        vibe === v
                          ? "border-[var(--ink)]/40 bg-[var(--accent-select)] text-[var(--ink)]"
                          : "border-[var(--hairline)] text-[var(--ink)]/80",
                      )}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <FieldLabel>Theme</FieldLabel>
                <div className="flex gap-2">
                  {(["Light", "Dark"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTheme(t)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-medium",
                        theme === t
                          ? "border-[var(--ink)]/40 bg-[var(--accent-select)] text-[var(--ink)]"
                          : "border-[var(--hairline)] text-[var(--ink)]/80",
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Accordion>

          <Accordion
            id="products"
            openId={openId}
            setOpenId={setOpenId}
            title="Products"
            summary="3 products · avg $146.50 · Subscription business"
          >
            <div className="space-y-3">
              {[
                { name: "Pro plan", price: "$29.00", type: "Sub" },
                { name: "Team seat", price: "$12.00", type: "Sub" },
                { name: "Setup fee", price: "$399.00", type: "One-time" },
              ].map((p) => (
                <div
                  key={p.name}
                  className="flex items-center justify-between rounded-xl border border-[var(--hairline)] px-3 py-2.5"
                >
                  <div>
                    <p className="text-sm text-[var(--ink)]">{p.name}</p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {p.type}
                    </p>
                  </div>
                  <p className="text-sm text-[var(--ink)]">{p.price}</p>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm">
                Add product
              </Button>
              <p className="text-xs text-[var(--text-secondary)]">
                Allocation total: <span className="text-[var(--ink)]">100</span>{" "}
                (auto-normalized at render)
              </p>
            </div>
          </Accordion>

          <Accordion
            id="status"
            openId={openId}
            setOpenId={setOpenId}
            title="Status mix (% of payments)"
            summary={`${refunded}% refunded · ${disputed}% disputed · ${declined}% declined`}
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <FieldLabel>Refunded %</FieldLabel>
                <TextInput value={refunded} onChange={setRefunded} />
              </div>
              <div>
                <FieldLabel>Disputed %</FieldLabel>
                <TextInput value={disputed} onChange={setDisputed} />
              </div>
              <div>
                <FieldLabel>Declined %</FieldLabel>
                <TextInput value={declined} onChange={setDeclined} />
              </div>
            </div>
          </Accordion>

          <Accordion
            id="methods"
            openId={openId}
            setOpenId={setOpenId}
            title="Payment method mix"
            summary={`Link ${linkPct} · Visa ${visaPct} · Mastercard ${mcPct} · Amex ${amexPct}`}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel>Link</FieldLabel>
                <TextInput value={linkPct} onChange={setLinkPct} />
              </div>
              <div>
                <FieldLabel>Visa</FieldLabel>
                <TextInput value={visaPct} onChange={setVisaPct} />
              </div>
              <div>
                <FieldLabel>Mastercard</FieldLabel>
                <TextInput value={mcPct} onChange={setMcPct} />
              </div>
              <div>
                <FieldLabel>Amex</FieldLabel>
                <TextInput value={amexPct} onChange={setAmexPct} />
              </div>
            </div>
          </Accordion>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--hairline)] bg-[var(--surface)]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p
            className={cn(
              "inline-flex items-center gap-2 text-sm",
              believable ? "text-[var(--ink)]" : "text-[var(--text-secondary)]",
            )}
          >
            <Check className="size-4" strokeWidth={2} />
            {believable
              ? "Numbers look believable."
              : "Mix looks aggressive — dial back refunds/disputes."}
          </p>
          <div className="flex items-center gap-3">
            <Button
              disabled={creating}
              onClick={() => {
                setCreating(true);
                const title =
                  internalName.trim() ||
                  businessName.trim() ||
                  "Stripe LARP";
                const data = collectData();
                if (editId) {
                  const updated = updateLocalLarp(editId, { title, data });
                  if (updated) void syncLarpSnapshot(updated);
                  router.push(
                    updated
                      ? `/larps/${encodeURIComponent(updated.id)}`
                      : "/dashboard",
                  );
                  return;
                }
                const larp = createLocalLarp({
                  title,
                  platform_slug: "stripe",
                  data,
                });
                void syncLarpSnapshot(larp);
                // Open the viewer so Install uses the correct start_url + cookie handoff.
                router.push(`/larps/${encodeURIComponent(larp.id)}`);
              }}
              className="min-w-[140px]"
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
