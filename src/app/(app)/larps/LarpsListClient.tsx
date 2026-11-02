"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { LayoutGrid, Search, Settings2, Share2, Trash2 } from "lucide-react";
import { LarpSettingsDialog } from "@/components/larps/LarpSettingsDialog";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  deleteLocalLarp,
  listLocalLarps,
  type LocalLarp,
} from "@/lib/larps/local-store";
import { getPlatformBySlug } from "@/lib/platforms/catalog";
import { cn } from "@/lib/utils";

type SortMode = "updated" | "name" | "platform";

function platformLabel(slug: string) {
  return getPlatformBySlug(slug)?.name ?? slug.replace(/-/g, " ");
}

function formatUpdated(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function subtitleFor(larp: LocalLarp) {
  const data = larp.data ?? {};
  const biz = String(data.businessName || data.displayName || "").trim();
  if (biz && biz !== larp.title) return biz;
  return platformLabel(larp.platform_slug);
}

async function shareLarp(larp: LocalLarp) {
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/larps/${larp.id}`
      : `/larps/${larp.id}`;
  const title = larp.title || "LARP";

  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share({ title, url, text: `Open ${title} on LarpingKit` });
      return "shared";
    } catch (err) {
      if ((err as Error)?.name === "AbortError") return "cancelled";
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    return "copied";
  } catch {
    return "failed";
  }
}

export function LarpsListClient({ highlightId }: { highlightId?: string }) {
  const [larps, setLarps] = useState<LocalLarp[]>([]);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [sortMode, setSortMode] = useState<SortMode>("updated");
  const [shareState, setShareState] = useState<Record<string, string>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingsLarp, setSettingsLarp] = useState<LocalLarp | null>(null);

  const refresh = () => setLarps(listLocalLarps());

  useEffect(() => {
    refresh();
    setReady(true);
  }, []);

  const platforms = useMemo(() => {
    const slugs = Array.from(new Set(larps.map((l) => l.platform_slug))).sort();
    return slugs.map((slug) => ({ slug, name: platformLabel(slug) }));
  }, [larps]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = larps.filter((larp) => {
      if (platformFilter !== "all" && larp.platform_slug !== platformFilter) {
        return false;
      }
      if (!q) return true;
      const hay = `${larp.title} ${subtitleFor(larp)} ${platformLabel(larp.platform_slug)}`.toLowerCase();
      return hay.includes(q);
    });

    rows = [...rows].sort((a, b) => {
      if (sortMode === "name") return a.title.localeCompare(b.title);
      if (sortMode === "platform") {
        return platformLabel(a.platform_slug).localeCompare(
          platformLabel(b.platform_slug),
        );
      }
      return (
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    });
    return rows;
  }, [larps, platformFilter, query, sortMode]);

  const onDelete = (larp: LocalLarp) => {
    const ok = window.confirm(
      `Delete “${larp.title}”? This can’t be undone on this device.`,
    );
    if (!ok) return;
    setDeletingId(larp.id);
    deleteLocalLarp(larp.id);
    refresh();
    setDeletingId(null);
  };

  const onShare = async (larp: LocalLarp) => {
    const result = await shareLarp(larp);
    if (result === "cancelled") return;
    setShareState((prev) => ({
      ...prev,
      [larp.id]: result === "copied" ? "Copied" : result === "shared" ? "Shared" : "Failed",
    }));
    window.setTimeout(() => {
      setShareState((prev) => {
        const next = { ...prev };
        delete next[larp.id];
        return next;
      });
    }, 1600);
  };

  if (!ready) {
    return (
      <div className="h-40 animate-pulse rounded-[1.5rem] bg-[var(--skeleton)]/40" />
    );
  }

  if (larps.length === 0) {
    return (
      <EmptyState
        icon={<LayoutGrid className="size-8" strokeWidth={2} />}
        title="No LARPs yet"
        description="Create a LARP from a platform and it will show up here."
        action={
          <Link href="/larps/new">
            <Button>Browse platforms</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <form
          className="flex w-full max-w-xl gap-2"
          onSubmit={(e) => e.preventDefault()}
        >
          <label className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--text-muted)]"
              strokeWidth={2}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name..."
              className="h-10 w-full rounded-full border border-[var(--hairline)] bg-[var(--surface-alt)] pl-10 pr-3.5 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--ink)]/40"
            />
          </label>
          <Button type="submit" variant="secondary" size="sm" className="h-10 px-4">
            Search
          </Button>
        </form>

        <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--text-secondary)]">
          <span className="mr-1 tabular-nums">{visible.length} items</span>
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="h-9 rounded-full border border-[var(--hairline)] bg-[var(--surface-alt)] px-3 text-sm text-[var(--ink)] outline-none"
            aria-label="Filter by platform"
          >
            <option value="all">All platforms</option>
            {platforms.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            className="h-9 rounded-full border border-[var(--hairline)] bg-[var(--surface-alt)] px-3 text-sm text-[var(--ink)] outline-none"
            aria-label="Sort LARPs"
          >
            <option value="updated">Recently updated</option>
            <option value="name">Name</option>
            <option value="platform">Platform</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--hairline)] bg-[var(--surface)]">
        <div className="hidden grid-cols-[minmax(0,1.4fr)_140px_120px_minmax(220px,auto)] gap-3 border-b border-[var(--hairline)] px-4 py-3 text-[11px] uppercase tracking-wider text-[var(--text-muted)] md:grid">
          <span>Name</span>
          <span>Platform</span>
          <span>Updated</span>
          <span className="text-right">Actions</span>
        </div>

        <ul className="divide-y divide-[var(--hairline)]">
          {visible.map((larp) => {
            const platform = platformLabel(larp.platform_slug);
            const editHref = `/platforms/${encodeURIComponent(larp.platform_slug)}/new?edit=${encodeURIComponent(larp.id)}`;
            const openHref = `/larps/${larp.id}`;
            const mark = platform.charAt(0).toUpperCase();

            return (
              <li
                key={larp.id}
                className={cn(
                  "grid gap-3 px-4 py-3 md:grid-cols-[minmax(0,1.4fr)_140px_120px_minmax(220px,auto)] md:items-center",
                  highlightId === larp.id && "bg-[var(--accent-select)]",
                )}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[var(--ink)]">
                    {larp.title}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-[var(--text-secondary)]">
                    {subtitleFor(larp)}
                  </p>
                </div>

                <div className="flex items-center">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--hairline)] bg-[var(--surface-alt)] px-2.5 py-1 text-xs text-[var(--ink)]">
                    <span
                      className="grid size-4 place-items-center rounded-full bg-[var(--ink)] text-[9px] font-bold text-white"
                      aria-hidden
                    >
                      {mark}
                    </span>
                    {platform}
                  </span>
                </div>

                <p className="text-sm text-[var(--text-secondary)]">
                  {formatUpdated(larp.updated_at)}
                </p>

                <div className="flex flex-wrap items-center justify-start gap-1.5 md:justify-end">
                  <Link
                    href={editHref}
                    className="inline-flex h-8 items-center justify-center rounded-full px-3.5 text-xs text-[var(--text-secondary)] transition hover:bg-[var(--surface-alt)] hover:text-[var(--ink)]"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => setSettingsLarp(larp)}
                    className="inline-flex h-8 items-center justify-center gap-1 rounded-full px-3 text-xs text-[var(--text-secondary)] transition hover:bg-[var(--surface-alt)] hover:text-[var(--ink)]"
                    aria-label={`Settings for ${larp.title}`}
                  >
                    <Settings2 className="size-3.5" strokeWidth={2} />
                    Settings
                  </button>
                  <Link
                    href={openHref}
                    className="inline-flex h-8 items-center justify-center rounded-full border border-[var(--hairline)] bg-[var(--surface-alt)] px-3.5 text-xs font-medium text-[var(--ink)] transition hover:bg-[var(--surface-alt)]"
                  >
                    Open
                  </Link>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onShare(larp)}
                    aria-label={`Share ${larp.title}`}
                  >
                    <Share2 className="size-3.5" strokeWidth={2} />
                    {shareState[larp.id] ?? "Share"}
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    className="size-8 rounded-lg px-0"
                    disabled={deletingId === larp.id}
                    onClick={() => onDelete(larp)}
                    aria-label={`Delete ${larp.title}`}
                  >
                    <Trash2 className="size-3.5" strokeWidth={2} />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>

        {visible.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-[var(--text-secondary)]">
            No LARPs match this search.
          </p>
        ) : null}
      </div>

      <LarpSettingsDialog
        larp={settingsLarp}
        open={Boolean(settingsLarp)}
        onClose={() => setSettingsLarp(null)}
      />
    </div>
  );
}
