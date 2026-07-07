import type { SpecialtyEntity } from "../entities.js";

export interface SpecialtyChanges {
  name?: string;
  description?: string | null;
}

export interface SpecialtyRepository {
  listForClinic(clinicId: string): Promise<SpecialtyEntity[]>;
  findForClinic(clinicId: string, specialtyId: string): Promise<SpecialtyEntity | null>;
  create(clinicId: string, data: { name: string; description?: string | null }): Promise<SpecialtyEntity>;
  update(clinicId: string, specialtyId: string, changes: SpecialtyChanges): Promise<SpecialtyEntity>;
  delete(clinicId: string, specialtyId: string): Promise<void>;
}
