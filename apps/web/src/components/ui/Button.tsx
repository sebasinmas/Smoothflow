import type { ButtonHTMLAttributes, Ref } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: Ref<HTMLButtonElement>;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-brand text-white shadow-sm hover:bg-brand-hover hover:shadow-md active:scale-[0.98] active:shadow-sm",
  secondary:
    "bg-white border border-border text-text shadow-sm hover:border-brand/30 hover:bg-surface-muted hover:shadow active:scale-[0.98]",
  ghost:
    "bg-transparent text-text hover:bg-surface-muted active:scale-[0.98]",
  danger:
    "bg-red-600 text-white shadow-sm hover:bg-red-700 hover:shadow-md active:scale-[0.98]",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-xs",
  md: "h-10 px-4 py-2 text-sm",
  lg: "h-11 px-5 text-sm",
};

export function Button({
  ref,
  className = "",
  variant = "primary",
  size = "md",
  loading,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 ease-out disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? "Cargando…" : children}
    </button>
  );
}