import connectPgSimple from "connect-pg-simple";
import session from "express-session";
import { pool } from "../db/client.js";

const PgSession = connectPgSimple(session);

export const SESSION_SECRET = process.env.SESSION_SECRET ?? "dev-session-secret-change-me";

export const sessionStore = new PgSession({
  pool,
  tableName: "session",
  createTableIfMissing: true,
});
