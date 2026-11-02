"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Check, ChevronDown, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  createLocalLarp,
  getLocalLarp,
  syncLarpSnapshot,
  updateLocalLarp,
} from "@/lib/larps/local-store";
import {
  APPROX_USD,
  type ReceiptAsset,
  type ReceiptKind,
  type ReceiptProvider,
} from "@/lib/larps/receipt-payload";
import { cn } from "@/lib/utils";

const KINDS: { key: ReceiptKind; label: string; description: string }[] = [
  { key: "SEND", label: "Sent", description: "You sent crypto to someone." },
  {
    key: "RECEIVE",
    label: "Received",
    description: "Someone sent crypto to you.",
  },
  { key: "BUY", label: "Bought", description: "Bought with USD." },
  { key: "SELL", label: "Sold", description: "Sold for USD." },
];

const ASSETS: ReceiptAsset[] = [
  "BTC",
  "ETH",
  "SOL",
  "USDC",
  "USDT",
  "DOGE",
  "XRP",
];

const AMOUNT_PILLS = [
  { label: "$500", value: 500 },
  { label: "$5K", value: 5_000 },
  { label: "$50K", value: 50_000 },
  { label: "$250K", value: 250_000 },
  { label: "$1M", value: 1_000_000 },
] as const;

const PROVIDERS: {
  key: ReceiptProvider;
  label: string;
  description: string;
  available: boolean;
}[] = [
  {
    key: "COINBASE",
    label: "Coinbase",
    description: "Mobile-style crypto transaction confirmation.",
    available: true,
  },
  {
    key: "VENMO",
    label: "Venmo",
    description: "Peer-to-peer payment confirmation.",
    available: false,
  },
  {
    key: "CASHAPP",
    label: "Cash App",
    description: "Receipt with $cashtag and grid background.",
    available: false,
  },
  {
    key: "STRIPE",
    label: "Stripe",
    description: "Hosted invoice / charge receipt.",
    available: false,
  },
];

