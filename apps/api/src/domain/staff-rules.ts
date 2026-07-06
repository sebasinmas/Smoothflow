import type { Role } from "@smoothflow/shared";

export function canUnlinkStaff(role: Role): boolean {
  return role !== "dueno";
}
