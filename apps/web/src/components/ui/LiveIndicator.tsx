import { useRealtime } from "@/contexts/RealtimeContext";

const labels = {
  connected: "En vivo",
  reconnecting: "Reconectando…",
  offline: "Sin conexión",
};

const colors = {
  connected: "bg-success",
  reconnecting: "bg-yellow-500",
  offline: "bg-gray-400",
};

export function LiveIndicator() {
  const { status } = useRealtime();
  return (
    <div
      className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-text"
      role="status"
      aria-live="polite"
    >
      <span className={`h-2 w-2 rounded-full ${colors[status]}`} aria-hidden="true" />
      {labels[status]}
    </div>
  );
}
