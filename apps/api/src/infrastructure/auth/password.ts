import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { users } from "../db/schema.js";
import { pool } from "../db/client.js";
import type { PasswordHasher } from "../../domain/ports/password-hasher.port.js";

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export const passwordHasher: PasswordHasher = {
  hash: hashPassword,
  verify: verifyPassword,
};

export async function revokeUserSessions(userId: string): Promise<void> {
  await pool.query(`DELETE FROM "session" WHERE sess::json->>'userId' = $1`, [userId]);
}

export async function unlinkUser(userId: string): Promise<void> {
  await db
    .update(users)
    .set({ active: false, revokedAt: new Date(), updatedAt: new Date() })
    .where(eq(users.id, userId));
  await revokeUserSessions(userId);
}
