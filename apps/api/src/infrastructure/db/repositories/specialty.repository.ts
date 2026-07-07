import { eq, and } from "drizzle-orm";
import type { SpecialtyDto } from "@smoothflow/shared";
import { db } from "../client.js";
import { specialties } from "../schema.js";
import type {
  SpecialtyRepository,
  SpecialtyChanges,
} from "../../../domain/ports/specialty.repository.js";

type SpecialtyRow = typeof specialties.$inferSelect;

function toDto(row: SpecialtyRow): SpecialtyDto {
  return {
    id: row.id,
    clinicId: row.clinicId,
    name: row.name,
    description: row.description,
  };
}

export const specialtyRepository: SpecialtyRepository = {
  async listForClinic(clinicId: string): Promise<SpecialtyDto[]> {
    const rows = await db.select().from(specialties).where(eq(specialties.clinicId, clinicId));
    return rows.map(toDto);
  },

  async findForClinic(clinicId: string, specialtyId: string): Promise<SpecialtyDto | null> {
    const [row] = await db
      .select()
      .from(specialties)
      .where(and(eq(specialties.id, specialtyId), eq(specialties.clinicId, clinicId)));
    return row ? toDto(row) : null;
  },

  async create(clinicId, data): Promise<SpecialtyDto> {
    const [created] = await db
      .insert(specialties)
      .values({ clinicId, name: data.name, description: data.description ?? null })
      .returning();
    return toDto(created);
  },

  async update(clinicId, specialtyId, changes: SpecialtyChanges): Promise<SpecialtyDto> {
    const updates: Partial<{ name: string; description: string | null }> = {};
    if (changes.name !== undefined) updates.name = changes.name;
    if (changes.description !== undefined) updates.description = changes.description;

    const [updated] = await db
      .update(specialties)
      .set(updates)
      .where(and(eq(specialties.id, specialtyId), eq(specialties.clinicId, clinicId)))
      .returning();
    return toDto(updated);
  },

  async delete(clinicId, specialtyId): Promise<void> {
    await db
      .delete(specialties)
      .where(and(eq(specialties.id, specialtyId), eq(specialties.clinicId, clinicId)));
  },
};
