"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, Dices } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  createLocalLarp,
  getLocalLarp,
  syncLarpSnapshot,
  updateLocalLarp,
} from "@/lib/larps/local-store";
import { hashSeed, mulberry32 } from "@/lib/larps/realistic";
import { cn } from "@/lib/utils";

const SCALE_PRESETS = [
  { id: "5k", label: "5K", subs: 5_200, views: 1_840_000, uploads: 48, monthly: 420, rpm: 4.2 },
  { id: "100k", label: "100K", subs: 102_400, views: 28_500_000, uploads: 186, monthly: 8_400, rpm: 5.8 },
  { id: "1m", label: "1M", subs: 1_048_000, views: 312_000_000, uploads: 420, monthly: 42_000, rpm: 7.4 },
  { id: "20m", label: "20M", subs: 19_412_388, views: 4_103_726_451, uploads: 1_640, monthly: 284_916, rpm: 11.8 },
  { id: "200m", label: "200M", subs: 201_500_000, views: 68_400_000_000, uploads: 4_820, monthly: 2_850_000, rpm: 14.2 },
] as const;

const QUICK_STARTS = [
  { id: "tech", label: "Tech reviewer", niche: "TECH", vibe: "STEADY", scale: "1m" },
  { id: "gaming", label: "Gaming", niche: "GAMING", vibe: "HUSTLE", scale: "1m" },
  { id: "vlog", label: "Daily vlog", niche: "LIFESTYLE", vibe: "STEADY", scale: "100k" },
  { id: "finance", label: "Finance", niche: "FINANCE", vibe: "STEADY", scale: "1m" },
  { id: "mega", label: "Mega creator", niche: "ENTERTAINMENT", vibe: "CHAOS", scale: "20m" },
  { id: "starter", label: "Rising channel", niche: "TECH", vibe: "GROWTH", scale: "5k" },
] as const;

const NICHES = ["TECH", "GAMING", "LIFESTYLE", "FINANCE", "ENTERTAINMENT", "EDUCATION"] as const;
const VIBES = ["STEADY", "GROWTH", "HUSTLE", "CHAOS"] as const;

type AccordionId = "quick" | "niche" | "country" | "restrictions" | "display";

