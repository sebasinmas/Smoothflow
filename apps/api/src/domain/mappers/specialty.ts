import type { SpecialtyDto } from "@smoothflow/shared";
import type { SpecialtyEntity } from "../entities.js";

export function specialtyToDto(specialty: SpecialtyEntity): SpecialtyDto {
  return {
    id: specialty.id,
    clinicId: specialty.clinicId,
    name: specialty.name,
    description: specialty.description,
  };
}
