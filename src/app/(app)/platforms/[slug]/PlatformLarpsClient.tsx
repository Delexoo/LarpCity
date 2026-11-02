"use client";

import { useEffect, useState } from "react";
import { LarpCard } from "@/components/larps/LarpCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { CreateLarpActions } from "../../larps/new/CreateLarpActions";
import {
  listLocalLarpsForPlatform,
  type LocalLarp,
} from "@/lib/larps/local-store";

export function PlatformLarpsClient({
  slug,
  platformName,
}: {
  slug: string;
  platformName: string;
}) {
  const [larps, setLarps] = useState<LocalLarp[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLarps(listLocalLarpsForPlatform(slug));
    setReady(true);
  }, [slug]);

  if (!ready) {
    return <div className="h-32 animate-pulse rounded-[1.5rem] bg-[var(--skeleton)]/40" />;
  }

  if (larps.length === 0) {
    return (
      <EmptyState
        title={`No ${platformName} LARPs yet`}
        description={`Create one, set the numbers, then open your ${platformName} mock.`}
        action={
          <CreateLarpActions
            platformSlug={slug}
            platformName={platformName}
          />
        }
      />
    );
  }

  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      {larps.map((larp) => (
        <LarpCard key={larp.id} larp={larp} />
      ))}
    </div>
  );
}
