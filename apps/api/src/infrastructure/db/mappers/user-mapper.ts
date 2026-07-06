import type { SessionUser } from "@smoothflow/shared";
import type { users } from "../schema.js";

type UserRow = typeof users.$inferSelect;

export function toSessionUser(row: UserRow): SessionUser {
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    clinicId: row.clinicId,
    givenName: row.givenName,
    familyName: row.familyName,
    active: row.active,
  };
}
