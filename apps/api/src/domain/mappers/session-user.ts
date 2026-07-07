import type { SessionUser } from "@smoothflow/shared";
import type { UserEntity } from "../entities.js";

export function toSessionUser(user: UserEntity): SessionUser {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    clinicId: user.clinicId,
    givenName: user.givenName,
    familyName: user.familyName,
    active: user.active,
  };
}
