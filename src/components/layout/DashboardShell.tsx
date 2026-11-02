"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useLocalPlan } from "@/hooks/useLocalPlan";
import { cn } from "@/lib/utils";
import { AppSidebar } from "./AppSidebar";
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
      <div
        className={cn(
          "z-50 bg-[var(--surface)]",
          mobileOpen
            ? "fixed inset-0 flex flex-col md:static md:inset-auto md:block"
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
          onMenuClick={() => setMobileOpen(true)}
        />
        <main className="relative mx-auto w-full max-w-[1600px] flex-1 px-4 py-6 sm:px-6 md:px-8 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
