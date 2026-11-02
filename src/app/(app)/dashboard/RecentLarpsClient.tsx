"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LarpCard } from "@/components/larps/LarpCard";
import { Button } from "@/components/ui/Button";
import { listLocalLarps, type LocalLarp } from "@/lib/larps/local-store";

export function RecentLarpsClient() {
  const [larps, setLarps] = useState<LocalLarp[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLarps(listLocalLarps().slice(0, 6));
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="h-28 animate-pulse rounded-[1.5rem] bg-[var(--skeleton)]/40" />
    );
  }

  if (larps.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-[var(--dashed)] bg-[var(--surface)] px-6 py-12 text-center shadow-[var(--shadow-card)]">
        <p className="page-title text-2xl">No LARPs yet</p>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Create one from a platform and it will show up here.
        </p>
        <Link href="/larps/new" className="mt-6 inline-block">
          <Button size="sm">Browse platforms</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {larps.map((larp) => (
        <LarpCard key={larp.id} larp={larp} />
      ))}
    </div>
  );
}
