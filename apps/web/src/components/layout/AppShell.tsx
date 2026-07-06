import type { ReactNode } from "react";
import { SideNav, type NavItem } from "@/components/layout/SideNav";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { SidebarProvider } from "@/contexts/SidebarContext";
import type { Role } from "@smoothflow/shared";

interface AppShellProps {
  role: Role;
  navItems: NavItem[];
  title?: string;
  showLive?: boolean;
  primaryAction?: { label: string; onClick: () => void };
  children: ReactNode;
  headerExtra?: ReactNode;
}

export function AppShell({
  role,
  navItems,
  title,
  showLive,
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
        <SideNav role={role} items={navItems} primaryAction={primaryAction} />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <TopAppBar title={title} showLive={showLive}>
            {headerExtra}
          </TopAppBar>
          <main
            id="main-content"
            className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 animate-in fade-in duration-300"
          >
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
