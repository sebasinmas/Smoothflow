import type { ReactNode } from "react";
import { Logo } from "@/components/ui/Logo";

interface AuthLayoutProps {
  title?: string;
  subtitle?: string;
  showWordmark?: boolean;
  footer?: ReactNode;
  children: ReactNode;
}

export function AuthLayout({
  title,
  subtitle,
  showWordmark = true,
  footer,
  children,
}: AuthLayoutProps) {
  return (
    <div className="auth-bg relative flex min-h-screen items-center justify-center px-4 py-8">
      <a
        href="#auth-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-brand focus:px-4 focus:py-2 focus:text-white"
      >
        Ir al contenido
      </a>
      <div className="relative w-full max-w-md">
        <div
          id="auth-content"
          className="card animate-in fade-in zoom-in-95 rounded-lg p-8 shadow-card ring-1 ring-border/50 duration-300 md:p-10"
        >
          <div className="mb-8 flex flex-col items-center text-center">
            <Logo size="md" showWordmark={showWordmark} />
            {title && (
              <h1 className="mt-4 text-xl font-bold text-brand">{title}</h1>
            )}
            {subtitle && (
              <p className="mt-2 text-sm text-text-muted">{subtitle}</p>
            )}
          </div>
          {children}
        </div>
        {footer ?? (
          <p className="mt-4 text-center text-xs text-text-muted">
            Entorno seguro para clínicas · © 2026 Smooth Flow
          </p>
        )}
      </div>
    </div>
  );
}
