"use client";

import Link from "next/link";

/** Persistent Free-plan mark over LARP viewers. Pro removes it. */
export function LarpWatermark() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[80] overflow-hidden"
      aria-hidden
    >
      <div
        className="absolute inset-[-20%] flex flex-wrap content-center justify-center gap-x-16 gap-y-24 opacity-[0.14]"
        style={{ transform: "rotate(-28deg)" }}
      >
        {Array.from({ length: 24 }).map((_, i) => (
          <span
            key={i}
            className="select-none whitespace-nowrap text-2xl font-bold tracking-tight text-black sm:text-3xl"
          >
            LarpCity
          </span>
        ))}
      </div>
      <div className="pointer-events-auto absolute bottom-4 left-1/2 z-[81] w-[min(92vw,22rem)] -translate-x-1/2">
        <Link
          href="/pricing"
          className="flex items-center justify-between gap-3 rounded-full border border-[var(--hairline)] bg-[var(--surface)]/95 px-4 py-2.5 text-left shadow-[var(--shadow-card)] backdrop-blur-sm"
        >
          <span className="min-w-0">
            <span className="block text-xs font-semibold text-[var(--ink)]">
              Free plan watermark
            </span>
            <span className="block truncate text-[11px] text-[var(--text-secondary)]">
              Upgrade to Pro to remove it forever
            </span>
          </span>
          <span className="shrink-0 rounded-full bg-[var(--ink)] px-3 py-1 text-[11px] font-semibold text-[var(--on-ink)]">
            Remove
          </span>
        </Link>
      </div>
    </div>
  );
}
