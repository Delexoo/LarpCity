"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function CreateLarpActions({
  platformSlug,
  platformName,
}: {
  platformSlug: string;
  platformName: string;
}) {
  return (
    <Link href={`/platforms/${encodeURIComponent(platformSlug)}/new`}>
      <Button size="sm">New {platformName}</Button>
    </Link>
  );
}
