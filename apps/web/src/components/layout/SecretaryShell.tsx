import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { LiveIndicator } from "@/components/ui/LiveIndicator";
import { SECRETARIA_NAV } from "@/lib/navigation";

interface SecretaryShellProps {
  title?: string;
  showNotifications?: boolean;
  fillContent?: boolean;
  primaryAction?: { label: string; onClick: () => void };
  headerExtra?: ReactNode;
  children: ReactNode;
}

export function SecretaryShell({
  showNotifications = true,
  headerExtra,
  ...props
}: SecretaryShellProps) {
  return (
    <AppShell
      userRole="secretaria"
      navItems={SECRETARIA_NAV}
      showNotifications={showNotifications}
      headerExtra={
        <>
          {headerExtra}
          <LiveIndicator />
        </>
      }
      {...props}
    />
  );
}
