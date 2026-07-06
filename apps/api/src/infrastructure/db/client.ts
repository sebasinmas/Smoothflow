import "../../load-env.js";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema.js";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "DATABASE_URL no está definida. Copia .env.example a .env en la raíz del monorepo.",
  );
}

const pool = new pg.Pool({ connectionString });

export const db = drizzle(pool, { schema });
export { pool };
