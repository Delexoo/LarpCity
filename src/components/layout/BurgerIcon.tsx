import { cn } from "@/lib/utils";

/** Three-line burger that morphs to an X when `open`. */
export function BurgerIcon({
  open,
  className,
}: {
  open?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn("menu-bars", open && "is-x", className)}
      aria-hidden="true"
    />
  );
}
