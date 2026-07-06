import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useRealtime } from "@/contexts/RealtimeContext";

const statusColors = {
  connected: "bg-success",
  reconnecting: "bg-yellow-500",
  offline: "bg-gray-400",
};

export function NotificationBell() {
  const { status, notifications, unreadCount, markAllRead, markRead } = useRealtime();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleToggle = () => {
    if (!open && unreadCount > 0) markAllRead();
    setOpen((v) => !v);
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="relative inline-flex size-9 items-center justify-center rounded-lg border border-border text-text-muted transition-all duration-200 hover:border-brand/30 hover:bg-surface-muted hover:text-brand active:scale-95"
        aria-label={`Notificaciones${unreadCount > 0 ? `, ${unreadCount} sin leer` : ""}`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Bell className="size-[18px]" aria-hidden="true" />
        <span
          className={`absolute bottom-1.5 right-1.5 size-2 rounded-full border border-white ${statusColors[status]}`}
          aria-hidden="true"
        />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-border bg-white shadow-lg animate-in fade-in duration-200"
          role="menu"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold text-text">Notificaciones</h2>
            <span className="text-xs text-text-muted">
              {status === "connected"
                ? "Conectado"
                : status === "reconnecting"
                  ? "Reconectando…"
                  : "Sin conexión"}
            </span>
          </div>
          <ul className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-text-muted">
                No hay notificaciones recientes
              </li>
            ) : (
              notifications.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => markRead(n.id)}
                    className={`w-full px-4 py-3 text-left text-sm transition-colors hover:bg-surface-muted ${
                      n.read ? "text-text-muted" : "bg-brand/5 font-medium text-text"
                    }`}
                  >
                    <p>{n.message}</p>
                    <p className="mt-0.5 text-xs text-text-muted">
                      {n.timestamp.toLocaleTimeString("es-CL", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
