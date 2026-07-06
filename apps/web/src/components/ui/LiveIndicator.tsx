import { useRealtime } from "@/contexts/RealtimeContext";
import { AppTooltip } from "@/components/ui/Tooltip";

const statusConfig = {
  connected: {
    label: "En vivo",
    dotClass: "bg-success",
    textClass: "text-success",
    tooltip: "Sincronización en tiempo real activa",
    showLabel: false,
    pulse: false,
  },
  reconnecting: {
    label: "Reconectando…",
    dotClass: "bg-amber-500",
    textClass: "text-amber-700",
    tooltip: "Reconectando sincronización en tiempo real",
    showLabel: true,
    pulse: true,
  },
  offline: {
    label: "Sin conexión",
    dotClass: "bg-red-500",
    textClass: "text-red-700",
    tooltip: "Sin conexión en tiempo real",
    showLabel: true,
    pulse: false,
  },
} as const;

export function LiveIndicator() {
  const { status } = useRealtime();
  const config = statusConfig[status];

  const indicator = (
    <button
      type="button"
      className={`flex items-center gap-2 ${
        config.showLabel
          ? "rounded-full border border-border bg-surface-muted/60 px-3 py-1.5"
          : "rounded-full p-1"
      }`}
      aria-label={`Conexión en tiempo real: ${config.label}`}
    >
      <span className="relative flex size-2 shrink-0" aria-hidden="true">
        {config.pulse && (
          <span
            className={`absolute inline-flex size-full rounded-full opacity-75 ${config.dotClass} motion-safe:animate-ping`}
          />
        )}
        <span className={`relative inline-flex size-2 rounded-full ${config.dotClass}`} />
      </span>
      {config.showLabel && (
        <span className={`text-xs font-semibold ${config.textClass}`}>{config.label}</span>
      )}
    </button>
  );

  return <AppTooltip content={config.tooltip}>{indicator}</AppTooltip>;
}
