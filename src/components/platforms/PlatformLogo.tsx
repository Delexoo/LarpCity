import Image from "next/image";
import { cn } from "@/lib/utils";
import { getPlatformLogoSrc } from "@/lib/larps/platform-brand";

type Props = {
  slug: string;
  name: string;
  size?: number;
  className?: string;
};

/** Real brand mark for platform tiles (dashboard, picker, hubs). */
export function PlatformLogo({ slug, name, size = 40, className }: Props) {
  const src = getPlatformLogoSrc(slug);
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[1.15rem] bg-[var(--surface-alt)] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)]",
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <Image
        src={src}
        alt=""
        width={size}
        height={size}
        className="h-full w-full object-cover"
        unoptimized
      />
      <span className="sr-only">{name}</span>
    </span>
  );
}
