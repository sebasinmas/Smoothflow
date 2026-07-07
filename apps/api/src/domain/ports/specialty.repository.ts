import type { SpecialtyDto } from "@smoothflow/shared";

export interface SpecialtyChanges {
  name?: string;
  description?: string | null;
}

export interface SpecialtyRepository {
  listForClinic(clinicId: string): Promise<SpecialtyDto[]>;
  findForClinic(clinicId: string, specialtyId: string): Promise<SpecialtyDto | null>;
  create(clinicId: string, data: { name: string; description?: string | null }): Promise<SpecialtyDto>;
  update(clinicId: string, specialtyId: string, changes: SpecialtyChanges): Promise<SpecialtyDto>;
  delete(clinicId: string, specialtyId: string): Promise<void>;
}
