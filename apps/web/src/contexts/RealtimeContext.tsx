import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import * as Y from "yjs";
import { useAuth } from "@/contexts/AuthContext";

type ConnectionStatus = "connected" | "reconnecting" | "offline";

export interface RealtimeNotification {
  id: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

const MAX_NOTIFICATIONS = 20;

interface RealtimeContextValue {
  status: ConnectionStatus;
  lastEvent: string | null;
  notifications: RealtimeNotification[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  doc: Y.Doc | null;
}

const RealtimeContext = createContext<RealtimeContextValue>({
  status: "offline",
  lastEvent: null,
  notifications: [],
  unreadCount: 0,
  markRead: () => {},
  markAllRead: () => {},
  doc: null,
});

function eventLabel(type: string): string {
  switch (type) {
    case "appointment:created":
      return "Nueva cita registrada";
    case "appointment:updated":
      return "Cita actualizada";
    case "appointment:blocked":
      return "Bloqueo de agenda";
    default:
      return "Actualización de agenda";
  }
}

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { user, purgeSensitiveData } = useAuth();
  const [status, setStatus] = useState<ConnectionStatus>("offline");
  const [lastEvent, setLastEvent] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [doc, setDoc] = useState<Y.Doc | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const retryRef = useRef(0);
  const docRef = useRef<Y.Doc | null>(null);
  const lastProcessedRef = useRef(0);

  const pushNotification = useCallback((message: string) => {
    const notification: RealtimeNotification = {
      id: crypto.randomUUID(),
      message,
      timestamp: new Date(),
      read: false,
    };
    setNotifications((prev) => [notification, ...prev].slice(0, MAX_NOTIFICATIONS));
    setLastEvent(message);
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const connect = useCallback(() => {
    if (!user || user.role === "paciente" || !user.clinicId) {
      setStatus("offline");
      setDoc(null);
      return;
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${window.location.host}/api/ws`);
    wsRef.current = ws;
    const ydoc = docRef.current ?? new Y.Doc();
    docRef.current = ydoc;
    setDoc(ydoc);

    ws.binaryType = "arraybuffer";

    ws.onopen = () => {
      setStatus("connected");
      retryRef.current = 0;
    };

    ws.onmessage = (event) => {
      const data = event.data instanceof ArrayBuffer ? new Uint8Array(event.data) : new Uint8Array();
      Y.applyUpdate(ydoc, data);
      const events = ydoc.getArray<{ type: string }>("events");
      const length = events.length;
      if (length > lastProcessedRef.current) {
        for (let i = lastProcessedRef.current; i < length; i++) {
          const ev = events.get(i);
          if (ev) pushNotification(eventLabel(ev.type));
        }
        lastProcessedRef.current = length;
      }
    };

    ydoc.on("update", (update: Uint8Array, origin: unknown) => {
      if (origin === ws || ws.readyState !== WebSocket.OPEN) return;
      ws.send(update);
    });

    ws.onclose = (ev) => {
      setStatus("offline");
      if (ev.code === 4001) {
        purgeSensitiveData();
        window.location.href = "/login";
        return;
      }
      const delay = Math.min(1000 * 2 ** retryRef.current, 30000);
      retryRef.current += 1;
      setStatus("reconnecting");
      setTimeout(connect, delay);
    };

    ws.onerror = () => ws.close();
  }, [user, purgeSensitiveData, pushNotification]);

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
      docRef.current?.destroy();
      docRef.current = null;
      setDoc(null);
      lastProcessedRef.current = 0;
    };
  }, [connect]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const value = useMemo(
    () => ({
      status,
      lastEvent,
      notifications,
      unreadCount,
      markRead,
      markAllRead,
      doc,
    }),
    [status, lastEvent, notifications, unreadCount, markRead, markAllRead, doc],
  );

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}

export function useRealtime() {
  return useContext(RealtimeContext);
}
