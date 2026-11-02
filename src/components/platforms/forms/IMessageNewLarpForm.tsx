"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  createLocalLarp,
  getLocalLarp,
  syncLarpSnapshot,
  updateLocalLarp,
} from "@/lib/larps/local-store";
import {
  DEFAULT_IMESSAGE,
  type IMessageItem,
} from "@/lib/larps/imessage-payload";
import { cn } from "@/lib/utils";

const AVATAR_PRESETS = [
  ["#A8A8AE", "#6E6E73"],
  ["#FF9F0A", "#C93400"],
  ["#FF375F", "#D70015"],
  ["#BF5AF2", "#8944AB"],
  ["#30D158", "#248A3D"],
  ["#64D2FF", "#0071A4"],
] as const;

function FieldLabel({
  children,
  hint,
}: {
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="mb-2">
      <p className="text-sm font-medium text-[var(--ink)]">{children}</p>
      {hint ? (
        <p className="mt-0.5 text-xs text-[var(--text-secondary)]">{hint}</p>
      ) : null}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-[var(--hairline)] bg-[var(--surface-alt)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--ink)]/40"
    />
  );
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function IMessageNewLarpForm({
  cancelHref,
  editId,
}: {
  cancelHref: string;
  editId?: string;
}) {
  const router = useRouter();
  const editing = Boolean(editId);
  const [hydrated, setHydrated] = useState(false);
  const [creating, setCreating] = useState(false);

  const [label, setLabel] = useState("");
  const [contactName, setContactName] = useState(
    DEFAULT_IMESSAGE.contact.name,
  );
  const [avatarLetters, setAvatarLetters] = useState(
    DEFAULT_IMESSAGE.contact.avatarLetters || "JJ",
  );
  const [hueA, setHueA] = useState(
    DEFAULT_IMESSAGE.contact.avatarHueA || "#8E8E93",
  );
  const [hueB, setHueB] = useState(
    DEFAULT_IMESSAGE.contact.avatarHueB || "#48484A",
  );
  const [subtitle, setSubtitle] = useState("");
  const [service, setService] = useState<"iMessage" | "SMS">("iMessage");
  const [statusTime, setStatusTime] = useState(
    DEFAULT_IMESSAGE.statusTime || "2:30",
  );
  const [unreadCount, setUnreadCount] = useState(
    String(DEFAULT_IMESSAGE.unreadCount ?? 271),
  );
  const [showTyping, setShowTyping] = useState(true);
  const [messages, setMessages] = useState<IMessageItem[]>(
    DEFAULT_IMESSAGE.messages,
  );
  const [draftSide, setDraftSide] = useState<"sent" | "received">("sent");
  const [draftText, setDraftText] = useState("");
  const [editIndex, setEditIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!editId || hydrated) return;
    const existing = getLocalLarp(editId);
    if (!existing) {
      setHydrated(true);
      return;
    }
    const d = existing.data ?? {};
    const c = (d.contact as Record<string, unknown>) || {};
    setLabel(existing.title || "");
    setContactName(String(c.name || DEFAULT_IMESSAGE.contact.name));
    setAvatarLetters(
      String(c.avatarLetters || DEFAULT_IMESSAGE.contact.avatarLetters || "JJ"),
    );
    setHueA(String(c.avatarHueA || DEFAULT_IMESSAGE.contact.avatarHueA));
    setHueB(String(c.avatarHueB || DEFAULT_IMESSAGE.contact.avatarHueB));
    setSubtitle(String(c.subtitle || ""));
    setService(String(c.service || "iMessage") === "SMS" ? "SMS" : "iMessage");
    setStatusTime(String(d.statusTime || c.statusTime || "2:30"));
    setUnreadCount(
      String(d.unreadCount ?? c.unreadCount ?? DEFAULT_IMESSAGE.unreadCount),
    );
    setShowTyping(d.showTyping !== false);
    if (Array.isArray(d.messages) && d.messages.length) {
      setMessages(d.messages as IMessageItem[]);
    }
    setHydrated(true);
  }, [editId, hydrated]);

  const themLabel = contactName.trim() || "Them";

  const previewTitle = useMemo(
    () =>
      label.trim() ||
      `${contactName.trim() || DEFAULT_IMESSAGE.contact.name} chat`,
    [label, contactName],
  );

  function addMessage() {
    const text = draftText.trim();
    if (!text && editIndex == null) return;
    if (editIndex != null) {
      setMessages((prev) =>
        prev.map((m, i) =>
          i === editIndex
            ? { ...m, side: draftSide, text: text || m.text || "" }
            : m,
        ),
      );
      setEditIndex(null);
      setDraftText("");
      return;
    }
    setMessages((prev) => [
      ...prev,
      { id: uid(), side: draftSide, kind: "text", text },
    ]);
    setDraftText("");
  }

  function addTimestamp() {
    const stamp = new Date().toLocaleString(undefined, {
      weekday: undefined,
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
    setMessages((prev) => {
      if (!prev.length) {
        return [
          {
            id: uid(),
            side: "received",
            kind: "text",
            text: "",
            timestampLabel: `Today ${stamp}`,
          },
        ];
      }
      const next = [...prev];
      const last = { ...next[next.length - 1]! };
      last.timestampLabel = last.timestampLabel || `Today ${stamp}`;
      next[next.length - 1] = last;
      return next;
    });
  }

  function collectData() {
    const unread = Math.max(0, Math.round(Number(unreadCount) || 0));
    const clock = statusTime.trim() || "2:30";
    return {
      contact: {
        name: contactName.trim() || DEFAULT_IMESSAGE.contact.name,
        avatarLetters: (avatarLetters.trim() || "JJ").slice(0, 2).toUpperCase(),
        avatarHueA: hueA,
        avatarHueB: hueB,
        subtitle: subtitle.trim() || undefined,
        service,
        statusTime: clock,
        readLabel: "Delivered",
        unreadCount: unread,
        battery: 25,
      },
      messages: messages.filter((m) => m.text || m.timestampLabel),
      showTyping,
      showRead: true,
      readLabel: "Delivered",
      statusTime: clock,
      unreadCount: unread,
      battery: 25,
    };
  }

  return (
    <div className="mx-auto w-full max-w-3xl pb-28">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="page-title">
            {editing ? "Edit iMessage LARP" : "New iMessage LARP"}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[var(--text-secondary)]">
            Dark liquid-glass Messages UI — frosted chrome, floating composer.
          </p>
        </div>
        <Link href={cancelHref} className="shrink-0">
          <Button variant="ghost" size="sm">
            Cancel
          </Button>
        </Link>
      </div>

      <section className="ll-panel mt-8 overflow-hidden">
        <div className="border-b border-[var(--hairline)] px-5 py-3">
          <h2 className="text-sm font-semibold text-[var(--ink)]">Label</h2>
        </div>
        <div className="space-y-4 p-5">
          <div>
            <FieldLabel hint="For your reference in the dashboard list.">
              Name
            </FieldLabel>
            <TextInput
              value={label}
              onChange={setLabel}
              placeholder={previewTitle}
            />
          </div>
        </div>
      </section>

      <section className="ll-panel mt-4 overflow-hidden">
        <div className="border-b border-[var(--hairline)] px-5 py-3">
          <h2 className="text-sm font-semibold text-[var(--ink)]">Contact</h2>
        </div>
        <div className="space-y-4 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel>Name</FieldLabel>
              <TextInput value={contactName} onChange={setContactName} />
            </div>
            <div>
              <FieldLabel>Avatar initials</FieldLabel>
              <TextInput value={avatarLetters} onChange={setAvatarLetters} />
            </div>
          </div>

          <div>
            <FieldLabel>Avatar gradient</FieldLabel>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="color"
                value={hueA}
                onChange={(e) => setHueA(e.target.value)}
                className="h-9 w-12 cursor-pointer rounded border border-[var(--hairline)] bg-transparent"
                aria-label="Top color"
              />
              <input
                type="color"
                value={hueB}
                onChange={(e) => setHueB(e.target.value)}
                className="h-9 w-12 cursor-pointer rounded border border-[var(--hairline)] bg-transparent"
                aria-label="Bottom color"
              />
              <div
                className="ml-1 size-9 rounded-full"
                style={{
                  background: `linear-gradient(180deg,${hueA},${hueB})`,
                }}
                aria-hidden
              />
              {AVATAR_PRESETS.map(([a, b]) => (
                <button
                  key={a + b}
                  type="button"
                  onClick={() => {
                    setHueA(a);
                    setHueB(b);
                  }}
                  className="size-7 rounded-full border border-black/10"
                  style={{ background: `linear-gradient(180deg,${a},${b})` }}
                  aria-label={`Preset ${a}`}
                />
              ))}
            </div>
          </div>

          <div>
            <FieldLabel hint="e.g. 4 people">
              Subtitle (group chat names, optional)
            </FieldLabel>
            <TextInput
              value={subtitle}
              onChange={setSubtitle}
              placeholder="e.g. 4 people"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel hint="Status bar clock">Status time</FieldLabel>
              <TextInput value={statusTime} onChange={setStatusTime} />
            </div>
            <div>
              <FieldLabel hint="Red badge on back">Unread count</FieldLabel>
              <TextInput value={unreadCount} onChange={setUnreadCount} />
            </div>
          </div>

          <div>
            <FieldLabel>Service</FieldLabel>
            <div className="inline-flex rounded-full border border-[var(--hairline)] bg-[var(--surface-alt)] p-1">
              {(["iMessage", "SMS"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setService(s)}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-xs font-semibold",
                    service === s
                      ? "bg-[#007AFF] text-white"
                      : "text-[var(--text-secondary)]",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="ll-panel mt-4 overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--hairline)] px-5 py-3">
          <div>
            <h2 className="text-sm font-semibold text-[var(--ink)]">Messages</h2>
            <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
              Tap a row to edit. The first bubble in a sender&apos;s run gets a
              tail.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowTyping((v) => !v)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium",
              showTyping
                ? "border-[#007AFF]/40 bg-[#007AFF]/10 text-[#007AFF]"
                : "border-[var(--hairline)] text-[var(--text-secondary)]",
            )}
          >
            … Typing…
          </button>
        </div>

        <ul className="divide-y divide-[var(--hairline)]">
          {messages.map((m, i) => (
            <li key={m.id || i}>
              <button
                type="button"
                onClick={() => {
                  setEditIndex(i);
                  setDraftSide(
                    m.side === "sent" || m.side === "you"
                      ? "sent"
                      : "received",
                  );
                  setDraftText(m.text || "");
                }}
                className="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-[var(--surface-alt)]"
              >
                <span className="w-14 shrink-0 text-xs font-medium text-[var(--text-secondary)]">
                  {m.side === "sent" || m.side === "you" ? "You" : themLabel}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-[var(--ink)]">
                  {m.timestampLabel ? (
                    <span className="text-[var(--text-muted)]">
                      {m.timestampLabel} ·{" "}
                    </span>
                  ) : null}
                  {m.text || "(empty)"}
                </span>
                <Pencil
                  className="size-3.5 shrink-0 text-[var(--text-muted)]"
                  strokeWidth={2}
                />
              </button>
            </li>
          ))}
        </ul>

        <div className="space-y-3 border-t border-[var(--hairline)] p-5">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-full border border-[var(--hairline)] p-1">
              <button
                type="button"
                onClick={() => setDraftSide("sent")}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold",
                  draftSide === "sent"
                    ? "bg-[var(--ink)] text-white"
                    : "text-[var(--text-secondary)]",
                )}
              >
                You
              </button>
              <button
                type="button"
                onClick={() => setDraftSide("received")}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold",
                  draftSide === "received"
                    ? "bg-[var(--ink)] text-white"
                    : "text-[var(--text-secondary)]",
                )}
              >
                {themLabel}
              </button>
            </div>
            <Button type="button" variant="secondary" size="sm" onClick={addTimestamp}>
              Add timestamp
            </Button>
            {editIndex != null ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setMessages((prev) => prev.filter((_, i) => i !== editIndex));
                  setEditIndex(null);
                  setDraftText("");
                }}
              >
                Delete row
              </Button>
            ) : null}
          </div>
          <div className="flex gap-2">
            <textarea
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              placeholder="Type a message..."
              rows={2}
              className="min-h-[44px] flex-1 resize-y rounded-lg border border-[var(--hairline)] bg-[var(--surface-alt)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--text-muted)]"
            />
            <Button
              type="button"
              onClick={addMessage}
              className="shrink-0 self-end"
            >
              <Plus className="size-4" />
              {editIndex != null ? "Save" : "Add"}
            </Button>
          </div>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--hairline)] bg-[var(--bg)]/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-end gap-2">
          <Link href={cancelHref}>
            <Button variant="ghost">Cancel</Button>
          </Link>
          <Button
            disabled={creating || (editing && !hydrated)}
            onClick={() => {
              setCreating(true);
              const title = previewTitle;
              const data = collectData();
              if (editId) {
                const updated = updateLocalLarp(editId, { title, data });
                if (updated) void syncLarpSnapshot(updated);
                router.push(
                  updated
                    ? `/larps/${encodeURIComponent(updated.id)}`
                    : "/dashboard",
                );
                return;
              }
              const larp = createLocalLarp({
                title,
                platform_slug: "imessage",
                data,
              });
              void syncLarpSnapshot(larp);
              router.push(`/larps/${encodeURIComponent(larp.id)}`);
            }}
          >
            {creating
              ? editing
                ? "Saving…"
                : "Creating…"
              : editing
                ? "Save changes"
                : "Create LARP"}
          </Button>
        </div>
      </div>
    </div>
  );
}
