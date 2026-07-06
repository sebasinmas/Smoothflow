import type { ReactNode } from "react";

interface SegmentedControlProps {
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}

export function SegmentedControl({ value, options, onChange }: SegmentedControlProps) {
  return (
    <div
      className="inline-flex rounded-lg border border-border bg-surface-muted p-0.5"
      role="group"
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          aria-pressed={value === opt.value}
          className={`cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
            value === opt.value
              ? "bg-white text-brand shadow-sm"
              : "text-text-muted hover:text-text"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

interface CalendarToolbarProps {
  children: ReactNode;
}

export function CalendarToolbar({ children }: CalendarToolbarProps) {
  return (
    <div className="mb-4 flex shrink-0 flex-wrap items-center gap-x-4 gap-y-3 rounded-xl border border-border bg-white p-3 shadow-card">
      {children}
    </div>
  );
}
