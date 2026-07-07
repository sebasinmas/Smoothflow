import { eq } from "drizzle-orm";
import type { LoginInput, PatientRegisterInput, SessionUser } from "@smoothflow/shared";
import { db } from "../infrastructure/db/client.js";
import { users, patients, clinics } from "../infrastructure/db/schema.js";
import { AppError } from "../domain/errors.js";
import { toSessionUser } from "../infrastructure/db/mappers/user-mapper.js";
import type { PasswordHasher } from "../domain/ports/password-hasher.port.js";
import type { FieldCrypto } from "../domain/ports/field-crypto.port.js";
import type { AuditLogger } from "../domain/ports/audit-logger.port.js";
import type { PatientUseCases } from "./patients.js";

export interface AuthUseCasesDeps {
  passwordHasher: PasswordHasher;
  fieldCrypto: FieldCrypto;
  auditLogger: AuditLogger;
  findPatientForPortalLink: PatientUseCases["findPatientForPortalLink"];
}

export function createAuthUseCases(deps: AuthUseCasesDeps) {
  const { passwordHasher, fieldCrypto, auditLogger, findPatientForPortalLink } = deps;

  async function loginUser(input: LoginInput, ip: string): Promise<SessionUser> {
    const [row] = await db.select().from(users).where(eq(users.email, input.email.toLowerCase())).limit(1);
    if (!row || !row.active || row.revokedAt) {
      throw new AppError("Credenciales inválidas", 401, "INVALID_CREDENTIALS");
    }
    const valid = await passwordHasher.verify(input.password, row.passwordHash);
    if (!valid) throw new AppError("Credenciales inválidas", 401, "INVALID_CREDENTIALS");

    await auditLogger.write({
      clinicId: row.clinicId,
      userId: row.id,
      action: "LOGIN",
      resource: "session",
      ipAddress: ip,
    });

    return toSessionUser(row);
  }

  async function registerPatient(
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

    const passwordHash = await passwordHasher.hash(input.password);
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
            (input.phone ? fieldCrypto.encrypt(input.phone) : null),
          identifierEncrypted:
            existingPatient.identifierEncrypted ??
            (input.identifier ? fieldCrypto.encrypt(input.identifier) : null),
        })
        .where(eq(patients.id, existingPatient.id));

      await auditLogger.write({
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
        phoneEncrypted: input.phone ? fieldCrypto.encrypt(input.phone) : null,
        identifierEncrypted: input.identifier ? fieldCrypto.encrypt(input.identifier) : null,
      });

      await auditLogger.write({
        clinicId: clinic.id,
        userId: user.id,
        action: "REGISTER",
        resource: "patient",
        ipAddress: ip,
      });
    }

    return toSessionUser(user);
  }

  async function getUserById(id: string): Promise<SessionUser | null> {
    const [row] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (!row || !row.active || row.revokedAt) return null;
    return toSessionUser(row);
  }

  return {
    loginUser,
    registerPatient,
    getUserById,
  };
}

export type AuthUseCases = ReturnType<typeof createAuthUseCases>;
