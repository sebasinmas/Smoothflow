import "./load-env.js";
import http from "node:http";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import apiRouter from "./adapters/http/router.js";
import { createSessionMiddleware } from "./infrastructure/session/session.js";
import { errorHandler } from "./adapters/http/middleware/error-handler.js";
import { setupWebSocketServer } from "./adapters/ws/ws-server.js";
import { runMigrations } from "./infrastructure/db/migrate.js";
import { seedDatabase } from "./seed.js";
import { pool } from "./infrastructure/db/client.js";

const app = express();
const port = Number(process.env.API_PORT) || 3000;

app.set("trust proxy", 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(
  cors({
    origin: process.env.WEB_ORIGIN ?? "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(createSessionMiddleware());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", apiRouter);
app.use(errorHandler);

const server = http.createServer(app);
setupWebSocketServer(server);

async function start() {
  try {
    await pool.query("SELECT 1");
    await runMigrations();

    if (process.env.NODE_ENV !== "production") {
      await seedDatabase();
    }

    server.listen(port, () => {
      console.log(`[api] listening on http://localhost:${port}`);
    });
  } catch (err) {
    console.error("[api] Failed to start:", err);
    process.exit(1);
  }
}

start();
