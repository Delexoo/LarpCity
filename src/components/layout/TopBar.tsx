"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, CreditCard, LogOut } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { BurgerIcon } from "./BurgerIcon";
import { cn } from "@/lib/utils";

export function TopBar({
  email,
  plan = "free",
  onMenuClick,
  menuOpen = false,
}: {
  email?: string | null;
  plan?: string;
  onMenuClick?: () => void;
  menuOpen?: boolean;
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
    <header className="sticky top-0 z-30 flex h-12 items-center justify-between gap-2 border-b border-[var(--hairline)] bg-[var(--surface)]/90 px-3 backdrop-blur-xl sm:px-4 md:px-5">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <button
          type="button"
          onClick={onMenuClick}
          className={cn(
            "inline-flex size-10 shrink-0 items-center justify-center rounded-full text-[var(--ink)] transition-colors hover:bg-[var(--surface-alt)] md:hidden",
            menuOpen && "bg-[var(--surface-alt)]",
          )}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          <BurgerIcon open={menuOpen} />
        </button>

        <p className="truncate text-sm font-semibold capitalize tracking-tight text-[var(--ink)] md:hidden">
          {lastCrumb?.label || "Home"}
        </p>

        <nav className="hidden min-w-0 items-center gap-1 text-sm text-[var(--text-secondary)] md:flex">
          <Link href="/dashboard" className="hover:text-[var(--ink)]">
            Home
          </Link>
          {crumbs.map((crumb) => (
            <span key={crumb.href} className="flex items-center gap-1">
              <ChevronRight className="size-3.5 opacity-50" strokeWidth={2} />
              <Link
                href={crumb.href}
                className="truncate capitalize hover:text-[var(--ink)]"
              >
                {crumb.label}
              </Link>
            </span>
          ))}
        </nav>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        {plan !== "pro" ? (
          <Link href="/pricing" className="hidden sm:block">
            <Button size="sm" variant="outline">
              Upgrade
            </Button>
          </Link>
        ) : null}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex size-8 items-center justify-center rounded-full border border-[var(--hairline)] bg-[var(--surface-alt)] text-xs font-semibold text-[var(--ink)]"
          >
            {(email || "U").slice(0, 1).toUpperCase()}
          </button>
          {open ? (
            <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-[1.15rem] border border-[var(--hairline)] bg-[var(--surface)] p-1 shadow-[var(--shadow-card)]">
              <div className="border-b border-[var(--hairline)] px-3 py-2.5">
                <p className="truncate text-xs text-[var(--text-secondary)]">
                  Signed in
                </p>
                <p className="truncate text-sm text-[var(--ink)]">
                  {email || "Account"}
                </p>
              </div>
              <div className="pt-1">
                {plan !== "pro" ? (
                  <Link
                    href="/pricing"
                    className="flex min-h-10 items-center gap-2 rounded-full px-2.5 py-2 text-sm text-[var(--ink)] hover:bg-[var(--surface-alt)]"
                    onClick={() => setOpen(false)}
                  >
                    Upgrade
                  </Link>
                ) : null}
                <Link
                  href="/settings"
                  className="flex min-h-10 items-center gap-2 rounded-full px-2.5 py-2 text-sm text-[var(--ink)] hover:bg-[var(--surface-alt)]"
                  onClick={() => setOpen(false)}
                >
                  <CreditCard className="size-3.5" strokeWidth={2} />
                  Billing
                </Link>
                <Link
                  href="/"
                  className="flex min-h-10 w-full items-center gap-2 rounded-full px-2.5 py-2 text-sm text-[var(--ink)] hover:bg-[var(--surface-alt)]"
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
