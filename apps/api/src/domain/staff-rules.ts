import type { Role } from "@smoothflow/shared";

export function canUnlinkStaff(role: Role): boolean {
  return role !== "dueno";
}

export function canRelinkStaff(role: Role): boolean {
  return role !== "dueno";
}

export function canDeleteStaff(role: Role): boolean {
  return role !== "dueno";
}

export function isRevokedStaff(user: { active: boolean; revokedAt: Date | string | null }): boolean {
  return !user.active && user.revokedAt != null;
}
