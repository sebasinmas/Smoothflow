import { eq, and, sql, isNotNull } from "drizzle-orm";
import type { CreatePatientInput, SessionUser, PatientDto } from "@smoothflow/shared";
import { db } from "../infrastructure/db/client.js";
import { patients } from "../infrastructure/db/schema.js";
import { AppError } from "../domain/errors.js";
import type { FieldCrypto } from "../domain/ports/field-crypto.port.js";
import type { AuditLogger } from "../domain/ports/audit-logger.port.js";

export interface PatientUseCasesDeps {
  fieldCrypto: FieldCrypto;
  auditLogger: AuditLogger;
}

export function createPatientUseCases(deps: PatientUseCasesDeps) {
  const { fieldCrypto, auditLogger } = deps;

  function toPatientDto(row: typeof patients.$inferSelect): PatientDto {
    return {
      id: row.id,
      clinicId: row.clinicId,
      givenName: row.givenName,
      familyName: row.familyName,
      email: row.email,
      phone: row.phoneEncrypted ? fieldCrypto.decrypt(row.phoneEncrypted) : null,
      identifier: row.identifierEncrypted ? fieldCrypto.decrypt(row.identifierEncrypted) : null,
      hasPortalAccess: row.userId != null,
      createdAt: row.createdAt.toISOString(),
    };
  }

  async function findPatientByIdentifier(
    clinicId: string,
    identifier: string,
  ): Promise<typeof patients.$inferSelect | null> {
    const rows = await db
      .select()
      .from(patients)
      .where(and(eq(patients.clinicId, clinicId), isNotNull(patients.identifierEncrypted)));

    for (const row of rows) {
      if (row.identifierEncrypted && fieldCrypto.decrypt(row.identifierEncrypted) === identifier) {
        return row;
      }
    }
    return null;
  }

  async function findPatientForPortalLink(
    clinicId: string,
    email: string,
    identifier?: string,
  ): Promise<typeof patients.$inferSelect | null> {
    const [byEmail] = await db
      .select()
      .from(patients)
      .where(and(eq(patients.clinicId, clinicId), sql`lower(${patients.email}) = ${email}`))
      .limit(1);

    if (byEmail) return byEmail;
    if (identifier) return findPatientByIdentifier(clinicId, identifier);
    return null;
  }

  async function assertPatientUnique(
    clinicId: string,
    email?: string,
    identifier?: string,
  ): Promise<void> {
    const normalizedEmail = email?.toLowerCase();
    if (normalizedEmail) {
      const [existing] = await db
        .select()
        .from(patients)
        .where(and(eq(patients.clinicId, clinicId), sql`lower(${patients.email}) = ${normalizedEmail}`))
        .limit(1);
      if (existing) {
        throw new AppError("Ya existe un paciente con este email", 409, "PATIENT_EMAIL_EXISTS");
      }
    }

    if (identifier) {
      const existing = await findPatientByIdentifier(clinicId, identifier);
      if (existing) {
        throw new AppError("Ya existe un paciente con este RUT", 409, "PATIENT_IDENTIFIER_EXISTS");
      }
    }
  }

  async function listPatients(clinicId: string): Promise<PatientDto[]> {
    const rows = await db.select().from(patients).where(eq(patients.clinicId, clinicId));
    return rows.map(toPatientDto);
  }

  async function createPatient(
    user: SessionUser,
    input: CreatePatientInput,
    ip: string,
  ): Promise<PatientDto> {
    if (!user.clinicId) throw new AppError("Clínica no asignada", 400);

    await assertPatientUnique(user.clinicId, input.email, input.identifier);

    const [created] = await db
      .insert(patients)
      .values({
        clinicId: user.clinicId,
        givenName: input.givenName,
        familyName: input.familyName,
        email: input.email?.toLowerCase() ?? null,
        phoneEncrypted: input.phone ? fieldCrypto.encrypt(input.phone) : null,
        identifierEncrypted: input.identifier ? fieldCrypto.encrypt(input.identifier) : null,
      })
      .returning();

    await auditLogger.write({
      clinicId: user.clinicId,
      userId: user.id,
      action: "CREATE",
      resource: "patient",
      resourceId: created.id,
      ipAddress: ip,
    });

    return toPatientDto(created);
  }

  async function getPatient(id: string): Promise<PatientDto | null> {
    const [row] = await db.select().from(patients).where(eq(patients.id, id)).limit(1);
    return row ? toPatientDto(row) : null;
  }

  return {
    listPatients,
    createPatient,
    getPatient,
    findPatientForPortalLink,
  };
}

export type PatientUseCases = ReturnType<typeof createPatientUseCases>;
