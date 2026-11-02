"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  createLocalLarp,
  getLocalLarp,
  syncLarpSnapshot,
  updateLocalLarp,
} from "@/lib/larps/local-store";

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

export function GenericNewLarpForm({
  platformName,
  platformSlug,
  cancelHref,
  editId,
}: {
  platformName: string;
  platformSlug: string;
  cancelHref: string;
  editId?: string;
}) {
  const [internalName, setInternalName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [balance, setBalance] = useState("$ 12,480.00");
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
    setDisplayName(String(d.businessName || d.displayName || ""));
    setBalance(String(d.balance || "$ 12,480.00"));
    setHydratedEdit(true);
  }, [editId, hydratedEdit]);

  return (
    <div className="mx-auto w-full max-w-3xl pb-28">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="page-title">
            {editing ? `Edit ${platformName} LARP` : `New ${platformName} LARP`}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[var(--text-secondary)]">
            Configure the dashboard. Balances and tables are generated from the
            values you set. Layout auto-fits the device that opens it.
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
          <FieldLabel hint="Just for your dashboard list. Not shown in the LARP.">
            Internal name
          </FieldLabel>
          <TextInput
            value={internalName}
            onChange={setInternalName}
            placeholder={`${platformName} main account`}
          />
        </section>

        <section>
          <FieldLabel hint="Shown inside the mock dashboard.">
            Display name
          </FieldLabel>
          <TextInput
            value={displayName}
            onChange={setDisplayName}
            placeholder="Acme Labs"
          />
        </section>

        <section>
          <FieldLabel>Available balance</FieldLabel>
          <div className="mb-3 flex flex-wrap gap-2">
            {["$500", "$5k", "$50k", "$500k"].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() =>
                  setBalance(
                    (
                      {
                        $500: "$ 500.00",
                        $5k: "$ 5,000.00",
                        $50k: "$ 50,000.00",
                        $500k: "$ 500,000.00",
                      } as Record<string, string>
                    )[p],
                  )
                }
                className="rounded-full border border-[var(--hairline)] bg-[var(--surface-alt)] px-3 py-1.5 text-xs font-medium text-[var(--ink)]/80 hover:border-[var(--ink)]/40 hover:text-[var(--ink)]"
              >
                {p}
              </button>
            ))}
          </div>
          <TextInput value={balance} onChange={setBalance} />
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--hairline)] bg-[var(--surface)]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="inline-flex items-center gap-2 text-sm text-[var(--ink)]">
            <Check className="size-4" strokeWidth={2} />
            {editing
              ? `Ready to save ${platformSlug} LARP.`
              : `Ready to create ${platformSlug} LARP.`}
          </p>
          <div className="flex items-center gap-3">
            <Button
              disabled={creating}
              className="min-w-[140px]"
              onClick={() => {
                setCreating(true);
                const title =
                  internalName.trim() ||
                  displayName.trim() ||
                  `${platformName} LARP`;
                const data = {
                  businessName: displayName,
                  balance,
                };

                if (editing && editId) {
                  const updated = updateLocalLarp(editId, { title, data });
                  if (updated) void syncLarpSnapshot(updated);
                  router.push(`/larps/${editId}`);
                  return;
                }

                const larp = createLocalLarp({
                  title,
                  platform_slug: platformSlug,
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
