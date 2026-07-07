import type { PatientDto } from "@smoothflow/shared";
import type { PatientEntity } from "../entities.js";

export function patientToDto(patient: PatientEntity): PatientDto {
  return {
    id: patient.id,
    clinicId: patient.clinicId,
    givenName: patient.givenName,
    familyName: patient.familyName,
    email: patient.email,
    phone: patient.phone,
    identifier: patient.identifier,
    hasPortalAccess: patient.userId != null,
    createdAt: patient.createdAt.toISOString(),
  };
}
