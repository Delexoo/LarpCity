"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  createLocalLarp,
  getLocalLarp,
  syncLarpSnapshot,
  updateLocalLarp,
} from "@/lib/larps/local-store";
import {
  generateRandomInstagram,
  type InstagramPayload,
} from "@/lib/larps/instagram-payload";

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

type ProfileSetters = {
  setUsername: (v: string) => void;
  setFullName: (v: string) => void;
  setBio: (v: string) => void;
  setLink: (v: string) => void;
  setPosts: (v: string) => void;
  setFollowers: (v: string) => void;
  setFollowing: (v: string) => void;
  setHighlights: (v: string) => void;
  setNote: (v: string) => void;
  setAvatarSymbol: (v: string) => void;
  setProfileMeta: (v: Partial<InstagramPayload>) => void;
  setLabel: (v: string) => void;
};

function applyProfile(p: InstagramPayload, setters: ProfileSetters) {
  setters.setUsername(p.username);
  setters.setFullName(p.fullName);
  setters.setBio(p.bio);
  setters.setLink(p.link || "");
  setters.setPosts(String(p.posts));
  setters.setFollowers(String(p.followers));
  setters.setFollowing(String(p.following));
  setters.setHighlights(
    p.highlights
      .map((h) => (typeof h === "string" ? h : h.title))
      .filter(Boolean)
      .join(", "),
  );
  setters.setNote(p.note || "");
  setters.setAvatarSymbol(p.avatarSymbol || ";");
  setters.setProfileMeta({
    avatarBg: p.avatarBg,
    avatarFg: p.avatarFg,
    initials: p.initials,
    reelsBadge: p.reelsBadge,
    highlights: p.highlights,
    grid: [],
  });
  setters.setLabel(p.fullName);
}

