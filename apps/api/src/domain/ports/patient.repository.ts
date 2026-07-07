import type { PatientDto } from "@smoothflow/shared";
import type { PatientEntity } from "../entities.js";

export interface NewPatient {
  clinicId: string;
  userId?: string | null;
  givenName: string;
  familyName: string;
  email?: string | null;
  phone?: string | null;
  identifier?: string | null;
}

export interface PatientRepository {
  findById(id: string): Promise<PatientEntity | null>;
  findDtoById(id: string): Promise<PatientDto | null>;
  findByUserId(userId: string): Promise<PatientEntity | null>;
  findForPortalLink(
    clinicId: string,
    email: string,
    identifier?: string,
  ): Promise<PatientEntity | null>;
  existsByEmail(clinicId: string, email: string): Promise<boolean>;
  existsByIdentifier(clinicId: string, identifier: string): Promise<boolean>;
  list(clinicId: string): Promise<PatientDto[]>;
  create(data: NewPatient): Promise<PatientDto>;
  /** Vincula una cuenta de portal a un paciente existente preservando datos previos. */
  linkPortalAccount(
    patientId: string,
    userId: string,
    data: { email: string; phone?: string; identifier?: string },
  ): Promise<void>;
}
