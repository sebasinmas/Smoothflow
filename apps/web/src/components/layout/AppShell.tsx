import type { ReactNode } from "react";
import { SideNav, type NavItem } from "@/components/layout/SideNav";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { SidebarProvider } from "@/contexts/SidebarContext";
import type { Role } from "@smoothflow/shared";

interface AppShellProps {
  userRole: Role;
  navItems: NavItem[];
  bottomNavItems?: NavItem[];
  title?: string;
  showNotifications?: boolean;
  fillContent?: boolean;
  primaryAction?: { label: string; onClick: () => void };
  children: ReactNode;
  headerExtra?: ReactNode;
}

export function AppShell({
  userRole,
  navItems,
  bottomNavItems,
  title,
  showNotifications,
  fillContent,
  primaryAction,
  children,
  headerExtra,
}: AppShellProps) {
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-surface">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-brand focus:px-4 focus:py-2 focus:text-white"
        >
          Ir al contenido
        </a>
        <SideNav
          userRole={userRole}
          items={navItems}
          bottomNavItems={bottomNavItems}
          primaryAction={primaryAction}
        />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <TopAppBar title={title} showNotifications={showNotifications}>
            {headerExtra}
          </TopAppBar>
          <main
            id="main-content"
            className={`flex-1 p-4 md:p-6 lg:p-8 animate-in fade-in duration-300 ${
              fillContent
                ? "flex min-h-0 flex-col overflow-hidden"
                : "overflow-y-auto"
            }`}
          >
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

