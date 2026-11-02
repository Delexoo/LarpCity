"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  AppWindow,
  ArrowLeftRight,
  BadgeDollarSign,
  BarChart2,
  BarChart3,
  Bell,
  BellRing,
  Bike,
  Briefcase,
  Building,
  Building2,
  Car,
  CarFront,
  ChevronLeft,
  ChevronRight,
  Compass,
  CreditCard,
  Cpu,
  Dice5,
  DollarSign,
  FileText,
  Gamepad2,
  Ghost,
  Gift,
  Globe,
  Globe2,
  Heart,
  HeartPulse,
  Home,
  Hotel,
  Images,
  Inbox,
  Instagram,
  Key,
  KeyRound,
  Landmark,
  Layers,
  LayoutGrid,
  LifeBuoy,
  LineChart,
  Link as LinkIcon,
  Mail,
  Megaphone,
  MessageCircle,
  MessageSquare,
  MessageSquareMore,
  Mic,
  Moon,
  Music2,
  Newspaper,
  Plane,
  Plus,
  PlusCircle,
  Receipt,
  Rocket,
  Search,
  Settings,
  Shield,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Star,
  Terminal,
  TrendingUp,
  Trophy,
  Users,
  Wallet,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  NAV_CATALOG,
  NAV_SECTIONS,
  type NavItem,
} from "@/lib/platforms/catalog";
import { LockBadge } from "@/components/ui/LockBadge";
import { Badge } from "@/components/ui/Badge";

const ICONS: Record<string, LucideIcon> = {
  Home,
  LayoutGrid,
  Users,
  Sparkles,
  Images,
  Plus,
  Coins: DollarSign,
  CreditCard,
  Wallet,
  DollarSign,
  BadgeDollarSign,
  ShoppingBag,
  Megaphone,
  Ghost,
  Cpu,
  Briefcase,
  Building2,
  Landmark,
  Shield,
  KeyRound,
  Cake: Gift,
  Feather: Activity,
  Terminal,
  Smartphone,
  Key,
  Youtube: Music2,
  Music2,
  AudioLines: Activity,
  Twitch: Gamepad2,
  Gamepad2,
  Heart,
  Star,
  TrendingUp,
  Car,
  CarFront,
  Zap,
  CandlestickChart: BarChart3,
  LineChart,
  BarChart3,
  ChartSpline: LineChart,
  Moon,
  Activity,
  Building,
  Rocket,
  AppWindow,
  Bell,
  Inbox,
  Receipt,
  Mail,
  MessageCircle,
  PlusCircle,
  Link: LinkIcon,
  Dice5,
  Trophy,
  Compass,
  Settings,
  LifeBuoy,
  Gift,
  Bird: Ghost,
  Globe,
  ArrowLeftRight,
  BarChart2,
  Newspaper,
  FileText,
  MessageSquare,
  BellRing,
  Layers,
  Plane,
  Hotel,
  Bike,
  HeartPulse,
  Mic,
  Globe2,
  Fox: Ghost,
};

function NavIcon({ name }: { name?: string }) {
  const Icon = (name && ICONS[name]) || LayoutGrid;
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

  return (
    <aside
      className={cn(
        "flex h-full flex-col bg-[var(--surface)]",
        mobile
          ? "w-full"
          : cn(
              "sticky top-0 h-screen border-r border-[var(--hairline)] transition-[width] duration-200",
              compact ? "w-[68px]" : "w-[260px]",
            ),
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2.5 border-b border-[var(--hairline)] px-3 py-4",
          compact && "justify-center",
        )}
      >
        {!compact ? (
          <div className="min-w-0 flex-1">
            <p className="wordmark truncate text-[1.35rem] leading-none">
              LarpCity
            </p>
            <Badge tone={isPro ? "pro" : "muted"} className="mt-2">
              {isPro ? "Pro" : "Free"}
            </Badge>
          </div>
        ) : (
          <p className="wordmark text-lg leading-none">L</p>
        )}
        {mobile ? (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-[var(--ink)] hover:bg-[var(--surface-alt)]"
            aria-label="Close menu"
          >
            <X className="size-5" strokeWidth={2} />
          </button>
        ) : null}
      </div>

      {!compact ? (
        <button
          type="button"
          className="mx-3 mt-3 flex h-9 items-center gap-2 rounded-full border border-[var(--hairline)] bg-[var(--bg)] px-3 text-left text-xs text-[var(--text-secondary)]"
        >
          <Search className="size-3.5" strokeWidth={2} />
          <span className="flex-1">Search</span>
          {!mobile ? (
            <kbd className="rounded border border-[var(--hairline)] px-1.5 py-0.5 text-[10px]">
              Ctrl K
            </kbd>
          ) : null}
        </button>
      ) : (
        <button
          type="button"
          className="mx-auto mt-3 flex size-8 items-center justify-center rounded-full border border-[var(--hairline)] text-[var(--text-secondary)]"
          aria-label="Search"
        >
          <Search className="size-3.5" strokeWidth={2} />
        </button>
      )}

      <nav className="flex-1 overflow-y-auto overscroll-contain px-2 py-3">
        {NAV_SECTIONS.map((section) => {
          const items = NAV_CATALOG.filter((i) => i.section === section);
          if (!items.length) return null;
          return (
            <div key={section} className="mb-4">
              {!compact ? (
                <p className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--text-secondary)]">
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

      <div className="border-t border-[var(--hairline)] p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <a
          href="https://discord.gg/"
          target="_blank"
          rel="noreferrer"
          className={cn(
            "mb-1 flex items-center gap-2 rounded-full px-2 py-2 text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-alt)] hover:text-[var(--ink)]",
            compact && "justify-center px-0",
          )}
        >
          <MessageSquareMore className="size-3.5" strokeWidth={2} />
          {!compact ? <span>Support · Discord</span> : null}
        </a>
        {!mobile ? (
          <button
            type="button"
            onClick={onToggle}
            className={cn(
              "flex w-full items-center gap-2 rounded-full px-2 py-2 text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-alt)] hover:text-[var(--ink)]",
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
  return (
  const soon = item.tier === "coming_soon";
  const className = cn(
    "flex min-h-11 items-center gap-2 rounded-full px-2.5 py-1.5 text-[15px] transition-colors duration-150 md:min-h-0",
    soon
      ? "cursor-default text-[var(--text-muted)] opacity-55"
      : active
        ? "bg-[var(--accent-select)] font-semibold text-[var(--ink)]"
        : "font-medium text-[var(--ink)]/75 hover:bg-[var(--surface-alt)] hover:text-[var(--ink)]",
    compact && "justify-center px-0",
  );

  return (
    <li>
      {soon ? (
        <span title={`${item.name} · Soon`} className={className}>
          <NavIcon name={item.icon} />
          {!compact ? (
            <>
              <span className="min-w-0 flex-1 truncate">{item.name}</span>
              <LockBadge tier={item.tier} />
            </>
          ) : null}
        </span>
      ) : (
        <Link
          href={item.href}
          title={item.name}
          onClick={onNavigate}
          className={className}
        >
          <NavIcon name={item.icon} />
          {!compact ? (
            <>
              <span className="min-w-0 flex-1 truncate">{item.name}</span>
              <LockBadge tier={item.tier} />
            </>
          ) : null}
        </Link>
      )}
  );
}
