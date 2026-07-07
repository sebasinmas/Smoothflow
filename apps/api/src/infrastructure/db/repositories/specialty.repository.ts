import { eq, and } from "drizzle-orm";
import type { Database } from "../client.js";
import { specialties } from "../schema.js";
import type { SpecialtyEntity } from "../../../domain/entities.js";
import type {
  SpecialtyRepository,
  SpecialtyChanges,
} from "../../../domain/ports/specialty.repository.js";

type SpecialtyRow = typeof specialties.$inferSelect;

function toEntity(row: SpecialtyRow): SpecialtyEntity {
  return {
    id: row.id,
    clinicId: row.clinicId,
    name: row.name,
    description: row.description,
  };
}

export function createSpecialtyRepository(db: Database): SpecialtyRepository {
  return {
    async listForClinic(clinicId: string): Promise<SpecialtyEntity[]> {
      const rows = await db.select().from(specialties).where(eq(specialties.clinicId, clinicId));
      return rows.map(toEntity);
    },

    async findForClinic(clinicId: string, specialtyId: string): Promise<SpecialtyEntity | null> {
      const [row] = await db
        .select()
        .from(specialties)
        .where(and(eq(specialties.id, specialtyId), eq(specialties.clinicId, clinicId)));
      return row ? toEntity(row) : null;
    },

    async create(clinicId, data): Promise<SpecialtyEntity> {
      const [created] = await db
        .insert(specialties)
        .values({ clinicId, name: data.name, description: data.description ?? null })
        .returning();
      return toEntity(created);
    },

    async update(clinicId, specialtyId, changes: SpecialtyChanges): Promise<SpecialtyEntity> {
      const updates: Partial<{ name: string; description: string | null }> = {};
      if (changes.name !== undefined) updates.name = changes.name;
      if (changes.description !== undefined) updates.description = changes.description;

      const [updated] = await db
        .update(specialties)
        .set(updates)
        .where(and(eq(specialties.id, specialtyId), eq(specialties.clinicId, clinicId)))
        .returning();
      return toEntity(updated);
    },

    async delete(clinicId, specialtyId): Promise<void> {
      await db
        .delete(specialties)
        .where(and(eq(specialties.id, specialtyId), eq(specialties.clinicId, clinicId)));
    },
  };
}
