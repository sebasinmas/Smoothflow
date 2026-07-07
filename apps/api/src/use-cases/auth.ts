import type { LoginInput, PatientRegisterInput, SessionUser } from "@smoothflow/shared";
import { AuthError, ConflictError, UnavailableError } from "../domain/errors.js";
import { toSessionUser } from "../domain/mappers/session-user.js";
import type { PasswordHasher } from "../domain/ports/password-hasher.port.js";
import type { AuditLogger } from "../domain/ports/audit-logger.port.js";
import type { UserRepository } from "../domain/ports/user.repository.js";
import type { PatientRepository } from "../domain/ports/patient.repository.js";
import type { ClinicRepository } from "../domain/ports/clinic.repository.js";

export interface AuthUseCasesDeps {
  users: UserRepository;
  patients: PatientRepository;
  clinics: ClinicRepository;
  passwordHasher: PasswordHasher;
  auditLogger: AuditLogger;
}

export function createAuthUseCases(deps: AuthUseCasesDeps) {
  const { users, patients, clinics, passwordHasher, auditLogger } = deps;

  async function loginUser(input: LoginInput, ip: string): Promise<SessionUser> {
    const user = await users.findByEmail(input.email.toLowerCase());
    if (!user || !user.active || user.revokedAt) {
      throw new AuthError("Credenciales inválidas", "INVALID_CREDENTIALS");
    }
    const valid = await passwordHasher.verify(input.password, user.passwordHash);
    if (!valid) throw new AuthError("Credenciales inválidas", "INVALID_CREDENTIALS");

    await auditLogger.write({
      clinicId: user.clinicId,
      userId: user.id,
      action: "LOGIN",
      resource: "session",
      ipAddress: ip,
    });

    return toSessionUser(user);
  }

  async function registerPatient(
    input: PatientRegisterInput,
    ip: string,
  ): Promise<SessionUser> {
    const email = input.email.toLowerCase();
    const existingUser = await users.findByEmail(email);
    if (existingUser) throw new ConflictError("El email ya está registrado", "EMAIL_EXISTS");

    const clinic = await clinics.findFirst();
    if (!clinic) throw new UnavailableError("No hay clínicas configuradas");

    const existingPatient = await patients.findForPortalLink(clinic.id, email, input.identifier);
    if (existingPatient?.userId) {
      throw new ConflictError("Este paciente ya tiene cuenta de portal", "PORTAL_ACCOUNT_EXISTS");
    }

    const passwordHash = await passwordHasher.hash(input.password);
    const user = await users.create({
      email,
      passwordHash,
      role: "paciente",
      givenName: input.givenName,
      familyName: input.familyName,
      clinicId: clinic.id,
    });

    if (existingPatient) {
      await patients.linkPortalAccount(existingPatient.id, user.id, {
        email,
        phone: input.phone,
        identifier: input.identifier,
      });

      await auditLogger.write({
        clinicId: clinic.id,
        userId: user.id,
        action: "LINK",
        resource: "patient",
        resourceId: existingPatient.id,
        ipAddress: ip,
      });
    } else {
      await patients.create({
        clinicId: clinic.id,
        userId: user.id,
        givenName: input.givenName,
        familyName: input.familyName,
        email,
        phone: input.phone,
        identifier: input.identifier,
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
    const user = await users.findById(id);
    if (!user || !user.active || user.revokedAt) return null;
    return toSessionUser(user);
  }

  return {
    loginUser,
    registerPatient,
    getUserById,
  };
}

export type AuthUseCases = ReturnType<typeof createAuthUseCases>;
