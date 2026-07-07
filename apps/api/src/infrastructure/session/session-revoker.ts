import { pool } from "../db/client.js";
import type { SessionRevoker } from "../../domain/ports/session-revoker.port.js";

export async function revokeUserSessions(userId: string): Promise<void> {
  await pool.query(`DELETE FROM "session" WHERE sess::json->>'userId' = $1`, [userId]);
}

export const sessionRevoker: SessionRevoker = {
  revokeUserSessions,
};
