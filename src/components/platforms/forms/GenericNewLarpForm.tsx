"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Monitor, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createLocalLarp } from "@/lib/larps/local-store";
import { cn } from "@/lib/utils";

function FieldLabel({
  children,
  hint,
}: {
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="mb-2">
      <p className="text-sm font-medium text-[var(--paper)]">{children}</p>
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
      className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-[var(--paper)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--acid)]/40 focus:outline-2 focus:outline-[color-mix(in_oklab,var(--acid)_45%,transparent)] focus:outline-offset-2"
    />
  );
}

export function GenericNewLarpForm({
  platformName,
  platformSlug,
  cancelHref,
}: {
  platformName: string;
  platformSlug: string;
  cancelHref: string;
}) {
  const [internalName, setInternalName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [balance, setBalance] = useState("$ 12,480.00");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  return (
    <div className="mx-auto w-full max-w-3xl pb-28">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="page-title">New {platformName} LARP</h1>
          <p className="mt-2 max-w-xl text-sm text-[var(--text-secondary)]">
            Configure the dashboard. Balances and tables are generated from the
            values you set.
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
                className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-[var(--paper)]/80 hover:border-[var(--acid)]/40 hover:text-[var(--acid)]"
              >
                {p}
              </button>
            ))}
          </div>
          <TextInput value={balance} onChange={setBalance} />
        </section>

        <section>
          <FieldLabel>Device</FieldLabel>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setDevice("desktop")}
              className={cn(
                "rounded-xl border bg-white/[0.02] p-4 text-left",
                device === "desktop"
                  ? "border-[#635bff] shadow-[0_0_0_1px_#635bff]"
                  : "border-white/10",
              )}
            >
              <div className="flex items-center gap-2">
                <Monitor className="size-4" strokeWidth={2} />
                <p className="text-sm font-semibold">Desktop</p>
              </div>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                {platformName} web dashboard.
              </p>
            </button>
            <button
              type="button"
              onClick={() => setDevice("mobile")}
              className={cn(
                "rounded-xl border bg-white/[0.02] p-4 text-left",
                device === "mobile"
                  ? "border-[#635bff] shadow-[0_0_0_1px_#635bff]"
                  : "border-white/10",
              )}
            >
              <div className="flex items-center gap-2">
                <Smartphone className="size-4" strokeWidth={2} />
                <p className="text-sm font-semibold">Mobile</p>
              </div>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                Phone-format {platformName} app.
              </p>
            </button>
          </div>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-[var(--ink)]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="inline-flex items-center gap-2 text-sm text-emerald-400">
            <Check className="size-4" strokeWidth={2} />
            Ready to create {platformSlug} LARP.
          </p>
          <div className="flex items-center gap-3">
            <Button
              disabled={creating}
              className="min-w-[140px]"
              onClick={() => {
                setCreating(true);
                const larp = createLocalLarp({
                  title:
                    internalName.trim() ||
                    displayName.trim() ||
                    `${platformName} LARP`,
                  platform_slug: platformSlug,
                  data: {
                    businessName: displayName,
                    balance,
                    device,
                  },
                });
                router.push(`/larps?created=${encodeURIComponent(larp.id)}`);
              }}
            >
              {creating ? "Creating…" : "Create LARP"}
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
