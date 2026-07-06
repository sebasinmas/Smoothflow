import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { PACIENTE_NAV, getNavIcon } from "@/lib/navigation";

interface PatientShellProps {
  title: string;
  children: ReactNode;
}

export function PatientShell({ title, children }: PatientShellProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/paciente/login");
  };

  return (
    <div className="min-h-screen bg-surface">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-brand focus:px-4 focus:py-2 focus:text-white"
      >
        Ir al contenido
      </a>
      <header className="border-b border-border bg-white px-4 py-4 md:px-6">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-brand">{title}</h1>
          <nav aria-label="Navegación principal" className="flex items-center gap-1 text-sm">
            {PACIENTE_NAV.map((item) => {
              const Icon = getNavIcon(item.to);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 rounded-lg px-3 py-2 transition-colors duration-200 ${
                      isActive
                        ? "bg-brand/10 font-medium text-brand"
                        : "text-text-muted hover:bg-surface-muted hover:text-brand"
                    }`
                  }
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {item.label}
                </NavLink>
              );
            })}
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-text-muted transition-colors duration-200 hover:bg-red-50 hover:text-red-600"
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
