interface SegmentedControlProps {
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  className?: string;
  size?: "sm" | "md";
}

export function SegmentedControl({
  value,
  options,
  onChange,
  className = "",
  size = "md",
}: SegmentedControlProps) {
  const padding = size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm";

  return (
    <div
      className={`inline-flex w-full rounded-lg border border-border bg-surface-muted p-0.5 ${className}`}
      role="group"
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          aria-pressed={value === opt.value}
          className={`flex-1 cursor-pointer rounded-md font-medium transition-all duration-200 ${padding} ${
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
