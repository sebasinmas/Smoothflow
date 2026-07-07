import { NavLink, useMatch, useNavigate } from "react-router-dom";
import { LogOut, Plus } from "lucide-react";
import type { Role } from "@smoothflow/shared";
import { ROLE_LABELS } from "@smoothflow/shared";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/contexts/SidebarContext";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { AppTooltip } from "@/components/ui/Tooltip";
import { getNavIcon } from "@/lib/navigation";
import { TOOLTIPS } from "@/lib/tooltips";

export interface NavItem {
  to: string;
  label: string;
}

interface SideNavProps {
  userRole: Role;
  items: NavItem[];
  bottomNavItems?: NavItem[];
  primaryAction?: { label: string; onClick: () => void };
}

function NavLinkItem({
  item,
  isExpanded,
  onNavigate,
}: {
  item: NavItem;
  isExpanded: boolean;
  onNavigate: () => void;
}) {
  const Icon = getNavIcon(item.to);
  const isActive = !!useMatch({ path: item.to, end: true });
  return (
    <li>
      <AppTooltip content={item.label} isDisabled={isExpanded}>
        <NavLink
          to={item.to}
          onClick={onNavigate}
          aria-label={item.label}
          aria-current={isActive ? "page" : undefined}
          className={`group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 ${
            isActive
              ? "bg-brand/10 font-medium text-brand shadow-sm"
              : "text-text hover:bg-surface-muted hover:translate-x-0.5"
          } ${isExpanded ? "" : "justify-center px-2"}`}
        >
          <Icon
            className="size-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110"
            aria-hidden="true"
          />
          <span
            className={`truncate transition-all duration-300 ${
              isExpanded ? "w-auto opacity-100" : "w-0 overflow-hidden opacity-0"
            }`}
          >
            {item.label}
          </span>
        </NavLink>
      </AppTooltip>
    </li>
  );
}

export function SideNav({ userRole, items, bottomNavItems, primaryAction }: SideNavProps) {
  const { user, logout } = useAuth();
  const { collapsed, mobileOpen, isMobile, closeMobile } = useSidebar();
  const navigate = useNavigate();

  const isExpanded = isMobile ? mobileOpen : !collapsed;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <>
      {isMobile && mobileOpen && (
        <button
          type="button"
          aria-label="Cerrar menú"
          className="fixed inset-0 z-30 cursor-pointer bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 animate-in fade-in md:hidden"
          onClick={closeMobile}
        />
      )}

      <nav
        aria-label="Navegación principal"
        className={`fixed inset-y-0 left-0 z-40 flex h-screen flex-col border-r border-border bg-white shadow-sm transition-[width,transform] duration-300 ease-in-out md:relative md:translate-x-0 md:shadow-none ${
          isExpanded ? "w-60" : "w-[4.5rem]"
        } ${isMobile && !mobileOpen ? "-translate-x-full" : "translate-x-0"}`}
      >
        <div
          className={`flex shrink-0 items-center gap-3 border-b border-border px-4 py-5 ${
            isExpanded ? "" : "justify-center px-0"
          }`}
        >
          <AppTooltip content={TOOLTIPS.layout.logo(ROLE_LABELS[userRole])} isDisabled={isExpanded}>
            <Logo size="sm" className="shrink-0" />
          </AppTooltip>
          <div
            className={`min-w-0 overflow-hidden transition-all duration-300 ${
              isExpanded ? "w-auto opacity-100" : "w-0 opacity-0"
            }`}
          >
            <p className="truncate text-lg font-bold text-brand">Smooth Flow</p>
            {user && (
              <p className="truncate text-xs text-text-muted">{ROLE_LABELS[userRole]}</p>
            )}
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-4">
          {primaryAction && (
            <AppTooltip content={primaryAction.label} isDisabled={isExpanded}>
              <Button
                className={`mb-4 transition-all duration-300 ${isExpanded ? "w-full" : "w-full px-0"}`}
                onClick={primaryAction.onClick}
                aria-label={primaryAction.label}
              >
                <Plus className="size-[18px] shrink-0" aria-hidden="true" />
                <span
                  className={`truncate transition-all duration-300 ${
                    isExpanded ? "w-auto opacity-100" : "w-0 overflow-hidden opacity-0"
                  }`}
                >
                  {primaryAction.label}
                </span>
              </Button>
            </AppTooltip>
          )}

          <ul className="flex flex-1 flex-col gap-1">
            {items.map((item) => (
              <NavLinkItem
                key={item.to}
                item={item}
                isExpanded={isExpanded}
                onNavigate={closeMobile}
              />
            ))}
          </ul>
        </div>

        <div className="shrink-0 border-t border-border px-3 py-4">
          {bottomNavItems && bottomNavItems.length > 0 && (
            <ul className="mb-2 flex flex-col gap-1">
              {bottomNavItems.map((item) => (
                <NavLinkItem
                  key={item.to}
                  item={item}
                  isExpanded={isExpanded}
                  onNavigate={closeMobile}
                />
              ))}
            </ul>
          )}
          <AppTooltip content={TOOLTIPS.layout.logout} isDisabled={isExpanded}>
            <button
              type="button"
              onClick={handleLogout}
              aria-label={TOOLTIPS.layout.logout}
              className={`group flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-text transition-all duration-200 hover:bg-red-50 hover:text-red-600 ${
                isExpanded ? "" : "justify-center px-2"
              }`}
            >
              <LogOut
                className="size-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110"
                aria-hidden="true"
              />
              <span
                className={`truncate transition-all duration-300 ${
                  isExpanded ? "w-auto opacity-100" : "w-0 overflow-hidden opacity-0"
                }`}
              >
                Cerrar sesión
              </span>
            </button>
          </AppTooltip>
        </div>
      </nav>
    </>
  );
}
