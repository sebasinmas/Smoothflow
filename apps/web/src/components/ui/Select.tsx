import type { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: Array<{ value: string; label: string }>;
  error?: string;
  hideLabel?: boolean;
}

export function Select({ label, options, error, hideLabel, id, className = "", ...props }: SelectProps) {
  const selectId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={selectId}
        className={hideLabel ? "sr-only" : "text-sm font-medium text-text"}
      >
        {label}
      </label>
      <select
        id={selectId}
        aria-invalid={!!error}
        className={`h-10 cursor-pointer rounded border border-border bg-white px-3 text-sm text-text transition-colors duration-200 hover:border-brand/40 focus-visible:border-brand ${className}`}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
