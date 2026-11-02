import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { LarpsListClient } from "./LarpsListClient";

export const metadata = { title: "My LARPs" };

export default async function LarpsPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="page-title">My LARPs</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            All of your mock dashboards in one place.
          </p>
        </div>
        <Link href="/larps/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">New LARP</Button>
        </Link>
      </div>

      {params.created ? (
        <div className="rounded-2xl border border-[var(--acid)]/25 bg-[var(--accent-select)] px-4 py-3 text-sm text-[var(--acid)]">
          LARP created — newest one is highlighted below.
        </div>
      ) : null}

      <LarpsListClient highlightId={params.created} />
    </div>
  );
}
