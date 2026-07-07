import type { CreatePatientInput, SessionUser, PatientDto } from "@smoothflow/shared";
import { ConflictError } from "../domain/errors.js";
import { requireClinic } from "../domain/access/require-clinic.js";
import type { PatientEntity } from "../domain/entities.js";
import { patientToDto } from "../domain/mappers/patient.js";
import type { AuditLogger } from "../domain/ports/audit-logger.port.js";
import type { PatientRepository } from "../domain/ports/patient.repository.js";

export interface PatientUseCasesDeps {
  patients: PatientRepository;
  auditLogger: AuditLogger;
}

export function createPatientUseCases(deps: PatientUseCasesDeps) {
  const { patients, auditLogger } = deps;

  async function assertPatientUnique(
    clinicId: string,
    email?: string,
    identifier?: string,
  ): Promise<void> {
    if (email && (await patients.existsByEmail(clinicId, email))) {
      throw new ConflictError("Ya existe un paciente con este email", "PATIENT_EMAIL_EXISTS");
    }
    if (identifier && (await patients.existsByIdentifier(clinicId, identifier))) {
      throw new ConflictError("Ya existe un paciente con este RUT", "PATIENT_IDENTIFIER_EXISTS");
    }
  }

  async function findPatientForPortalLink(
    clinicId: string,
    email: string,
    identifier?: string,
  ): Promise<PatientEntity | null> {
    return patients.findForPortalLink(clinicId, email, identifier);
  }

  async function listPatients(clinicId: string): Promise<PatientDto[]> {
    const items = await patients.list(clinicId);
    return items.map(patientToDto);
  }

  async function createPatient(
    user: SessionUser,
    input: CreatePatientInput,
    ip: string,
  ): Promise<PatientDto> {
    const clinicId = requireClinic(user);

    await assertPatientUnique(clinicId, input.email, input.identifier);

    const created = await patients.create({
      clinicId,
      givenName: input.givenName,
      familyName: input.familyName,
      email: input.email,
      phone: input.phone,
      identifier: input.identifier,
    });

    await auditLogger.write({
      clinicId,
      userId: user.id,
      action: "CREATE",
      resource: "patient",
      resourceId: created.id,
      ipAddress: ip,
    });

    return patientToDto(created);
  }

  async function getPatient(id: string): Promise<PatientDto | null> {
    const patient = await patients.findById(id);
    return patient ? patientToDto(patient) : null;
  }

  return {
    listPatients,
    createPatient,
    getPatient,
    findPatientForPortalLink,
  };
}

export type PatientUseCases = ReturnType<typeof createPatientUseCases>;
