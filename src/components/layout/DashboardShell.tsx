"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useLocalPlan } from "@/hooks/useLocalPlan";
import { cn } from "@/lib/utils";
import { AppSidebar } from "./AppSidebar";
import { CommandPalette } from "./CommandPalette";
import { TopBar } from "./TopBar";

export function DashboardShell({
  children,
  email,
}: {
  children: React.ReactNode;
  email?: string | null;
  /** @deprecated Plan comes from local storage (Free watermark / Pro clean). */
  plan?: string;
}) {
  const pathname = usePathname();
  const { plan } = useLocalPlan();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  return (
    <div className="flex min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      <CommandPalette />
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <div
        className={cn(
          "z-50 bg-[var(--surface)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] md:translate-x-0 md:transition-none",
          mobileOpen
            ? "fixed inset-y-0 left-0 flex w-[min(20rem,88vw)] translate-x-0 flex-col shadow-[8px_0_40px_rgba(0,0,0,0.1)] md:static md:inset-auto md:block md:w-auto md:shadow-none"
            : "hidden md:block",
        )}
        {...(mobileOpen
          ? { role: "dialog", "aria-modal": true, "aria-label": "Navigation" }
          : {})}
      >
        <AppSidebar
          plan={plan}
          collapsed={mobileOpen ? false : collapsed}
          mobile={mobileOpen}
          onClose={() => setMobileOpen(false)}
          onToggle={() => {
            if (mobileOpen) setMobileOpen(false);
            else setCollapsed((v) => !v);
          }}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          email={email}
          plan={plan}
          menuOpen={mobileOpen}
          onMenuClick={() => setMobileOpen((v) => !v)}
        />
        <main className="relative mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 md:px-8 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
