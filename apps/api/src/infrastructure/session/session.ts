import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "../db/client.js";

const PgSession = connectPgSimple(session);

export function createSessionMiddleware() {
  const isProd = process.env.NODE_ENV === "production";
  return session({
    store: new PgSession({
      pool,
      tableName: "session",
      createTableIfMissing: true,
    }),
    name: "smoothflow.sid",
    secret: process.env.SESSION_SECRET ?? "dev-session-secret-change-me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  });
}

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}
