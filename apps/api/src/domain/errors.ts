import type { SessionUser } from "@smoothflow/shared";

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function toSessionUser(row: {
  id: string;
  email: string;
  role: SessionUser["role"];
  clinicId: string | null;
  givenName: string;
  familyName: string;
  active: boolean;
}): SessionUser {
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
