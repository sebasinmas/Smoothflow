import { eq } from "drizzle-orm";
import type { PractitionerDto } from "@smoothflow/shared";
import { db } from "../client.js";
import { practitioners, specialties } from "../schema.js";
import type { PractitionerRef } from "../../../domain/entities.js";
import type {
  PractitionerRepository,
  NewPractitioner,
} from "../../../domain/ports/practitioner.repository.js";

export const practitionerRepository: PractitionerRepository = {
  async findById(id: string): Promise<PractitionerRef | null> {
    const [row] = await db
      .select({ id: practitioners.id, clinicId: practitioners.clinicId })
      .from(practitioners)
      .where(eq(practitioners.id, id))
      .limit(1);
    return row ?? null;
  },

  async findByUserId(userId: string): Promise<PractitionerRef | null> {
    const [row] = await db
      .select({ id: practitioners.id, clinicId: practitioners.clinicId })
      .from(practitioners)
      .where(eq(practitioners.userId, userId))
      .limit(1);
    return row ?? null;
  },

  async listForClinic(clinicId: string): Promise<PractitionerDto[]> {
    const rows = await db
      .select({ practitioner: practitioners, specialtyName: specialties.name })
      .from(practitioners)
      .innerJoin(specialties, eq(practitioners.specialtyId, specialties.id))
      .where(eq(practitioners.clinicId, clinicId));
    return rows.map((r) => ({
      id: r.practitioner.id,
      clinicId: r.practitioner.clinicId,
      userId: r.practitioner.userId,
      specialtyId: r.practitioner.specialtyId,
      givenName: r.practitioner.givenName,
      familyName: r.practitioner.familyName,
      email: r.practitioner.email,
      specialtyName: r.specialtyName,
    }));
  },

  async existsForSpecialty(specialtyId: string): Promise<boolean> {
    const rows = await db
      .select({ id: practitioners.id })
      .from(practitioners)
      .where(eq(practitioners.specialtyId, specialtyId))
      .limit(1);
    return rows.length > 0;
  },

  async create(data: NewPractitioner): Promise<PractitionerDto> {
    const [created] = await db
      .insert(practitioners)
      .values({
        clinicId: data.clinicId,
        userId: data.userId ?? null,
        specialtyId: data.specialtyId,
        givenName: data.givenName,
        familyName: data.familyName,
        email: data.email ?? null,
      })
      .returning();
    const [spec] = await db
      .select()
      .from(specialties)
      .where(eq(specialties.id, data.specialtyId))
      .limit(1);
    return {
      id: created.id,
      clinicId: created.clinicId,
      userId: created.userId,
      specialtyId: created.specialtyId,
      givenName: created.givenName,
      familyName: created.familyName,
      email: created.email,
      specialtyName: spec?.name,
    };
  },

  async createForStaff(data: NewPractitioner): Promise<{ id: string }> {
    const [created] = await db
      .insert(practitioners)
      .values({
        clinicId: data.clinicId,
        userId: data.userId ?? null,
        specialtyId: data.specialtyId,
        givenName: data.givenName,
        familyName: data.familyName,
        email: data.email ?? null,
      })
      .returning();
    return { id: created.id };
  },
};
