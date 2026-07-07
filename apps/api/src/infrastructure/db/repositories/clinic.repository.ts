import { db } from "../client.js";
import { clinics } from "../schema.js";
import type { ClinicRepository } from "../../../domain/ports/clinic.repository.js";

export const clinicRepository: ClinicRepository = {
  async findFirst(): Promise<{ id: string } | null> {
    const [row] = await db.select({ id: clinics.id }).from(clinics).limit(1);
    return row ?? null;
  },
};
