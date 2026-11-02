"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { listLocalLarps } from "@/lib/larps/local-store";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "larpingkit.onboarding.v1";

type Progress = {
  shared?: boolean;
  dismissed?: boolean;
};

export function OnboardingChecklist() {
  const [ready, setReady] = useState(false);
  const [larpCount, setLarpCount] = useState(0);
  const [brandCount, setBrandCount] = useState(0);
  const [shared, setShared] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const larps = listLocalLarps();
    setLarpCount(larps.length);
    setBrandCount(new Set(larps.map((l) => l.platform_slug)).size);
    try {
      if (localStorage.getItem(STORAGE_KEY) == null) {
        const legacy = localStorage.getItem("larpcity.onboarding.v1");
        if (legacy != null) localStorage.setItem(STORAGE_KEY, legacy);
      }
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const p = JSON.parse(raw) as Progress;
        setShared(Boolean(p.shared));
        setDismissed(Boolean(p.dismissed));
      }
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  function persist(next: Progress) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }

  if (!ready || dismissed) return null;

  const steps = [
    {
      id: "first",
      done: larpCount >= 1,
      title: "Make your first LARP",
      body: "Pick a platform and set your numbers.",
      href: "/larps/new",
      cta: "Create",
    },
    {
      id: "share",
      done: shared,
      title: "Share it",
      body: "Copy a link from Home or open a LARP and share.",
      href: "/dashboard",
      cta: "Mark done",
      onCta: () => {
        setShared(true);
        persist({ shared: true, dismissed });
      },
    },
    {
      id: "second",
      done: brandCount >= 2,
      title: "Try a second brand",
      body: "Build another platform so your library feels real.",
      href: "/larps/new",
      cta: "Browse",
    },
    {
      id: "install",
      done: false,
      title: "Install to home screen",
      body: "Open a LARP on your phone and add it to the home screen.",
      href: "/dashboard",
      cta: "My LARPs",
    },
  ] as const;

  const doneCount = steps.filter((s) => s.done).length;
  if (doneCount >= steps.length) return null;

  return (
    <section className="rounded-[1.5rem] border border-[var(--hairline)] bg-[var(--surface)] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-[var(--ink)]">Get started</h2>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            {doneCount} of {steps.length} done
          </p>
        </div>
        <button
          type="button"
          className="text-xs text-[var(--text-muted)] hover:text-[var(--ink)]"
          onClick={() => {
            setDismissed(true);
            persist({ shared, dismissed: true });
          }}
        >
          Dismiss
        </button>
      </div>
      <ul className="mt-4 space-y-2">
        {steps.map((step) => (
          <li
            key={step.id}
            className="flex items-center gap-3 rounded-xl border border-[var(--hairline)] bg-[var(--bg)] px-3 py-2.5"
          >
            <span
              className={cn(
                "grid size-6 shrink-0 place-items-center rounded-full border",
                step.done
                  ? "border-[var(--ink)] bg-[var(--ink)] text-white"
                  : "border-[var(--hairline)] text-transparent",
              )}
            >
              <Check className="size-3.5" strokeWidth={2.5} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[var(--ink)]">{step.title}</p>
              <p className="text-xs text-[var(--text-secondary)]">{step.body}</p>
            </div>
            {!step.done ? (
              "onCta" in step && step.onCta ? (
                <button
                  type="button"
                  onClick={step.onCta}
                  className="shrink-0 text-xs font-semibold text-[var(--ink)]"
                >
                  {step.cta}
                </button>
              ) : (
                <Link
                  href={step.href}
                  className="shrink-0 text-xs font-semibold text-[var(--ink)]"
                >
                  {step.cta}
                </Link>
              )
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
