import type { PractitionerDto } from "@smoothflow/shared";
import type { PractitionerRef } from "../entities.js";

export interface NewPractitioner {
  clinicId: string;
  userId?: string | null;
  specialtyId: string;
  givenName: string;
  familyName: string;
  email?: string | null;
}

export interface PractitionerRepository {
  findById(id: string): Promise<PractitionerRef | null>;
  findByUserId(userId: string): Promise<PractitionerRef | null>;
  listForClinic(clinicId: string): Promise<PractitionerDto[]>;
  existsForSpecialty(specialtyId: string): Promise<boolean>;
  create(data: NewPractitioner): Promise<PractitionerDto>;
  /** Crea un profesional para un usuario recien creado y devuelve su id. */
  createForStaff(data: NewPractitioner): Promise<{ id: string }>;
}
