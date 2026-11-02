import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--acid)] text-[var(--ink)] hover:brightness-110 font-semibold",
  secondary:
    "bg-white/5 text-[var(--paper)] border border-white/10 hover:bg-white/8 font-medium",
  ghost:
    "bg-transparent text-[var(--text-secondary)] hover:text-[var(--paper)] hover:bg-white/5",
  danger:
    "bg-[var(--coral)]/15 text-[var(--coral)] border border-[var(--coral)]/30 hover:bg-[var(--coral)]/25 font-medium",
  outline:
    "bg-transparent border border-white/15 text-[var(--paper)] hover:border-[var(--acid)]/40 hover:text-[var(--acid)] font-medium",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3.5 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-11 px-5 text-sm gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { className, variant = "primary", size = "md", type = "button", ...props },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex items-center justify-center rounded-full transition-[filter,background-color,border-color,color,opacity] duration-150 disabled:opacity-45 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      />
    );
  },
);
