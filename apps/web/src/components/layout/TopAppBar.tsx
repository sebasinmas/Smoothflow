import type { ReactNode } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { ROLE_LABELS } from "@smoothflow/shared";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { AppTooltip } from "@/components/ui/Tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/contexts/SidebarContext";
import { TOOLTIPS } from "@/lib/tooltips";
import { formatPersonName } from "@/lib/utils";

interface TopAppBarProps {
  title?: string;
  children?: ReactNode;
  showNotifications?: boolean;
}

function getInitials(givenName: string, familyName: string): string {
  return `${givenName.charAt(0)}${familyName.charAt(0)}`.toUpperCase();
}

export function TopAppBar({ title, children, showNotifications }: TopAppBarProps) {
  const { user } = useAuth();
  const { collapsed, isMobile, toggle } = useSidebar();

  const sidebarExpanded = isMobile ? true : !collapsed;

  return (
    <header className="sticky top-0 z-chrome flex h-16 shrink-0 items-center justify-between border-b border-border bg-white/95 px-4 shadow-sm backdrop-blur-sm md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <AppTooltip
          content={sidebarExpanded ? TOOLTIPS.layout.collapseMenu : TOOLTIPS.layout.expandMenu}
        >
          <button
            type="button"
            onClick={toggle}
            className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border text-text-muted transition-all duration-200 hover:border-brand/30 hover:bg-surface-muted hover:text-brand active:scale-95"
            aria-label={sidebarExpanded ? TOOLTIPS.layout.collapseMenu : TOOLTIPS.layout.expandMenu}
            aria-expanded={sidebarExpanded}
          >
            {sidebarExpanded ? (
              <PanelLeftClose className="size-[18px]" aria-hidden="true" />
            ) : (
              <PanelLeftOpen className="size-[18px]" aria-hidden="true" />
            )}
          </button>
        </AppTooltip>

        <div className="min-w-0">
          {title && (
            <h1 className="truncate text-lg font-semibold text-text transition-opacity duration-200">
              {title}
            </h1>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {showNotifications && <NotificationBell />}
        {children}
        {user && (
          <AppTooltip
            content={TOOLTIPS.layout.userAvatar(
              formatPersonName(user.givenName, user.familyName),
              ROLE_LABELS[user.role],
            )}
          >
            <div className="hidden items-center gap-2 rounded-full border border-border bg-surface-muted/60 py-1 pl-1 pr-3 sm:flex">
              <span className="flex size-7 items-center justify-center rounded-full bg-brand text-xs font-semibold text-white">
                {getInitials(user.givenName, user.familyName)}
              </span>
              <span className="max-w-32 truncate text-xs font-medium text-text">
                {user.givenName}
              </span>
            </div>
          </AppTooltip>
        )}
      </div>
    </header>
  );
}
