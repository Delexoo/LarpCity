"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { NAV_CATALOG } from "@/lib/platforms/catalog";
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
    window.addEventListener("larpcity:cmdk", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("larpcity:cmdk", onOpen);
    };
  }, []);

  useEffect(() => {
    if (!open) setQ("");
  }, [open]);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const items = NAV_CATALOG.filter(
      (i) => i.section !== "Coming soon" || i.tier === "coming_soon",
    );
    if (!needle) return items.slice(0, 12);
    return items
      .filter(
        (i) =>
          i.name.toLowerCase().includes(needle) ||
          i.section.toLowerCase().includes(needle) ||
          i.slug.includes(needle),
      )
      .slice(0, 16);
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
      <div className="relative z-[1] w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] shadow-xl">
        <div className="flex items-center gap-2 border-b border-[var(--hairline)] px-3">
          <Search className="size-4 text-[var(--text-muted)]" strokeWidth={2} />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search platforms, pages…"
            className="h-12 flex-1 bg-transparent text-sm text-[var(--ink)] outline-none placeholder:text-[var(--text-muted)]"
          />
          <kbd className="rounded border border-[var(--hairline)] px-1.5 py-0.5 text-[10px] text-[var(--text-muted)]">
            esc
          </kbd>
        </div>
        <ul className="max-h-80 overflow-y-auto p-2">
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
                    "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition",
                    "hover:bg-[var(--surface-alt)]",
                  )}
                >
                  <span className="font-medium text-[var(--ink)]">{item.name}</span>
                  <span className="text-xs text-[var(--text-muted)]">
                    {item.section}
                    {item.tier === "coming_soon" ? " · Soon" : ""}
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

export function openCommandPaletteEvent() {
  window.dispatchEvent(new CustomEvent("larpcity:cmdk"));
}
