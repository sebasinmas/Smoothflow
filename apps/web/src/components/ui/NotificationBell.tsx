import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Bell } from "lucide-react";
import { AppTooltip } from "@/components/ui/Tooltip";
import { useRealtime } from "@/contexts/RealtimeContext";
import { TOOLTIPS } from "@/lib/tooltips";

const statusColors = {
  connected: "bg-success",
  reconnecting: "bg-yellow-500",
  offline: "bg-gray-400",
};

const statusTooltips = {
  connected: TOOLTIPS.layout.realtimeConnected,
  reconnecting: TOOLTIPS.layout.realtimeReconnecting,
  offline: TOOLTIPS.layout.realtimeOffline,
};

interface PanelPosition {
  top: number;
  right: number;
}

export function NotificationBell() {
  const { status, notifications, unreadCount, markAllRead, markRead } = useRealtime();
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<PanelPosition>({ top: 0, right: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setPosition({
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
    });
  };

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        panelRef.current?.contains(target) ||
        buttonRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleToggle = () => {
    if (!open && unreadCount > 0) markAllRead();
    setOpen((v) => !v);
  };

  const bellTooltip = [
    unreadCount > 0
      ? TOOLTIPS.layout.unreadNotifications(unreadCount)
      : TOOLTIPS.layout.notifications,
    statusTooltips[status],
  ].join(" — ");

  return (
    <div className="relative">
      <AppTooltip content={bellTooltip}>
        <button
          ref={buttonRef}
          type="button"
          onClick={handleToggle}
          className="relative inline-flex size-9 cursor-pointer items-center justify-center rounded-lg border border-border text-text-muted transition-all duration-200 hover:border-brand/30 hover:bg-surface-muted hover:text-brand active:scale-95"
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
            <span className="unread-pulse absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </AppTooltip>

      {open &&
        createPortal(
          <div
            ref={panelRef}
            className="z-popover fixed w-80 overflow-hidden rounded-xl border border-border bg-white shadow-lg animate-in fade-in duration-200"
            style={{ top: position.top, right: position.right }}
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
                      className={`w-full cursor-pointer px-4 py-3 text-left text-sm transition-colors hover:bg-surface-muted ${
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
          </div>,
          document.body,
        )}
    </div>
  );
}
