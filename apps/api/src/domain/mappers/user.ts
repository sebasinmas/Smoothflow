import type { UserDto } from "@smoothflow/shared";
import type { UserEntity } from "../entities.js";

export function userToDto(user: UserEntity): UserDto {
  return {
    id: user.id,
    clinicId: user.clinicId,
    email: user.email,
    role: user.role,
    givenName: user.givenName,
    familyName: user.familyName,
    active: user.active,
    revokedAt: user.revokedAt?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
  };
}
