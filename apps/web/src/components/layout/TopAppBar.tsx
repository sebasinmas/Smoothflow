import type { ReactNode } from "react";
import { LiveIndicator } from "@/components/ui/LiveIndicator";
import { useRealtime } from "@/contexts/RealtimeContext";

interface TopAppBarProps {
  title?: string;
  children?: ReactNode;
  showLive?: boolean;
}

export function TopAppBar({ title, children, showLive }: TopAppBarProps) {
  const { lastEvent } = useRealtime();
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-white px-8">
      <div>
        {title && <h1 className="text-lg font-semibold text-text">{title}</h1>}
        {lastEvent && showLive && (
          <p className="text-xs text-text-muted" aria-live="polite">
            {lastEvent}
          </p>
        )}
      </div>
      <div className="flex items-center gap-4">
        {showLive && <LiveIndicator />}
        {children}
      </div>
    </header>
  );
}
