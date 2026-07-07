import path from "node:path";
import { fileURLToPath } from "node:url";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "./client.js";

export async function runMigrations(): Promise<void> {
  const migrationsFolder = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "migrations",
  );

  await migrate(db, { migrationsFolder });
  console.log("[migrate] Database migrations applied");
}
