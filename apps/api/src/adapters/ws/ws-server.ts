import { WebSocketServer, type WebSocket } from "ws";
import type { Server } from "node:http";
import * as Y from "yjs";
import { unsign } from "cookie-signature";
import connectPgSimple from "connect-pg-simple";
import session from "express-session";
import { getClinicDoc, onSessionRevoked } from "./agenda-sync.js";
import { getUserById } from "../../use-cases/auth.js";
import { pool } from "../../infrastructure/db/client.js";

const PgSession = connectPgSimple(session);
const sessionStore = new PgSession({ pool, tableName: "session", createTableIfMissing: true });
const SESSION_SECRET = process.env.SESSION_SECRET ?? "dev-session-secret-change-me";

interface WsClient {
  ws: WebSocket;
  userId: string;
  doc: Y.Doc;
  updateHandler: (update: Uint8Array, origin: unknown) => void;
}

const clients = new Map<WebSocket, WsClient>();
const userConnections = new Map<string, Set<WebSocket>>();

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) return {};
  return Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [k, ...v] = c.trim().split("=");
      return [k, decodeURIComponent(v.join("="))];
    }),
  );
}

function getSessionId(cookieHeader: string | undefined): string | null {
  const signed = parseCookies(cookieHeader)["smoothflow.sid"];
  if (!signed || !signed.startsWith("s:")) return null;
  const unsigned = unsign(signed.slice(2), SESSION_SECRET);
  return typeof unsigned === "string" ? unsigned : null;
}

export function closeUserConnections(userId: string): void {
  const conns = userConnections.get(userId);
  if (!conns) return;
  for (const ws of conns) {
    ws.close(4001, "session_revoked");
  }
}

export function setupWebSocketServer(server: Server): WebSocketServer {
  const wss = new WebSocketServer({ server, path: "/api/ws" });

  onSessionRevoked((userId) => closeUserConnections(userId));

  wss.on("connection", (ws, req) => {
    void (async () => {
      try {
        const sessionId = getSessionId(req.headers.cookie);
        if (!sessionId) {
          ws.close(4001, "unauthorized");
          return;
        }

        const sess = await new Promise<session.SessionData | null | undefined>((resolve, reject) => {
          sessionStore.get(sessionId, (err, data) => {
            if (err) reject(err);
            else resolve(data);
          });
        });

        const userId = sess?.userId;
        if (!userId) {
          ws.close(4001, "unauthorized");
          return;
        }

        const user = await getUserById(userId);
        if (!user || !user.clinicId || user.role === "paciente") {
          ws.close(4001, "unauthorized");
          return;
        }

        const doc = getClinicDoc(user.clinicId);
        let lastSent = 0;

        const updateHandler = (update: Uint8Array, origin: unknown) => {
          if (origin === ws) return;
          const now = Date.now();
          if (now - lastSent < 50) return;
          lastSent = now;
          if (ws.readyState === ws.OPEN) ws.send(update);
        };

        doc.on("update", updateHandler);

        ws.on("message", (data) => {
          const arr = data instanceof Buffer ? new Uint8Array(data) : new Uint8Array(data as ArrayBuffer);
          Y.applyUpdate(doc, arr, ws);
        });

        ws.on("close", () => {
          doc.off("update", updateHandler);
          clients.delete(ws);
          userConnections.get(userId)?.delete(ws);
        });

        clients.set(ws, { ws, userId, doc, updateHandler });
        if (!userConnections.has(userId)) userConnections.set(userId, new Set());
        userConnections.get(userId)!.add(ws);

        ws.send(Y.encodeStateAsUpdate(doc));
      } catch {
        ws.close(1011, "error");
      }
    })();
  });

  return wss;
}
