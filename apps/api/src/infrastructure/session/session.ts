import session from "express-session";
import { SESSION_SECRET, sessionStore } from "./session-store.js";

export function createSessionMiddleware() {
  const isProd = process.env.NODE_ENV === "production";
  return session({
    store: sessionStore,
    name: "smoothflow.sid",
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProd ? "auto" : false,
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
