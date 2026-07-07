import type { ReactNode } from "react";
import { NavLink, useMatch, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/ui/Logo";
import { PACIENTE_NAV, getNavIcon } from "@/lib/navigation";
import { TOOLTIPS } from "@/lib/tooltips";

interface PatientShellProps {
  title: string;
  children: ReactNode;
}

function PatientNavLink({ to, label }: { to: string; label: string }) {
  const Icon = getNavIcon(to);
  const isActive = !!useMatch({ path: to, end: true });

  return (
    <NavLink
      to={to}
      aria-current={isActive ? "page" : undefined}
      className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 transition-all duration-200 ${
        isActive
          ? "bg-brand/10 font-medium text-brand"
          : "text-text-muted hover:-translate-y-px hover:bg-surface-muted hover:text-brand"
      }`}
    >
      <Icon className="size-4" aria-hidden="true" />
      {label}
    </NavLink>
  );
}

export function PatientShell({ title, children }: PatientShellProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/patient/login");
  };

  return (
    <div className="min-h-screen bg-surface app-bg">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-brand focus:px-4 focus:py-2 focus:text-white"
      >
        Ir al contenido
      </a>
      <header className="border-b border-border bg-white/95 px-4 py-4 shadow-sm backdrop-blur-sm md:px-6">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <Logo size="sm" />
            <h1 className="truncate text-xl font-bold text-brand">{title}</h1>
          </div>
          <nav aria-label="Navegación principal" className="flex items-center gap-1 text-sm">
            {PACIENTE_NAV.map((item) => (
              <PatientNavLink key={item.to} to={item.to} label={item.label} />
            ))}
            <button
              type="button"
              onClick={handleLogout}
              aria-label={TOOLTIPS.layout.logout}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-text-muted transition-all duration-200 hover:-translate-y-px hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="size-4" aria-hidden="true" />
              Salir
            </button>
          </nav>
        </div>
      </header>

      <main id="main-content" className="mx-auto max-w-3xl px-4 py-8 md:px-6 animate-in fade-in duration-300">
        {children}
      </main>
    </div>
  );
}
