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

interface RealtimeContextValue {
  status: ConnectionStatus;
  lastEvent: string | null;
  doc: Y.Doc | null;
}

const RealtimeContext = createContext<RealtimeContextValue>({
  status: "offline",
  lastEvent: null,
  doc: null,
});

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { user, purgeSensitiveData } = useAuth();
  const [status, setStatus] = useState<ConnectionStatus>("offline");
  const [lastEvent, setLastEvent] = useState<string | null>(null);
  const [doc, setDoc] = useState<Y.Doc | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const retryRef = useRef(0);
  const docRef = useRef<Y.Doc | null>(null);

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
      const last = events.get(events.length - 1);
      if (last) {
        const label =
          last.type === "appointment:created"
            ? "Nueva cita registrada"
            : last.type === "appointment:updated"
              ? "Cita actualizada"
              : last.type === "appointment:blocked"
                ? "Bloqueo de agenda"
                : "Actualización de agenda";
        setLastEvent(label);
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
  }, [user, purgeSensitiveData]);

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
      docRef.current?.destroy();
      docRef.current = null;
      setDoc(null);
    };
  }, [connect]);

  const value = useMemo(
    () => ({ status, lastEvent, doc }),
    [status, lastEvent, doc],
  );

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}

export function useRealtime() {
  return useContext(RealtimeContext);
}
