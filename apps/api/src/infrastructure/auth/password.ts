import bcrypt from "bcryptjs";
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
