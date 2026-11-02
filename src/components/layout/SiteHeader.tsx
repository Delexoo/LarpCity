"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/#platforms", label: "Platforms" },
  { href: "/pricing", label: "Pricing" },
  { href: "/dashboard", label: "Open app" },
] as const;

export function SiteHeader({
  solid = false,
}: {
  /** Always show a solid white bar (pricing / inner pages). */
  solid?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("menu-open", open);
    return () => document.documentElement.classList.remove("menu-open");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const barSolid = solid || scrolled || open;

  return (
    <header
      className={cn(
        "site-header fixed inset-x-0 top-0 z-40 transition-[background,border-color,box-shadow] duration-300",
        barSolid
          ? "border-b border-black/[0.06] bg-white/92 shadow-[0_1px_0_rgba(0,0,0,0.04)] backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
        open && "is-open",
      )}
    >
      <div className="mx-auto flex h-[4.25rem] max-w-[68rem] items-center justify-between gap-4 px-5 md:px-8">
        <Link
          href="/"
          className="relative z-[2] text-[1.15rem] font-extrabold tracking-[-0.03em] text-[var(--ink-pure)]"
          onClick={() => setOpen(false)}
        >
          LarpingKit
        </Link>

        <nav
          className="site-topnav hidden items-center gap-1 md:flex"
          aria-label="Primary"
        >
          {LINKS.slice(0, 2).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3.5 py-2 text-[0.95rem] font-medium text-[var(--ink)]/80 transition-colors hover:text-[var(--ink)]"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/dashboard"
            className="ml-2 inline-flex h-10 items-center rounded-full bg-[var(--ink)] px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Open app
          </Link>
        </nav>

        <button
          type="button"
          className="menu-toggle relative z-[2] inline-flex h-11 items-center gap-2.5 rounded-full bg-white px-4 text-sm font-semibold text-[var(--ink)] shadow-[0_10px_28px_rgba(0,0,0,0.08)] md:hidden"
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="menu-label">{open ? "Close" : "Menu"}</span>
          <span className="menu-bars" aria-hidden="true" />
        </button>
      </div>

      <nav
        id="site-menu"
        className="menu-screen"
        aria-label="Pages"
        aria-hidden={!open}
      >
        {LINKS.map((link, i) => (
          <Link
            key={link.href}
            href={link.href}
            style={{ transitionDelay: open ? `${0.08 + i * 0.07}s` : "0s" }}
            onClick={() => setOpen(false)}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
