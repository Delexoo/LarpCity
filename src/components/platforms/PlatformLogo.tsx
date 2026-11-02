import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  getPlatformBrand,
  getPlatformLogoSrc,
} from "@/lib/larps/platform-brand";

type Props = {
  slug: string;
  name: string;
  size?: number;
  className?: string;
  /** Override fit. Default is cover for app icons; contain for glyph marks. */
  fit?: "cover" | "contain";
};

/** Transparent / non-square marks that need padding inside the tile. */
const CONTAIN_SLUGS = new Set([
  "metamask",
  "metatrader",
  "feather-wallet",
  "cake-wallet",
  "onekey",
  "bybit",
  "trezor-suite",
  "paypal",
]);

/**
 * Pre-rounded PNGs with letterboxed corners — scale up so CSS radius
 * clips the empty ring instead of showing a double-squircle.
 */
const BLEED_SLUGS = new Set([
  "chase",
  "bmw",
  "tesla",
  "porsche",
  "lamborghini",
  "metaads",
  "meta-ads",
  "infloww",
  "ftmo",
  "prop-firms",
  "imessage",
  "fanduel",
]);

/** Real brand mark for platform tiles (dashboard, picker, hubs, sidebar). */
export function PlatformLogo({
  slug,
  name,
  size = 40,
  className,
  fit,
}: Props) {
  const src = getPlatformLogoSrc(slug);
  const brand = getPlatformBrand(slug);
  const mode = fit ?? (CONTAIN_SLUGS.has(slug) ? "contain" : "cover");
  const bleed = mode === "cover" && BLEED_SLUGS.has(slug);
  const pad = size <= 24 ? "p-[12%]" : "p-[16%]";

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[22%]",
        mode === "contain" && "bg-[var(--surface-alt)]",
        className,
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: mode === "cover" ? brand.themeColor : undefined,
      }}
      aria-hidden
    >
      <Image
        src={src}
        alt=""
        fill
        sizes={`${size}px`}
        className={cn(
          mode === "cover" ? "object-cover object-center" : `object-contain ${pad}`,
          bleed && (size <= 24 ? "scale-[1.2]" : "scale-[1.14]"),
        )}
        unoptimized
      />
      <span className="sr-only">{name}</span>
    </span>
  );
}
