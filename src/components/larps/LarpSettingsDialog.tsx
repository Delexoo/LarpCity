"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { LocalLarp } from "@/lib/larps/local-store";
import {
  disableLarpNotifications,
  enableLarpNotifications,
  getLarpNotificationPrefs,
  larpDisplayName,
  platformNotificationIcon,
  sendLarpNotification,
} from "@/lib/larps/notifications";
import { getPlatformBySlug } from "@/lib/platforms/catalog";

export function LarpSettingsDialog({
  larp,
  open,
  onClose,
}: {
  larp: LocalLarp | null;
  open: boolean;
  onClose: () => void;
}) {
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!larp || !open) return;
    setEnabled(getLarpNotificationPrefs(larp.id).enabled);
    setMessage(null);
  }, [larp, open]);

  if (!open || !larp) return null;

  const platform = getPlatformBySlug(larp.platform_slug);
  const name = larpDisplayName(larp);
  const icon = platformNotificationIcon(larp.platform_slug);

  async function onToggle() {
    setBusy(true);
    setMessage(null);
    try {
      if (enabled) {
        disableLarpNotifications(larp!.id);
        setEnabled(false);
        setMessage("Notifications off for this LARP.");
      } else {
        const res = await enableLarpNotifications(larp!);
        if (!res.ok) {
          setMessage(res.reason || "Couldn’t enable notifications.");
          setEnabled(false);
        } else {
          setEnabled(true);
          setMessage("You’ll get alerts with this name and logo.");
        }
      }
    } finally {
      setBusy(false);
    }
  }

  async function onTest() {
    setBusy(true);
    setMessage(null);
    try {
      if (!enabled) {
        const res = await enableLarpNotifications(larp!);
        if (!res.ok) {
          setMessage(res.reason || "Enable notifications first.");
          return;
        }
        setEnabled(true);
      }
      const ok = await sendLarpNotification(larp!, {
        body: `Test alert from your ${platform?.name || "LARP"} dashboard.`,
        tag: `larp-test-${larp!.id}`,
      });
      setMessage(ok ? "Test notification sent." : "Couldn’t send a test.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/45"
        aria-label="Close settings"
        onClick={onClose}
      />
      <div className="relative z-[1] w-full max-w-md rounded-t-2xl border border-[var(--hairline)] bg-[var(--surface)] p-5 shadow-xl sm:rounded-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
              LARP settings
            </p>
            <h2 className="mt-1 truncate text-lg font-semibold text-[var(--ink)]">
              {larp.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-full text-[var(--text-secondary)] hover:bg-[var(--surface-alt)]"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mb-4 flex items-center gap-3 rounded-xl border border-[var(--hairline)] bg-[var(--surface-alt)] p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={icon}
            alt=""
            width={40}
            height={40}
            className="size-10 rounded-xl object-cover"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-[var(--ink)]">
              {name}
            </p>
            <p className="truncate text-xs text-[var(--text-secondary)]">
              {platform?.name || larp.platform_slug} · notification title &amp;
              icon
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--hairline)] px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--ink)]">
                Receive notifications
              </p>
              <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                Alerts use this LARP’s name and platform logo.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={enabled}
              disabled={busy}
              onClick={onToggle}
              className={
                enabled
                  ? "inline-flex h-8 items-center gap-1.5 rounded-full bg-[#008CFF] px-3 text-xs font-semibold text-white"
                  : "inline-flex h-8 items-center gap-1.5 rounded-full border border-[var(--hairline)] bg-[var(--surface-alt)] px-3 text-xs font-medium text-[var(--ink)]"
              }
            >
              {enabled ? (
                <Bell className="size-3.5" />
              ) : (
                <BellOff className="size-3.5" />
              )}
              {enabled ? "On" : "Off"}
            </button>
          </div>

          <Button
            type="button"
            variant="secondary"
            className="w-full"
            disabled={busy}
            onClick={onTest}
          >
            Send test notification
          </Button>

          {message ? (
            <p className="text-center text-xs text-[var(--text-secondary)]">
              {message}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
