import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

const __dirname = import.meta.dirname || fileURLToPath(new URL('.', import.meta.url));
const rootEnv = resolve(__dirname, "../../.env");
if (existsSync(rootEnv)) config({ path: rootEnv });

export default defineConfig({
  schema: "./src/infrastructure/db/schema.ts",
  out: "./src/infrastructure/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgresql://smoothflow:changeme@localhost:5432/smoothflow",
  },
});
