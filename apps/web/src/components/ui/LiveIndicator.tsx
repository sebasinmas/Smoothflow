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
      className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-text shadow-sm transition-shadow duration-200 hover:shadow"
      role="status"
      aria-live="polite"
    >
      <span className="relative flex size-2" aria-hidden="true">
        {status === "connected" && (
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-40" />
        )}
        <span className={`relative inline-flex size-2 rounded-full ${colors[status]}`} />
      </span>
      {labels[status]}
    </div>
  );
}
