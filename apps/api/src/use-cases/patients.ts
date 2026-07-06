import { eq } from "drizzle-orm";
import type { CreatePatientInput, SessionUser, PatientDto } from "@smoothflow/shared";
import { db } from "../infrastructure/db/client.js";
import { patients } from "../infrastructure/db/schema.js";
import { AppError } from "../domain/errors.js";
import { encryptField, decryptField } from "../infrastructure/crypto/encryption.js";
import { writeAuditLog } from "../infrastructure/audit/audit-logger.js";

function toPatientDto(row: typeof patients.$inferSelect): PatientDto {
  return {
    id: row.id,
    clinicId: row.clinicId,
    givenName: row.givenName,
    familyName: row.familyName,
    email: row.email,
    phone: row.phoneEncrypted ? decryptField(row.phoneEncrypted) : null,
    identifier: row.identifierEncrypted ? decryptField(row.identifierEncrypted) : null,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listPatients(clinicId: string): Promise<PatientDto[]> {
  const rows = await db.select().from(patients).where(eq(patients.clinicId, clinicId));
  return rows.map(toPatientDto);
}

export async function createPatient(
  user: SessionUser,
  input: CreatePatientInput,
  ip: string,
): Promise<PatientDto> {
  if (!user.clinicId) throw new AppError("Clínica no asignada", 400);
  const [created] = await db
    .insert(patients)
    .values({
      clinicId: user.clinicId,
      givenName: input.givenName,
      familyName: input.familyName,
      email: input.email ?? null,
      phoneEncrypted: input.phone ? encryptField(input.phone) : null,
      identifierEncrypted: input.identifier ? encryptField(input.identifier) : null,
    })
    .returning();

  await writeAuditLog({
    clinicId: user.clinicId,
    userId: user.id,
    action: "CREATE",
    resource: "patient",
    resourceId: created.id,
    ipAddress: ip,
  });

  return toPatientDto(created);
}

export async function getPatient(id: string): Promise<PatientDto | null> {
  const [row] = await db.select().from(patients).where(eq(patients.id, id)).limit(1);
  return row ? toPatientDto(row) : null;
}
