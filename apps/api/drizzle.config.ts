import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

const rootEnv = resolve(import.meta.dirname, "../../.env");
if (existsSync(rootEnv)) config({ path: rootEnv });

export default defineConfig({
  schema: "./src/infrastructure/db/schema.ts",
  out: "./src/infrastructure/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgresql://smoothflow:changeme@localhost:5432/smoothflow",
  },
});
