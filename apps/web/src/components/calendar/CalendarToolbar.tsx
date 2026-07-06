import type { ReactNode } from "react";

export { SegmentedControl } from "@/components/ui/SegmentedControl";

interface CalendarToolbarProps {
  children: ReactNode;
}

export function CalendarToolbar({ children }: CalendarToolbarProps) {
  return (
    <div className="mb-4 flex shrink-0 flex-col gap-3 rounded-xl border border-border bg-white p-3 shadow-card">
      {children}
    </div>
  );
}
