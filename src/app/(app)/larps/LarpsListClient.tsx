"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LayoutGrid } from "lucide-react";
import { LarpCard } from "@/components/larps/LarpCard";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { listLocalLarps, type LocalLarp } from "@/lib/larps/local-store";

export function LarpsListClient({ highlightId }: { highlightId?: string }) {
  const [larps, setLarps] = useState<LocalLarp[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLarps(listLocalLarps());
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="h-40 animate-pulse rounded-2xl bg-white/[0.04]" />
    );
  }

  if (larps.length === 0) {
    return (
      <EmptyState
        icon={<LayoutGrid className="size-8" strokeWidth={2} />}
        title="No LARPs yet"
        description="Create a LARP from a platform and it will show up here."
        action={
          <Link href="/larps/new">
            <Button>Browse platforms</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {larps.map((larp) => (
        <div
          key={larp.id}
          className={
            highlightId === larp.id
              ? "rounded-2xl ring-2 ring-[var(--acid)]/70"
              : undefined
          }
        >
          <LarpCard larp={larp} />
        </div>
      ))}
    </div>
  );
}
