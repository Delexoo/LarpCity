"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, CreditCard, LogOut, Menu, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useState } from "react";

export function TopBar({
  email,
  plan = "free",
  onMenuClick,
}: {
  email?: string | null;
  plan?: string;
  onMenuClick?: () => void;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const crumbs = pathname
    .split("/")
    .filter(Boolean)
    .map((segment, index, arr) => ({
      label: segment.replace(/-/g, " "),
      href: `/${arr.slice(0, index + 1).join("/")}`,
    }));
  const lastCrumb = crumbs[crumbs.length - 1];

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b border-white/10 bg-[var(--ink)]/70 px-3 backdrop-blur-sm sm:px-4 md:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-[var(--paper)]/80 transition-colors hover:bg-white/5 hover:text-[var(--paper)] md:hidden"
          aria-label="Open menu"
        >
          <Menu className="size-5" strokeWidth={2} />
        </button>

        <p className="truncate text-sm font-medium capitalize text-[var(--paper)] md:hidden">
          {lastCrumb?.label || "Home"}
        </p>

        <nav className="hidden min-w-0 items-center gap-1 text-sm text-[var(--text-secondary)] md:flex">
          <Link href="/dashboard" className="hover:text-[var(--paper)]">
            Home
          </Link>
          {crumbs.map((crumb) => (
            <span key={crumb.href} className="flex items-center gap-1">
              <ChevronRight className="size-3.5 opacity-50" strokeWidth={2} />
              <Link
                href={crumb.href}
                className="truncate capitalize hover:text-[var(--paper)]"
              >
                {crumb.label}
              </Link>
            </span>
          ))}
        </nav>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <a
          href="https://discord.gg/"
          target="_blank"
          rel="noreferrer"
          className="hidden rounded-full px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--paper)] lg:inline-flex"
        >
          Discord
        </a>
        {plan !== "pro" ? (
          <Link href="/pricing" className="hidden sm:block">
            <Button size="sm">
              <Sparkles className="size-3.5" />
              Upgrade
            </Button>
          </Link>
        ) : null}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex size-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs font-medium text-[var(--paper)]"
          >
            {(email || "U").slice(0, 1).toUpperCase()}
          </button>
          {open ? (
            <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-[0.8rem] border border-white/10 bg-[var(--ink-raised)] p-1 shadow-[0_18px_50px_rgba(0,0,0,0.3)]">
              <div className="border-b border-white/10 px-3 py-2.5">
                <p className="truncate text-xs text-[var(--text-secondary)]">
                  Signed in
                </p>
                <p className="truncate text-sm text-[var(--paper)]">
                  {email || "Account"}
                </p>
              </div>
              <div className="pt-1">
                {plan !== "pro" ? (
                  <Link
                    href="/pricing"
                    className="flex min-h-10 items-center gap-2 rounded-[0.45rem] px-2.5 py-2 text-sm text-[var(--paper)] hover:bg-white/5"
                    onClick={() => setOpen(false)}
                  >
                    <Sparkles className="size-3.5 text-[var(--acid)]" />
                    Upgrade
                  </Link>
                ) : null}
                <Link
                  href="/settings"
                  className="flex min-h-10 items-center gap-2 rounded-[0.45rem] px-2.5 py-2 text-sm text-[var(--paper)] hover:bg-white/5"
                  onClick={() => setOpen(false)}
                >
                  <CreditCard className="size-3.5" strokeWidth={2} />
                  Billing
                </Link>
                <Link
                  href="/"
                  className="flex min-h-10 w-full items-center gap-2 rounded-[0.45rem] px-2.5 py-2 text-sm text-[var(--paper)] hover:bg-white/5"
                  onClick={() => setOpen(false)}
                >
                  <LogOut className="size-3.5" strokeWidth={2} />
                  Back to site
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