function formatCount(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

function formatMoney(n: number): string {
  return `$ ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function parseLooseNumber(raw: string): number {
  const n = Number.parseFloat(raw.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

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
  prefix,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  prefix?: string;
}) {
  return (
    <div className="flex items-center rounded-lg border border-[var(--hairline)] bg-[var(--surface-alt)] focus-within:border-[var(--ink)]/40 focus-within:outline-2 focus-within:outline-[var(--accent-ring)] focus-within:outline-offset-2">
      {prefix ? (
        <span className="pl-3.5 text-sm text-[var(--text-secondary)]">{prefix}</span>
      ) : null}
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent px-3.5 py-2.5 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--text-muted)]"
      />
    </div>
  );
}

function Accordion({
  id,
  openId,
  setOpenId,
  title,
  summary,
  children,
}: {
  id: AccordionId;
  openId: AccordionId | null;
  setOpenId: (id: AccordionId | null) => void;
  title: string;
  summary: string;
  children: React.ReactNode;
}) {
  const open = openId === id;
  return (
    <div className="border-b border-[var(--hairline)]">
      <button
        type="button"
        onClick={() => setOpenId(open ? null : id)}
        className="flex w-full items-center gap-3 py-4 text-left"
      >
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[var(--ink)]">{title}</p>
          <p className="mt-0.5 truncate text-xs text-[var(--text-secondary)]">
            {summary}
          </p>
        </div>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-[var(--text-secondary)] transition-transform",
            open && "rotate-180",
          )}
          strokeWidth={2}
        />
      </button>
      {open ? <div className="pb-4">{children}</div> : null}
    </div>
  );
}

function Segmented({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="inline-flex rounded-2xl bg-[var(--segment-bg)] p-1">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={cn(
            "min-h-11 rounded-xl px-5 text-sm font-semibold transition",
            value === opt
              ? "bg-[var(--accent-select)] text-[var(--ink)] shadow-[var(--shadow-segment)]"
              : "text-[var(--text-muted)]",
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export function YouTubeNewLarpForm({
  cancelHref = "/platforms/youtube-studio",
  editId,
}: {
  cancelHref?: string;
  editId?: string;
}) {
  const [internalName, setInternalName] = useState("");
  const [channelName, setChannelName] = useState("DELEXO *");
  const [handle, setHandle] = useState("marlowtech");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [scaleId, setScaleId] = useState<string>("20m");
  const [subscribers, setSubscribers] = useState("19,412,388");
  const [lifetimeViews, setLifetimeViews] = useState("4,103,726,451");
  const [totalUploads, setTotalUploads] = useState("1,640");
  const [monetized, setMonetized] = useState(true);
  const [monthlyRevenue, setMonthlyRevenue] = useState("$ 284,916.42");
  const [rpm, setRpm] = useState("$ 11.80");
  const [theme, setTheme] = useState<"Dark" | "Light">("Dark");
  const [niche, setNiche] = useState<string>("TECH");
  const [vibe, setVibe] = useState<string>("STEADY");
  const [country, setCountry] = useState("US");
  const [range, setRange] = useState("28");
  const [copyright, setCopyright] = useState("0");
  const [ageRestricted, setAgeRestricted] = useState("0");
  const [ai, setAi] = useState(true);
  const [openId, setOpenId] = useState<AccordionId | null>(null);
  const [creating, setCreating] = useState(false);
  const [hydratedEdit, setHydratedEdit] = useState(false);
  const router = useRouter();
  const editing = Boolean(editId);

  function applyScale(id: string) {
    const p = SCALE_PRESETS.find((s) => s.id === id);
    if (!p) return;
    setScaleId(id);
    setSubscribers(formatCount(p.subs));
    setLifetimeViews(formatCount(p.views));
    setTotalUploads(formatCount(p.uploads));
    setMonthlyRevenue(formatMoney(p.monthly));
    setRpm(formatMoney(p.rpm));
  }

  function randomize() {
    const rand = mulberry32(hashSeed(`yt|${Date.now()}`));
    const p = SCALE_PRESETS[Math.floor(rand() * SCALE_PRESETS.length)]!;
    const qs = QUICK_STARTS[Math.floor(rand() * QUICK_STARTS.length)]!;
    const names = [
      "DELEXO *",
      "Marlow Tech",
      "Nova Labs",
      "Pixel Forge",
      "Signal Daily",
      "Orbit Desk",
    ];
    const name = names[Math.floor(rand() * names.length)]!;
    setChannelName(name);
    setHandle(
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "")
        .slice(0, 14) || "channel",
    );
    setNiche(qs.niche);
    setVibe(qs.vibe);
    applyScale(p.id);
    setTheme(rand() > 0.35 ? "Dark" : "Light");
    setMonetized(p.subs >= 1000);
  }

  useEffect(() => {
    if (!editId || hydratedEdit) return;
    const existing = getLocalLarp(editId);
    if (!existing) {
      setHydratedEdit(true);
      return;
    }
    const d = existing.data ?? {};
    setInternalName(existing.title || "");
    setChannelName(String(d.channelName || d.businessName || "DELEXO *"));
    setHandle(String(d.handle || "marlowtech").replace(/^@/, ""));
    setAvatarUrl(String(d.avatarUrl || ""));
    setSubscribers(formatCount(parseLooseNumber(String(d.subscribers || "19412388"))));
    setLifetimeViews(
      formatCount(parseLooseNumber(String(d.lifetimeViews || "4103726451"))),
    );
    setTotalUploads(formatCount(parseLooseNumber(String(d.totalUploads || "1640"))));
    setMonetized(d.monetized !== false);
    setMonthlyRevenue(String(d.monthlyRevenue || "$ 284,916.42"));
    setRpm(String(d.rpm || "$ 11.80"));
    setTheme(String(d.theme || "Dark") === "Light" ? "Light" : "Dark");
    setNiche(String(d.niche || "TECH").toUpperCase());
    setVibe(String(d.vibe || "STEADY").toUpperCase());
    setCountry(String(d.country || "US").toUpperCase());
    setRange(String(d.range || "28"));
    setCopyright(String(d.copyright ?? "0"));
    setAgeRestricted(String(d.ageRestricted ?? "0"));
    setAi(d.ai !== false);
    setHydratedEdit(true);
  }, [editId, hydratedEdit]);

  const believable = useMemo(() => {
    const subs = parseLooseNumber(subscribers);
    const views = parseLooseNumber(lifetimeViews);
    if (subs <= 0 || views <= 0) return false;
    const viewsPerSub = views / subs;
    return viewsPerSub > 20 && viewsPerSub < 8000;
  }, [subscribers, lifetimeViews]);

  function collectData() {
    return {
      businessName: channelName,
      channelName,
      handle,
      avatarUrl,
      subscribers: parseLooseNumber(subscribers),
      lifetimeViews: parseLooseNumber(lifetimeViews),
      totalUploads: parseLooseNumber(totalUploads),
      monetized,
      monthlyRevenue,
      rpm: parseLooseNumber(rpm),
      theme,
      niche,
      vibe,
      country,
      range: parseLooseNumber(range) || 28,
      copyright: parseLooseNumber(copyright),
      ageRestricted: parseLooseNumber(ageRestricted),
      ai,
      scaleId,
      chartSeed: Date.now(),
    };
  }

  return (
    <div className="mx-auto w-full max-w-3xl pb-28">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="page-title">
            {editing ? "Edit YouTube Studio LARP" : "New YouTube Studio LARP"}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[var(--text-secondary)]">
            Configure the channel. Desktop vs mobile Studio is auto-detected
            when you open the LARP.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={randomize}>
            <Dices className="size-3.5" strokeWidth={2} />
            Randomize
          </Button>
          <Link href={cancelHref}>
            <Button variant="ghost" size="sm">
              Cancel
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        <section className="ll-panel space-y-5 p-5">
          <h2 className="text-sm font-semibold text-[var(--ink)]">
            Channel identity
          </h2>
          <div>
            <FieldLabel hint="Only in your LarpingKit list.">Profile name</FieldLabel>
            <TextInput
              value={internalName}
              onChange={setInternalName}
              placeholder="Main tech channel"
            />
          </div>
          <div>
            <FieldLabel>Channel name</FieldLabel>
            <TextInput value={channelName} onChange={setChannelName} />
          </div>
          <div>
            <FieldLabel>Handle</FieldLabel>
            <TextInput value={handle} onChange={setHandle} prefix="@" />
          </div>
          <div>
            <FieldLabel hint="Optional. Leave blank for a generated avatar.">
              Avatar URL
            </FieldLabel>
            <TextInput
              value={avatarUrl}
              onChange={setAvatarUrl}
              placeholder="https://…"
            />
          </div>
        </section>

        <section className="ll-panel space-y-5 p-5">
          <h2 className="text-sm font-semibold text-[var(--ink)]">
            Channel scale &amp; monetization
          </h2>
          <div className="flex flex-wrap gap-2">
            {SCALE_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyScale(p.id)}
                className={cn(
                  "min-h-11 rounded-full px-4 text-sm font-semibold transition",
                  scaleId === p.id
                    ? "bg-[var(--ink)] text-[var(--on-ink)]"
                    : "border border-[var(--hairline)] bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--ink)]/35",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <FieldLabel>Subscribers</FieldLabel>
              <TextInput value={subscribers} onChange={setSubscribers} />
            </div>
            <div>
              <FieldLabel>Lifetime views</FieldLabel>
              <TextInput value={lifetimeViews} onChange={setLifetimeViews} />
            </div>
            <div>
              <FieldLabel>Total uploads</FieldLabel>
              <TextInput value={totalUploads} onChange={setTotalUploads} />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMonetized((v) => !v)}
            className="flex w-full items-center justify-between rounded-xl border border-[var(--hairline)] px-4 py-3 text-left"
          >
            <span className="text-sm font-medium text-[var(--ink)]">
              In YouTube Partner Program
            </span>
            <span
              className={cn(
                "relative h-7 w-[51px] rounded-full transition",
                monetized ? "bg-[var(--ink)]" : "bg-[var(--track-off)]",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 size-6 rounded-full bg-white transition",
                  monetized ? "left-[23px]" : "left-0.5",
                )}
              />
            </span>
          </button>

          {monetized ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel>Monthly revenue (USD)</FieldLabel>
                <TextInput value={monthlyRevenue} onChange={setMonthlyRevenue} />
              </div>
              <div>
                <FieldLabel>RPM (USD per 1000 views)</FieldLabel>
                <TextInput value={rpm} onChange={setRpm} />
              </div>
            </div>
          ) : null}

          <p
            className={cn(
              "flex items-center gap-2 text-xs",
              believable
                ? "text-[var(--ink)]"
                : "text-[var(--text-secondary)]",
            )}
          >
            {believable ? (
              <Check className="size-3.5 shrink-0" strokeWidth={2.5} />
            ) : null}
            {believable
              ? "Numbers look believable."
              : "Views-to-subs ratio looks off — try a scale preset."}
          </p>
        </section>

        <section className="ll-panel space-y-5 p-5">
          <h2 className="text-sm font-semibold text-[var(--ink)]">Look</h2>
          <div>
            <FieldLabel>Theme</FieldLabel>
            <Segmented
              value={theme}
              options={["Dark", "Light"]}
              onChange={(v) => setTheme(v as "Dark" | "Light")}
            />
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            Device layout (desktop Studio vs phone app) follows the screen that
            opens the LARP.
          </p>
        </section>

        <section className="ll-panel px-5">
          <Accordion
            id="quick"
            openId={openId}
            setOpenId={setOpenId}
            title="Quick start"
            summary={`${SCALE_PRESETS.length} channel sizes · ${QUICK_STARTS.length} presets`}
          >
            <div className="grid gap-2 sm:grid-cols-2">
              {QUICK_STARTS.map((q) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => {
                    setNiche(q.niche);
                    setVibe(q.vibe);
                    applyScale(q.scale);
                  }}
                  className="rounded-xl border border-[var(--hairline)] px-4 py-3 text-left hover:border-[var(--ink)]/35"
                >
                  <p className="text-sm font-semibold text-[var(--ink)]">
                    {q.label}
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                    {q.niche} · {q.vibe}
                  </p>
                </button>
              ))}
            </div>
          </Accordion>

          <Accordion
            id="niche"
            openId={openId}
            setOpenId={setOpenId}
            title="Niche & vibe"
            summary={`${niche} · ${vibe.toLowerCase()} vibe`}
          >
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {NICHES.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setNiche(n)}
                    className={cn(
                      "min-h-10 rounded-full px-3.5 text-sm font-medium",
                      niche === n
                        ? "bg-[var(--ink)] text-[var(--on-ink)]"
                        : "border border-[var(--hairline)]",
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {VIBES.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setVibe(v)}
                    className={cn(
                      "min-h-10 rounded-full px-3.5 text-sm font-medium",
                      vibe === v
                        ? "bg-[var(--ink)] text-[var(--on-ink)]"
                        : "border border-[var(--hairline)]",
                    )}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </Accordion>

          <Accordion
            id="country"
            openId={openId}
            setOpenId={setOpenId}
            title="Country and analytics range"
            summary={`${country === "US" ? "United States" : country} · ${range} day analytics range`}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel>Country</FieldLabel>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="h-11 w-full rounded-lg border border-[var(--hairline)] bg-[var(--surface-alt)] px-3 text-sm"
                >
                  {Object.entries({
                    US: "United States",
                    GB: "United Kingdom",
                    CA: "Canada",
                    AU: "Australia",
                    DE: "Germany",
                    IN: "India",
                  }).map(([code, label]) => (
                    <option key={code} value={code}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <FieldLabel>Analytics range (days)</FieldLabel>
                <TextInput value={range} onChange={setRange} />
              </div>
            </div>
          </Accordion>

          <Accordion
            id="restrictions"
            openId={openId}
            setOpenId={setOpenId}
            title="Restrictions"
            summary={`${copyright} copyright claims · ${ageRestricted} age restricted`}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel>Copyright claims</FieldLabel>
                <TextInput value={copyright} onChange={setCopyright} />
              </div>
              <div>
                <FieldLabel>Age restricted</FieldLabel>
                <TextInput value={ageRestricted} onChange={setAgeRestricted} />
              </div>
            </div>
          </Accordion>

          <Accordion
            id="display"
            openId={openId}
            setOpenId={setOpenId}
            title="Display"
            summary={ai ? "AI suggestion chips shown" : "AI suggestion chips hidden"}
          >
            <button
              type="button"
              onClick={() => setAi((v) => !v)}
              className="flex w-full items-center justify-between rounded-xl border border-[var(--hairline)] px-4 py-3 text-left"
            >
              <span className="text-sm font-medium text-[var(--ink)]">
                Show AI suggestion chips
              </span>
              <span
                className={cn(
                  "relative h-7 w-[51px] rounded-full transition",
                  ai ? "bg-[var(--ink)]" : "bg-[var(--track-off)]",
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 size-6 rounded-full bg-white transition",
                    ai ? "left-[23px]" : "left-0.5",
                  )}
                />
              </span>
            </button>
          </Accordion>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--hairline)] bg-[var(--surface)]/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-3xl gap-3">
          <Link href={cancelHref} className="hidden sm:block">
            <Button variant="outline" size="lg" className="min-w-[7rem]">
              Cancel
            </Button>
          </Link>
          <Button
            size="lg"
            className="min-w-0 flex-1"
            disabled={creating || !channelName.trim()}
            onClick={async () => {
              setCreating(true);
              try {
                const data = collectData();
                const title =
                  internalName.trim() || channelName.trim() || "YouTube Studio";
                if (editing && editId) {
                  const updated = updateLocalLarp(editId, { title, data });
                  if (updated) void syncLarpSnapshot(updated);
                  router.push(`/larps/${editId}`);
                } else {
                  const larp = createLocalLarp({
                    title,
                    platform_slug: "youtube-studio",
                    data,
                  });
                  void syncLarpSnapshot(larp);
                  router.push(`/larps/${larp.id}`);
                }
              } finally {
                setCreating(false);
              }
            }}
          >
            {creating ? "Saving…" : editing ? "Save changes" : "Create LARP"}
          </Button>
        </div>
      </div>
    </div>
  );
}