type AccordionId = "provider" | "counterparty" | "memo";

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
  id,
  maxLength,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  id?: string;
  maxLength?: number;
}) {
  return (
    <input
      id={id}
      value={value}
      placeholder={placeholder}
      maxLength={maxLength}
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

function formatUsd(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function ReceiptsNewLarpForm({
  cancelHref = "/platforms/receipts",
  editId,
}: {
  cancelHref?: string;
  editId?: string;
}) {
  const [name, setName] = useState("");
  const [kind, setKind] = useState<ReceiptKind>("SEND");
  const [asset, setAsset] = useState<ReceiptAsset>("BTC");
  const [amountUsd, setAmountUsd] = useState(50_000);
  const [amountUsdText, setAmountUsdText] = useState("50000");
  const [amountUnits, setAmountUnits] = useState("");
  const [provider, setProvider] = useState<ReceiptProvider>("COINBASE");
  const [counterparty, setCounterparty] = useState("");
  const [memo, setMemo] = useState("");
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
    setName(String(d.name || existing.title || ""));
    setKind((String(d.kind || "SEND").toUpperCase() as ReceiptKind) || "SEND");
    setAsset((String(d.asset || "BTC").toUpperCase() as ReceiptAsset) || "BTC");
    const usd = Number(d.amountUsd ?? 50_000) || 50_000;
    setAmountUsd(usd);
    setAmountUsdText(String(usd));
    setAmountUnits(
      d.amountUnits == null || d.amountUnits === ""
        ? ""
        : String(d.amountUnits),
    );
    setProvider(
      (String(d.provider || "COINBASE").toUpperCase() as ReceiptProvider) ||
        "COINBASE",
    );
    setCounterparty(String(d.counterparty || ""));
    setMemo(String(d.memo || ""));
    setHydratedEdit(true);
  }, [editId, hydratedEdit]);

  function setUsd(n: number) {
    setAmountUsd(n);
    setAmountUsdText(String(n));
  }

  function onUsdText(v: string) {
    setAmountUsdText(v);
    const n = Number(v.replace(/[^0-9.]/g, ""));
    if (Number.isFinite(n)) setAmountUsd(n);
  }

  const canSubmit = name.trim().length > 0 && amountUsd > 0;
  const providerLabel =
    PROVIDERS.find((p) => p.key === provider)?.label || "Coinbase";
  const approxUnits =
    amountUsd > 0
      ? amountUsd / (APPROX_USD[asset] || 1)
      : 0;

  return (
    <div className="mx-auto w-full max-w-3xl pb-28">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="page-title">
            {editing ? "Edit receipt" : "New receipt"}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[var(--text-secondary)]">
            Coinbase-style transaction confirmation. Set the amount, asset, and
            counterparty — then open the receipt.
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
          <FieldLabel hint="For your reference in the receipts list.">
            Receipt name
          </FieldLabel>
          <TextInput
            value={name}
            onChange={setName}
            placeholder="BTC send to Alex"
            maxLength={60}
          />
        </section>

        <section>
          <FieldLabel hint="Determines headline copy and direction arrow.">
            Transaction type
          </FieldLabel>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {KINDS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setKind(item.key)}
                className={cn(
                  "rounded-xl border p-3 text-left transition",
                  kind === item.key
                    ? "border-[var(--ink)]/40 bg-[var(--accent-select)]"
                    : "border-[var(--hairline)] hover:border-[var(--ink)]/25",
                )}
              >
                <p className="text-sm font-semibold text-[var(--ink)]">
                  {item.label}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-secondary)]">
                  {item.description}
                </p>
              </button>
            ))}
          </div>
        </section>

        <section>
          <FieldLabel hint="The coin or currency moved.">Asset</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {ASSETS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAsset(a)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                  asset === a
                    ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)]"
                    : "border-[var(--hairline)] bg-[var(--surface-alt)] text-[var(--ink)]/80 hover:border-[var(--ink)]/40",
                )}
              >
                {a}
              </button>
            ))}
          </div>
        </section>

        <section>
          <FieldLabel hint="USD value at the time of the txn.">Amount</FieldLabel>
          <div className="mb-3 flex flex-wrap gap-2">
            {AMOUNT_PILLS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setUsd(p.value)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                  amountUsd === p.value
                    ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)]"
                    : "border-[var(--hairline)] bg-[var(--surface-alt)] text-[var(--ink)]/80 hover:border-[var(--ink)]/40",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="grid max-w-md gap-3">
            <div className="flex overflow-hidden rounded-lg border border-[var(--hairline)] bg-[var(--surface-alt)] focus-within:border-[var(--ink)]/40 focus-within:outline-2 focus-within:outline-[var(--accent-ring)] focus-within:outline-offset-2">
              <span className="grid place-items-center border-r border-[var(--hairline)] px-3 text-sm text-[var(--text-secondary)]">
                $
              </span>
              <input
                value={amountUsdText}
                onChange={(e) => onUsdText(e.target.value)}
                inputMode="decimal"
                className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-[var(--ink)] outline-none"
                aria-label="Amount in USD"
              />
            </div>
            <div className="flex overflow-hidden rounded-lg border border-[var(--hairline)] bg-[var(--surface-alt)] focus-within:border-[var(--ink)]/40">
              <input
                value={amountUnits}
                onChange={(e) => setAmountUnits(e.target.value)}
                inputMode="decimal"
                placeholder={`Auto (~${approxUnits ? approxUnits.toPrecision(4) : "0"} ${asset})`}
                className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--text-muted)]"
                aria-label={`Amount in ${asset}`}
              />
              <span className="grid place-items-center border-l border-[var(--hairline)] px-3 text-xs font-medium text-[var(--text-secondary)]">
                {asset}
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              Leave the {asset} field blank to convert {formatUsd(amountUsd)} at
              an approximate live price, or set an exact amount.
            </p>
          </div>
        </section>

        <section>
          <FieldLabel>More settings</FieldLabel>
          <div className="rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] px-4 sm:px-5">
            <Accordion
              id="provider"
              openId={openId}
              setOpenId={setOpenId}
              title="Provider"
              summary={providerLabel}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {PROVIDERS.map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    disabled={!p.available}
                    onClick={() => p.available && setProvider(p.key)}
                    className={cn(
                      "relative rounded-xl border p-4 text-left transition",
                      provider === p.key && p.available
                        ? "border-[var(--ink)]/40 bg-[var(--accent-select)]"
                        : "border-[var(--hairline)]",
                      !p.available && "cursor-not-allowed opacity-60",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-[var(--ink)]">
                        {p.label}
                      </p>
                      {!p.available ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-[var(--hairline)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-secondary)]">
                          <Lock className="size-3" strokeWidth={2} />
                          Soon
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs text-[var(--text-secondary)]">
                      {p.description}
                    </p>
                  </button>
                ))}
              </div>
            </Accordion>

            <Accordion
              id="counterparty"
              openId={openId}
              setOpenId={setOpenId}
              title="Counterparty"
              summary={counterparty.trim() || "None"}
            >
              <FieldLabel
                hint={
                  kind === "SEND"
                    ? "Who you sent it to. Optional."
                    : kind === "RECEIVE"
                      ? "Who sent it to you. Optional."
                      : "Optional."
                }
              >
                Name
              </FieldLabel>
              <TextInput
                value={counterparty}
                onChange={setCounterparty}
                placeholder={kind === "SEND" ? "Alex Kim" : "Anonymous"}
                maxLength={60}
              />
            </Accordion>

            <Accordion
              id="memo"
              openId={openId}
              setOpenId={setOpenId}
              title="Memo"
              summary={memo.trim() || "None"}
            >
              <FieldLabel hint="Optional note shown on the receipt.">
                Memo
              </FieldLabel>
              <TextInput
                value={memo}
                onChange={setMemo}
                placeholder="Rent · January"
                maxLength={140}
              />
            </Accordion>
          </div>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--hairline)] bg-[var(--surface)]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="inline-flex items-center gap-2 text-sm text-[var(--ink)]">
            <Check className="size-4" strokeWidth={2} />
            {editing ? "Ready to save receipt." : "Ready to create receipt."}
          </p>
          <div className="flex items-center gap-3">
            <Button
              disabled={creating || !canSubmit}
              className="min-w-[140px]"
              onClick={() => {
                setCreating(true);
                const title = name.trim() || "Receipt";
                const data = {
                  name: title,
                  provider,
                  kind,
                  asset,
                  amountUsd,
                  amountUnits: amountUnits.trim()
                    ? Number(amountUnits)
                    : null,
                  counterparty: counterparty.trim() || null,
                  memo: memo.trim() || null,
                  occurredAt: Date.now() - 1000 * 60 * 12,
                };

                if (editing && editId) {
                  const updated = updateLocalLarp(editId, { title, data });
                  if (updated) void syncLarpSnapshot(updated);
                  router.push(`/larps/${editId}`);
                  return;
                }

                const larp = createLocalLarp({
                  title,
                  platform_slug: "receipts",
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
                  : "Create receipt"}
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
