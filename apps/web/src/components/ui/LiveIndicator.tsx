import { useRealtime } from "@/contexts/RealtimeContext";

const statusConfig = {
  connected: {
    label: "En vivo",
    dotClass: "bg-success",
    textClass: "text-success",
    pulse: true,
  },
  reconnecting: {
    label: "Reconectando…",
    dotClass: "bg-amber-500",
    textClass: "text-amber-700",
    pulse: false,
  },
  offline: {
    label: "Sin conexión",
    dotClass: "bg-red-500",
    textClass: "text-red-700",
    pulse: false,
  },
} as const;

export function LiveIndicator() {
  const { status } = useRealtime();
  const config = statusConfig[status];

  return (
    <div
      className="flex items-center gap-2 rounded-full border border-border bg-surface-muted/60 px-3 py-1.5"
      role="status"
      aria-live="polite"
      aria-label={`Conexión en tiempo real: ${config.label}`}
    >
      <span className="relative flex size-2 shrink-0" aria-hidden="true">
        <span className={`absolute inline-flex size-full rounded-full opacity-75 ${config.dotClass} ${config.pulse ? "motion-safe:animate-ping" : ""}`} />
        <span className={`relative inline-flex size-2 rounded-full ${config.dotClass}`} />
      </span>
      <span className={`text-xs font-semibold ${config.textClass}`}>{config.label}</span>
    </div>
  );
}
