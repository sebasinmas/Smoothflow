import type { ReactNode } from "react";
import { SideNav, type NavItem } from "@/components/layout/SideNav";
import { TopAppBar } from "@/components/layout/TopAppBar";
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
    <div className="flex min-h-screen bg-surface">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-brand focus:px-4 focus:py-2 focus:text-white"
      >
        Ir al contenido
      </a>
      <SideNav role={role} items={navItems} primaryAction={primaryAction} />
      <div className="flex min-h-screen flex-1 flex-col">
        <TopAppBar title={title} showLive={showLive}>
          {headerExtra}
        </TopAppBar>
        <main id="main-content" className="flex-1 overflow-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