export function InstagramNewLarpForm({
  cancelHref,
  editId,
}: {
  cancelHref: string;
  editId?: string;
}) {
  const router = useRouter();
  const editing = Boolean(editId);
  const [ready, setReady] = useState(false);
  const [creating, setCreating] = useState(false);

  const [label, setLabel] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [link, setLink] = useState("");
  const [posts, setPosts] = useState("0");
  const [followers, setFollowers] = useState("0");
  const [following, setFollowing] = useState("0");
  const [highlights, setHighlights] = useState("");
  const [note, setNote] = useState("");
  const [avatarSymbol, setAvatarSymbol] = useState(";");
  const [profileMeta, setProfileMeta] = useState<Partial<InstagramPayload>>({});

  const setters: ProfileSetters = {
    setUsername,
    setFullName,
    setBio,
    setLink,
    setPosts,
    setFollowers,
    setFollowing,
    setHighlights,
    setNote,
    setAvatarSymbol,
    setProfileMeta,
    setLabel,
  };

  // Create onboarding: always roll a brand-new random profile on every visit.
  // Edit: load the saved LARP once.
  useEffect(() => {
    if (editId) {
      const existing = getLocalLarp(editId);
      if (!existing) {
        setReady(true);
        return;
      }
      const d = existing.data ?? {};
      setLabel(existing.title || "");
      setUsername(String(d.username || ""));
      setFullName(String(d.fullName || ""));
      setBio(String(d.bio ?? ""));
      setLink(String(d.link || ""));
      setPosts(String(d.posts ?? 0));
      setFollowers(String(d.followers ?? 0));
      setFollowing(String(d.following ?? 0));
      if (Array.isArray(d.highlights)) {
        setHighlights(
          d.highlights
            .map((h) =>
              typeof h === "string"
                ? h
                : String((h as { title?: string }).title || ""),
            )
            .filter(Boolean)
            .join(", "),
        );
      }
      setNote(d.note != null ? String(d.note) : "");
      setAvatarSymbol(String(d.avatarSymbol || ";"));
      setProfileMeta({
        avatarBg: d.avatarBg ? String(d.avatarBg) : undefined,
        avatarFg: d.avatarFg ? String(d.avatarFg) : undefined,
        initials: d.initials ? String(d.initials) : undefined,
        reelsBadge:
          typeof d.reelsBadge === "number" ? d.reelsBadge : undefined,
        highlights: Array.isArray(d.highlights)
          ? (d.highlights as InstagramPayload["highlights"])
          : undefined,
        grid: Array.isArray(d.grid)
          ? (d.grid as InstagramPayload["grid"])
          : [],
      });
      setReady(true);
      return;
    }

    const seed =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;
    applyProfile(generateRandomInstagram(seed), setters);
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- remount/key drives a fresh roll each visit
  }, [editId]);

  function randomize() {
    const seed =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;
    applyProfile(generateRandomInstagram(seed), setters);
  }

  function collectData() {
    const titles = highlights
      .split(",")
      .map((h) => h.trim())
      .filter(Boolean);
    const prevHl = Array.isArray(profileMeta.highlights)
      ? profileMeta.highlights
      : [];
    const nextHighlights = titles.map((title, i) => {
      const prev = prevHl[i];
      if (prev && typeof prev === "object") {
        return { ...prev, title };
      }
      return title;
    });

    return {
      username: username.replace(/^@/, "").trim() || "user",
      fullName: fullName.trim() || username.trim() || "User",
      bio,
      link: link.trim() || undefined,
      posts: Number(posts) || 0,
      followers: Number(followers) || 0,
      following: Number(following) || 0,
      highlights: nextHighlights,
      grid: Array.isArray(profileMeta.grid) ? profileMeta.grid : [],
      note: note.trim() || undefined,
      avatarSymbol: avatarSymbol.trim() || ";",
      avatarBg: profileMeta.avatarBg,
      avatarFg: profileMeta.avatarFg,
      initials: profileMeta.initials,
      reelsBadge: profileMeta.reelsBadge ?? 0,
    };
  }

  return (
    <div className="mx-auto w-full max-w-3xl pb-28">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="page-title">
            {editing ? "Edit Instagram LARP" : "New Instagram LARP"}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[var(--text-secondary)]">
            Dark Instagram profile — a new random identity every visit. Empty
            grid until you add posts.
          </p>
        </div>
        <Link href={cancelHref} className="shrink-0">
          <Button variant="ghost" size="sm">
            Cancel
          </Button>
        </Link>
      </div>

      {!editing ? (
        <section className="ll-panel mt-8 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 p-5">
            <div>
              <p className="text-sm font-semibold text-[var(--ink)]">
                Random profile
              </p>
              <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                Re-rolled automatically each time you open this page.
              </p>
            </div>
            <Button type="button" variant="secondary" onClick={randomize}>
              Randomize again
            </Button>
          </div>
        </section>
      ) : null}

      <section className="ll-panel mt-4 overflow-hidden">
        <div className="border-b border-[var(--hairline)] px-5 py-3">
          <h2 className="text-sm font-semibold text-[var(--ink)]">Profile</h2>
        </div>
        <div className="space-y-4 p-5">
          <div>
            <FieldLabel hint="Shown on Home">Label</FieldLabel>
            <TextInput
              value={label}
              onChange={setLabel}
              placeholder={fullName || username}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel>Username</FieldLabel>
              <TextInput value={username} onChange={setUsername} />
            </div>
            <div>
              <FieldLabel>Display name</FieldLabel>
              <TextInput value={fullName} onChange={setFullName} />
            </div>
          </div>
          <div>
            <FieldLabel hint="@handles render in Instagram blue">Bio</FieldLabel>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-[var(--hairline)] bg-[var(--surface-alt)] px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel>Website / link</FieldLabel>
              <TextInput
                value={link}
                onChange={setLink}
                placeholder="optional"
              />
            </div>
            <div>
              <FieldLabel hint="Shown in avatar when no photo">
                Avatar symbol
              </FieldLabel>
              <TextInput value={avatarSymbol} onChange={setAvatarSymbol} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel hint="Bubble above avatar">Note</FieldLabel>
              <TextInput value={note} onChange={setNote} placeholder="Note..." />
            </div>
            <div>
              <FieldLabel hint="Comma-separated">Highlights</FieldLabel>
              <TextInput value={highlights} onChange={setHighlights} />
            </div>
          </div>
        </div>
      </section>

      <section className="ll-panel mt-4 overflow-hidden">
        <div className="border-b border-[var(--hairline)] px-5 py-3">
          <h2 className="text-sm font-semibold text-[var(--ink)]">Counts</h2>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-3">
          <div>
            <FieldLabel hint="Keep 0 for empty grid">Posts</FieldLabel>
            <TextInput value={posts} onChange={setPosts} />
          </div>
          <div>
            <FieldLabel>Followers</FieldLabel>
            <TextInput value={followers} onChange={setFollowers} />
          </div>
          <div>
            <FieldLabel>Following</FieldLabel>
            <TextInput value={following} onChange={setFollowing} />
          </div>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--hairline)] bg-[var(--bg)]/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-end gap-2">
          <Link href={cancelHref}>
            <Button variant="ghost">Cancel</Button>
          </Link>
          <Button
            disabled={creating || !ready}
            onClick={() => {
              setCreating(true);
              const title =
                label.trim() || fullName.trim() || username.trim() || "Instagram";
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
                platform_slug: "instagram",
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
