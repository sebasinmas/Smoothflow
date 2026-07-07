import { eq, and, sql, isNotNull } from "drizzle-orm";
import { db } from "../client.js";
import { patients } from "../schema.js";
import type { PatientEntity } from "../../../domain/entities.js";
import type { FieldCrypto } from "../../../domain/ports/field-crypto.port.js";
import type {
  PatientRepository,
  NewPatient,
} from "../../../domain/ports/patient.repository.js";

type PatientRow = typeof patients.$inferSelect;

export function createPatientRepository(fieldCrypto: FieldCrypto): PatientRepository {
  function toEntity(row: PatientRow): PatientEntity {
    return {
      id: row.id,
      clinicId: row.clinicId,
      userId: row.userId,
      givenName: row.givenName,
      familyName: row.familyName,
      email: row.email,
      phone: row.phoneEncrypted ? fieldCrypto.decrypt(row.phoneEncrypted) : null,
      identifier: row.identifierEncrypted ? fieldCrypto.decrypt(row.identifierEncrypted) : null,
      createdAt: row.createdAt,
    };
  }

  async function findRowByIdentifier(
    clinicId: string,
    identifier: string,
  ): Promise<PatientRow | null> {
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

  return {
    async findById(id: string): Promise<PatientEntity | null> {
      const [row] = await db.select().from(patients).where(eq(patients.id, id)).limit(1);
      return row ? toEntity(row) : null;
    },

    async findByUserId(userId: string): Promise<PatientEntity | null> {
      const [row] = await db.select().from(patients).where(eq(patients.userId, userId)).limit(1);
      return row ? toEntity(row) : null;
    },

    async findForPortalLink(clinicId, email, identifier): Promise<PatientEntity | null> {
      const [byEmail] = await db
        .select()
        .from(patients)
        .where(and(eq(patients.clinicId, clinicId), sql`lower(${patients.email}) = ${email.toLowerCase()}`))
        .limit(1);

      if (byEmail) return toEntity(byEmail);
      if (identifier) {
        const row = await findRowByIdentifier(clinicId, identifier);
        return row ? toEntity(row) : null;
      }
      return null;
    },

    async existsByEmail(clinicId, email): Promise<boolean> {
      const [existing] = await db
        .select({ id: patients.id })
        .from(patients)
        .where(and(eq(patients.clinicId, clinicId), sql`lower(${patients.email}) = ${email.toLowerCase()}`))
        .limit(1);
      return Boolean(existing);
    },

    async existsByIdentifier(clinicId, identifier): Promise<boolean> {
      const row = await findRowByIdentifier(clinicId, identifier);
      return Boolean(row);
    },

    async list(clinicId: string): Promise<PatientEntity[]> {
      const rows = await db.select().from(patients).where(eq(patients.clinicId, clinicId));
      return rows.map(toEntity);
    },

    async create(data: NewPatient): Promise<PatientEntity> {
      const [created] = await db
        .insert(patients)
        .values({
          clinicId: data.clinicId,
          userId: data.userId ?? null,
          givenName: data.givenName,
          familyName: data.familyName,
          email: data.email?.toLowerCase() ?? null,
          phoneEncrypted: data.phone ? fieldCrypto.encrypt(data.phone) : null,
          identifierEncrypted: data.identifier ? fieldCrypto.encrypt(data.identifier) : null,
        })
        .returning();
      return toEntity(created);
    },

    async linkPortalAccount(patientId, userId, data): Promise<void> {
      const [existing] = await db
        .select()
        .from(patients)
        .where(eq(patients.id, patientId))
        .limit(1);
      if (!existing) return;

      await db
        .update(patients)
        .set({
          userId,
          email: existing.email ?? data.email,
          phoneEncrypted:
            existing.phoneEncrypted ?? (data.phone ? fieldCrypto.encrypt(data.phone) : null),
          identifierEncrypted:
            existing.identifierEncrypted ??
            (data.identifier ? fieldCrypto.encrypt(data.identifier) : null),
        })
        .where(eq(patients.id, patientId));
    },
  };
}
