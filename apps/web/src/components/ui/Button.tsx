import type { ButtonHTMLAttributes, Ref } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: Ref<HTMLButtonElement>;
  variant?: Variant;
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

export function Button({
  ref,
  className = "",
  variant = "primary",
  loading,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ease-out disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? "Cargando…" : children}
    </button>
  );
}
