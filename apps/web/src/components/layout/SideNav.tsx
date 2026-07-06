import { NavLink, useNavigate } from "react-router-dom";
import type { Role } from "@smoothflow/shared";
import { ROLE_LABELS } from "@smoothflow/shared";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { formatPersonName } from "@/lib/utils";

export interface NavItem {
  to: string;
  label: string;
}

interface SideNavProps {
  role: Role;
  items: NavItem[];
  primaryAction?: { label: string; onClick: () => void };
}

export function SideNav({ role, items, primaryAction }: SideNavProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav
      aria-label="Navegación principal"
      className="flex h-full w-60 shrink-0 flex-col border-r border-border bg-white px-4 py-6"
    >
      <div className="mb-6 flex items-center gap-2">
        <div
          className="flex h-8 w-8 items-center justify-center rounded bg-brand text-sm font-bold text-white"
          aria-hidden="true"
        >
          SF
        </div>
        <div>
          <p className="text-xl font-bold text-brand">Smooth Flow</p>
          {user && (
            <p className="text-sm text-text-muted">{ROLE_LABELS[role]}</p>
          )}
        </div>
      </div>

      {primaryAction && (
        <Button className="mb-6 w-full" onClick={primaryAction.onClick}>
          {primaryAction.label}
        </Button>
      )}

      <ul className="flex flex-1 flex-col gap-1">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                `block rounded px-4 py-2 text-sm transition-colors ${
                  isActive
                    ? "border-r-3 border-brand bg-surface-muted font-medium text-brand"
                    : "text-text hover:bg-surface-muted"
                }`
              }
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="mt-auto border-t border-border pt-4">
        {user && (
          <p className="mb-2 truncate px-2 text-xs text-text-muted">
            {formatPersonName(user.givenName, user.familyName)}
          </p>
        )}
        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded px-4 py-2 text-left text-sm text-text hover:bg-surface-muted"
        >
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}
