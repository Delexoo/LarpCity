"use client";

import Link from "next/link";

/** Small Free-plan mark (Pro removes it). Matches Install pill size. */
export function LarpWatermark() {
  return (
    <div className="pointer-events-none fixed bottom-3 right-3 z-[80]">
      <Link
        href="/pricing"
        title="Upgrade to remove watermark"
        className="pointer-events-auto inline-flex h-7 items-center gap-1.5 rounded-full bg-[#111]/92 pl-1.5 pr-2.5 text-[11px] font-semibold leading-none tracking-tight text-white shadow-[0_6px_16px_rgba(0,0,0,.2)] backdrop-blur-sm"
      >
        <img
          src="/larplabslogo.png"
          alt=""
          width={16}
          height={16}
          className="size-4 shrink-0 rounded-[4px] object-cover"
        />
        Made with LarpCity
      </Link>
    </div>
  );
}
