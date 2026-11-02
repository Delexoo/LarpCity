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
    "bg-[var(--ink)] text-[var(--on-ink)] hover:bg-black font-bold",
  secondary:
    "bg-[var(--surface)] text-[var(--ink)] border border-[var(--hairline)] hover:bg-[var(--surface-alt)] font-medium",
  ghost:
    "bg-transparent text-[var(--text-secondary)] hover:text-[var(--ink)] hover:bg-[var(--surface-alt)]",
  danger:
    "bg-[var(--alert-dot)]/10 text-[var(--alert-dot)] border border-[var(--alert-dot)]/25 hover:bg-[var(--alert-dot)]/15 font-medium",
  outline:
    "bg-transparent border-[1.5px] border-[var(--ink)] text-[var(--ink)] hover:bg-[var(--surface-alt)] font-bold",
};

const sizes: Record<Size, string> = {
  sm: "h-10 px-4 text-sm gap-1.5",
  md: "h-12 px-5 text-[15px] gap-2",
  lg: "h-14 px-7 text-base gap-2.5",
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
          "inline-flex items-center justify-center rounded-full transition-[background-color,border-color,color,opacity] duration-150 disabled:opacity-45 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      />
    );
  },
);
