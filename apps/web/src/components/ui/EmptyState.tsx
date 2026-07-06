import type { ComponentType, ReactNode } from "react";
import { Inbox, type LucideProps } from "lucide-react";

interface EmptyStateProps {
  message: string;
  icon?: ComponentType<LucideProps>;
  action?: ReactNode;
}

export function EmptyState({ message, icon: Icon = Inbox, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-white px-6 py-10 text-center">
      <Icon className="size-8 text-text-muted" aria-hidden="true" />
      <p className="text-sm text-text-muted">{message}</p>
      {action}
    </div>
  );
}
