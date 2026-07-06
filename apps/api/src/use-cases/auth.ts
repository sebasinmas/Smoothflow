import { eq } from "drizzle-orm";
import type { LoginInput, PatientRegisterInput, SessionUser } from "@smoothflow/shared";
import { db } from "../infrastructure/db/client.js";
import { users, patients, clinics } from "../infrastructure/db/schema.js";
import { AppError } from "../domain/errors.js";
import { toSessionUser } from "../infrastructure/db/mappers/user-mapper.js";
import { hashPassword, verifyPassword } from "../infrastructure/auth/password.js";
import { encryptField } from "../infrastructure/crypto/encryption.js";
import { writeAuditLog } from "../infrastructure/audit/audit-logger.js";
import { findPatientForPortalLink } from "./patients.js";

export async function loginUser(input: LoginInput, ip: string): Promise<SessionUser> {
  const [row] = await db.select().from(users).where(eq(users.email, input.email.toLowerCase())).limit(1);
  if (!row || !row.active || row.revokedAt) {
    throw new AppError("Credenciales inválidas", 401, "INVALID_CREDENTIALS");
  }
  const valid = await verifyPassword(input.password, row.passwordHash);
  if (!valid) throw new AppError("Credenciales inválidas", 401, "INVALID_CREDENTIALS");

  await writeAuditLog({
    clinicId: row.clinicId,
    userId: row.id,
    action: "LOGIN",
    resource: "session",
    ipAddress: ip,
  });

  return toSessionUser(row);
}

export async function registerPatient(
  input: PatientRegisterInput,
  ip: string,
): Promise<SessionUser> {
  const email = input.email.toLowerCase();
  const [existingUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existingUser) throw new AppError("El email ya está registrado", 409, "EMAIL_EXISTS");

  const [clinic] = await db.select().from(clinics).limit(1);
  if (!clinic) throw new AppError("No hay clínicas configuradas", 503);

  const existingPatient = await findPatientForPortalLink(clinic.id, email, input.identifier);
  if (existingPatient?.userId) {
    throw new AppError("Este paciente ya tiene cuenta de portal", 409, "PORTAL_ACCOUNT_EXISTS");
  }

  const passwordHash = await hashPassword(input.password);
  const [user] = await db
    .insert(users)
    .values({
      email,
      passwordHash,
      role: "paciente",
      givenName: input.givenName,
      familyName: input.familyName,
      clinicId: clinic.id,
    })
    .returning();

  if (existingPatient) {
    await db
      .update(patients)
      .set({
        userId: user.id,
        email: existingPatient.email ?? email,
        phoneEncrypted:
          existingPatient.phoneEncrypted ??
          (input.phone ? encryptField(input.phone) : null),
        identifierEncrypted:
          existingPatient.identifierEncrypted ??
          (input.identifier ? encryptField(input.identifier) : null),
      })
      .where(eq(patients.id, existingPatient.id));

    await writeAuditLog({
      clinicId: clinic.id,
      userId: user.id,
      action: "LINK",
      resource: "patient",
      resourceId: existingPatient.id,
      ipAddress: ip,
    });
  } else {
    await db.insert(patients).values({
      clinicId: clinic.id,
      userId: user.id,
      givenName: input.givenName,
      familyName: input.familyName,
      email,
      phoneEncrypted: input.phone ? encryptField(input.phone) : null,
      identifierEncrypted: input.identifier ? encryptField(input.identifier) : null,
    });

    await writeAuditLog({
      clinicId: clinic.id,
      userId: user.id,
      action: "REGISTER",
      resource: "patient",
      ipAddress: ip,
    });
  }

  return toSessionUser(user);
}

export async function getUserById(id: string): Promise<SessionUser | null> {
  const [row] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!row || !row.active || row.revokedAt) return null;
  return toSessionUser(row);
}
