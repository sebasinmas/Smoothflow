import type { ComponentType, ReactNode } from "react";
import { Inbox, type LucideProps } from "lucide-react";

interface EmptyStateProps {
  message: string;
  icon?: ComponentType<LucideProps>;
  action?: ReactNode;
}

export function EmptyState({ message, icon: Icon = Inbox, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border/70 bg-white px-6 py-10 text-center animate-in fade-in duration-300">
      <div className="flex size-12 items-center justify-center rounded-full bg-brand-mark/8">
        <Icon className="size-6 text-brand-mark" aria-hidden="true" />
      </div>
      <p className="text-sm text-text-muted">{message}</p>
      {action}
    </div>
  );
}
