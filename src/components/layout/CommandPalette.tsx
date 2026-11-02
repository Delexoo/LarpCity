"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { NAV_CATALOG } from "@/lib/platforms/catalog";
import { hasPlatformLogo } from "@/lib/larps/platform-brand";
import { PlatformLogo } from "@/components/platforms/PlatformLogo";
import { cn } from "@/lib/utils";

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    }
    function onOpen() {
      setOpen(true);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("larpingkit:cmdk", onOpen as EventListener);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("larpingkit:cmdk", onOpen as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!open) setQ("");
  }, [open]);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return NAV_CATALOG.slice(0, 14);
    return NAV_CATALOG.filter(
      (i) =>
        i.name.toLowerCase().includes(needle) ||
        i.section.toLowerCase().includes(needle) ||
        i.slug.includes(needle),
    ).slice(0, 18);
  }, [q]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh]">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close search"
        onClick={() => setOpen(false)}
      />
      <div className="relative z-[1] w-full max-w-md overflow-hidden rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] shadow-xl">
        <div className="flex items-center gap-2 border-b border-[var(--hairline)] px-3">
          <Search className="size-4 text-[var(--text-muted)]" strokeWidth={2} />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search platforms…"
            className="h-11 flex-1 bg-transparent text-sm text-[var(--ink)] outline-none placeholder:text-[var(--text-muted)]"
          />
          <kbd className="rounded border border-[var(--hairline)] px-1.5 py-0.5 text-[10px] text-[var(--text-muted)]">
            esc
          </kbd>
        </div>
        <ul className="max-h-72 overflow-y-auto p-1.5">
          {results.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-[var(--text-secondary)]">
              No matches
            </li>
          ) : (
            results.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    router.push(item.href);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm transition",
                    "hover:bg-[var(--surface-alt)]",
                  )}
                >
                  {hasPlatformLogo(item.slug) ? (
                    <PlatformLogo
                      slug={item.slug}
                      name={item.name}
                      size={20}
                      className="rounded-[5px]"
                    />
                  ) : (
                    <span className="inline-flex size-5 items-center justify-center rounded-[5px] bg-[var(--surface-alt)] text-[10px] font-bold">
                      {item.name.charAt(0)}
                    </span>
                  )}
                  <span className="min-w-0 flex-1 truncate font-medium text-[var(--ink)]">
                    {item.name}
                  </span>
                  <span className="shrink-0 text-[11px] text-[var(--text-muted)]">
                    {item.tier === "coming_soon" ? "Soon" : item.section}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
