"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Compass,
  Dice5,
  Gift,
  Home,
  Images,
  LayoutGrid,
  LifeBuoy,
  Link as LinkIcon,
  MessageSquareMore,
  Search,
  Settings,
  Smartphone,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  NAV_CATALOG,
  NAV_SECTIONS,
  type NavItem,
} from "@/lib/platforms/catalog";
import { hasPlatformLogo } from "@/lib/larps/platform-brand";
import { LockBadge } from "@/components/ui/LockBadge";
import { Badge } from "@/components/ui/Badge";
import { PlatformLogo } from "@/components/platforms/PlatformLogo";

const GENERIC_ICONS: Record<string, LucideIcon> = {
  Home,
  Images,
  Settings,
  LifeBuoy,
  Gift,
  Smartphone,
  Link: LinkIcon,
  Dice5,
  Compass,
  LayoutGrid,
};

/** Nav items that are app chrome — not brand platforms. */
const GENERIC_SLUGS = new Set([
  "home",
  "library",
  "settings",
  "support",
  "refer",
  "companion-app",
  "wallet-links",
  "casino-larp",
  "safari",
  "app-larps",
  "notifications",
  "inbox",
  "browse-seeds-keys",
]);

function SidebarIcon({ item }: { item: NavItem }) {
  if (!GENERIC_SLUGS.has(item.slug) && hasPlatformLogo(item.slug)) {
    return (
      <PlatformLogo
        slug={item.slug}
        name={item.name}
        size={20}
        className="rounded-[6px]"
        fit="cover"
      />
    );
  }

  if (!GENERIC_SLUGS.has(item.slug)) {
    // Letter tile when we don't have a brand file yet
    const letter = item.name.trim().charAt(0).toUpperCase() || "?";
    return (
      <span
        className="inline-flex size-5 shrink-0 items-center justify-center rounded-[6px] bg-[var(--surface-alt)] text-[10px] font-bold text-[var(--ink)]"
        aria-hidden
      >
        {letter}
      </span>
    );
  }

  const Icon = (item.icon && GENERIC_ICONS[item.icon]) || LayoutGrid;
  return <Icon className="size-4 shrink-0" strokeWidth={2} />;
}

export function AppSidebar({
  plan = "free",
  collapsed,
  onToggle,
  mobile = false,
  onClose,
}: {
  plan?: string;
  collapsed: boolean;
  onToggle: () => void;
  mobile?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const isPro = plan === "pro";
  const compact = collapsed && !mobile;

  function openSearch() {
    window.dispatchEvent(new Event("larpingkit:cmdk"));
  }

  return (
    <aside
      className={cn(
        "flex h-full flex-col bg-[var(--surface)]",
        mobile
          ? "w-full"
          : cn(
              "sticky top-0 h-screen border-r border-[var(--hairline)] transition-[width] duration-200",
              compact ? "w-[64px]" : "w-[240px]",
            ),
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2 border-b border-[var(--hairline)] px-3 py-3",
          compact && "justify-center",
        )}
      >
        {!compact ? (
          <div className="min-w-0 flex-1">
            <p className="wordmark truncate text-[1.2rem] leading-none">
              LarpingKit
            </p>
            <Badge tone={isPro ? "pro" : "muted"} className="mt-1.5">
              {isPro ? "Pro" : "Free"}
            </Badge>
          </div>
        ) : (
          <p className="wordmark text-base leading-none">L</p>
        )}
        {mobile ? (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-[var(--ink)] hover:bg-[var(--surface-alt)]"
            aria-label="Close menu"
          >
            <X className="size-4" strokeWidth={2} />
          </button>
        ) : null}
      </div>

      {!compact ? (
        <button
          type="button"
          onClick={openSearch}
          className="mx-2.5 mt-2.5 flex h-8 items-center gap-2 rounded-full border border-[var(--hairline)] bg-[var(--bg)] px-2.5 text-left text-xs text-[var(--text-secondary)] transition hover:border-[var(--ink)]/20 hover:text-[var(--ink)]"
        >
          <Search className="size-3.5" strokeWidth={2} />
          <span className="flex-1">Search</span>
          {!mobile ? (
            <kbd className="rounded border border-[var(--hairline)] px-1.5 py-0.5 text-[10px]">
              ⌘K
            </kbd>
          ) : null}
        </button>
      ) : (
        <button
          type="button"
          onClick={openSearch}
          className="mx-auto mt-2.5 flex size-8 items-center justify-center rounded-full border border-[var(--hairline)] text-[var(--text-secondary)] hover:text-[var(--ink)]"
          aria-label="Search"
        >
          <Search className="size-3.5" strokeWidth={2} />
        </button>
      )}

      <nav className="flex-1 overflow-y-auto overscroll-contain px-1.5 py-2">
        {NAV_SECTIONS.map((section) => {
          const items = NAV_CATALOG.filter((i) => i.section === section);
          if (!items.length) return null;
          return (
            <div key={section} className="mb-3">
              {!compact ? (
                <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-[0.05em] text-[var(--text-secondary)]">
                  {section}
                </p>
              ) : null}
              <ul className="space-y-0.5">
                {items.map((item) => (
                  <SidebarLink
                    key={item.id}
                    item={item}
                    active={
                      pathname === item.href ||
                      pathname.startsWith(`${item.href}/`)
                    }
                    compact={compact}
                    onNavigate={mobile ? onClose : undefined}
                  />
                ))}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-[var(--hairline)] p-1.5 pb-[max(0.4rem,env(safe-area-inset-bottom))]">
        <a
          href="https://discord.gg/"
          target="_blank"
          rel="noreferrer"
          className={cn(
            "mb-0.5 flex items-center gap-2 rounded-full px-2 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-alt)] hover:text-[var(--ink)]",
            compact && "justify-center px-0",
          )}
        >
          <MessageSquareMore className="size-3.5" strokeWidth={2} />
          {!compact ? <span>Discord</span> : null}
        </a>
        {!mobile ? (
          <button
            type="button"
            onClick={onToggle}
            className={cn(
              "flex w-full items-center gap-2 rounded-full px-2 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-alt)] hover:text-[var(--ink)]",
              compact && "justify-center px-0",
            )}
          >
            {compact ? (
              <ChevronRight className="size-3.5" strokeWidth={2} />
            ) : (
              <>
                <ChevronLeft className="size-3.5" strokeWidth={2} />
                Collapse
              </>
            )}
          </button>
        ) : null}
      </div>
    </aside>
  );
}

function SidebarLink({
  item,
  active,
  compact,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  compact: boolean;
  onNavigate?: () => void;
}) {
  const soon = item.tier === "coming_soon";
  return (
    <li>
      <Link
        href={item.href}
        title={soon ? `${item.name} · Soon` : item.name}
        onClick={onNavigate}
        className={cn(
          "flex min-h-9 items-center gap-2 rounded-full px-2 py-1.5 text-[13px] transition-colors duration-150 md:min-h-0",
          soon
            ? "text-[var(--text-muted)] opacity-55 hover:bg-[var(--surface-alt)] hover:opacity-75"
            : active
              ? "bg-[var(--accent-select)] font-semibold text-[var(--ink)]"
              : "font-medium text-[var(--ink)]/80 hover:bg-[var(--surface-alt)] hover:text-[var(--ink)]",
          compact && "justify-center px-0",
        )}
      >
        <SidebarIcon item={item} />
        {!compact ? (
          <>
            <span className="min-w-0 flex-1 truncate">{item.name}</span>
            <LockBadge tier={item.tier} />
          </>
        ) : null}
      </Link>
    </li>
  );
}
