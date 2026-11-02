"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { GenericPreview, type PreviewData } from "./previews/GenericPreview";
import { StripePreview } from "./previews/StripePreview";
import { CoinbasePreview } from "./previews/CoinbasePreview";
import { CashAppPreview } from "./previews/CashAppPreview";
import { PhantomPreview } from "./previews/PhantomPreview";

export type LarpFormData = PreviewData & {
  title?: string;
};

const DEFAULT_TX = `[
  { "label": "Payment received", "amount": "+$1,200.00", "date": "Today" },
  { "label": "Transfer out", "amount": "-$250.00", "date": "Yesterday" }
]`;

function parseTransactions(raw: string): PreviewData["transactions"] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function PlatformEditor({
  platformName,
  platformSlug,
  initial,
  onSave,
  saving,
}: {
  platformName: string;
  platformSlug: string;
  initial?: LarpFormData;
  onSave: (payload: { title: string; data: PreviewData }) => Promise<void> | void;
  saving?: boolean;
}) {
  const [title, setTitle] = useState(initial?.title || "Untitled LARP");
  const [balance, setBalance] = useState(initial?.balance || "$12,480.00");
  const [businessName, setBusinessName] = useState(
    initial?.businessName || "Acme Labs",
  );
  const [username, setUsername] = useState(initial?.username || "founder");
  const [transactionsJson, setTransactionsJson] = useState(
    initial?.transactions
      ? JSON.stringify(initial.transactions, null, 2)
      : DEFAULT_TX,
  );
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [mobilePane, setMobilePane] = useState<"edit" | "preview">("edit");

  const previewData = useMemo<PreviewData>(() => {
    const transactions = parseTransactions(transactionsJson);
    return { balance, businessName, username, transactions };
  }, [balance, businessName, username, transactionsJson]);

  function renderPreview() {
    switch (platformSlug) {
      case "stripe":
        return <StripePreview data={previewData} />;
      case "coinbase":
        return <CoinbasePreview data={previewData} />;
      case "cash-app":
        return <CashAppPreview data={previewData} />;
      case "phantom":
        return <PhantomPreview data={previewData} />;
      default:
        return (
          <GenericPreview platformName={platformName} data={previewData} />
        );
    }
  }

  async function handleSave() {
    try {
      JSON.parse(transactionsJson);
      setJsonError(null);
    } catch {
      setJsonError("Transactions must be valid JSON");
      return;
    }
    await onSave({
      title,
      data: previewData,
    });
  }

  const form = (
    <div className="ll-panel space-y-4 p-4 sm:p-5">
      <div>
        <label className="text-xs text-[var(--text-secondary)]">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input-line mt-1.5"
        />
      </div>
      <div className="grid gap-4">
        <div>
          <label className="text-xs text-[var(--text-secondary)]">Balance</label>
          <input
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            className="input-line mt-1.5"
          />
        </div>
        <div>
          <label className="text-xs text-[var(--text-secondary)]">
            Username
          </label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input-line mt-1.5"
          />
        </div>
      </div>
      <div>
        <label className="text-xs text-[var(--text-secondary)]">
          Business name
        </label>
        <input
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          className="input-line mt-1.5"
        />
      </div>
      <div>
        <label className="text-xs text-[var(--text-secondary)]">
          Transactions (JSON)
        </label>
        <textarea
          value={transactionsJson}
          onChange={(e) => setTransactionsJson(e.target.value)}
          rows={8}
          className="textarea-ink mt-1.5 font-mono text-xs"
        />
        {jsonError ? (
          <p className="mt-1 text-xs text-[var(--coral)]">{jsonError}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
          {saving ? "Saving…" : "Save LARP"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full lg:hidden"
          onClick={() => setMobilePane("preview")}
        >
          View preview
        </Button>
      </div>
    </div>
  );

  const preview = (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-wider text-[var(--text-secondary)]">
          Live preview
        </p>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="lg:hidden"
          onClick={() => setMobilePane("edit")}
        >
          Back to edit
        </Button>
      </div>
      <div className="overflow-hidden rounded-2xl border border-white/10">
        {renderPreview()}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex max-w-full gap-1 overflow-x-auto rounded-[0.8rem] border border-white/10 p-1 lg:hidden">
        <button
          type="button"
          onClick={() => setMobilePane("edit")}
          className={cn(
            "min-h-10 flex-1 rounded-lg text-sm font-medium transition",
            mobilePane === "edit"
              ? "bg-[var(--accent-select)] text-[var(--acid)] shadow-[inset_0_0_0_1px_rgba(204,255,0,0.16)]"
              : "text-[var(--text-muted)]",
          )}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => setMobilePane("preview")}
          className={cn(
            "min-h-10 flex-1 rounded-lg text-sm font-medium transition",
            mobilePane === "preview"
              ? "bg-[var(--accent-select)] text-[var(--acid)] shadow-[inset_0_0_0_1px_rgba(204,255,0,0.16)]"
              : "text-[var(--text-muted)]",
          )}
        >
          Preview
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className={cn(mobilePane !== "edit" && "hidden lg:block")}>
          {form}
        </div>
        <div className={cn(mobilePane !== "preview" && "hidden lg:block")}>
          {preview}
        </div>
      </div>
    </div>
  );
}
