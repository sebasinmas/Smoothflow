import type { CreatePatientInput, SessionUser, PatientDto } from "@smoothflow/shared";
import { ConflictError, ValidationError } from "../domain/errors.js";
import type { PatientEntity } from "../domain/entities.js";
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
    return patients.list(clinicId);
  }

  async function createPatient(
    user: SessionUser,
    input: CreatePatientInput,
    ip: string,
  ): Promise<PatientDto> {
    if (!user.clinicId) throw new ValidationError("Clínica no asignada");

    await assertPatientUnique(user.clinicId, input.email, input.identifier);

    const dto = await patients.create({
      clinicId: user.clinicId,
      givenName: input.givenName,
      familyName: input.familyName,
      email: input.email,
      phone: input.phone,
      identifier: input.identifier,
    });

    await auditLogger.write({
      clinicId: user.clinicId,
      userId: user.id,
      action: "CREATE",
      resource: "patient",
      resourceId: dto.id,
      ipAddress: ip,
    });

    return dto;
  }

  async function getPatient(id: string): Promise<PatientDto | null> {
    return patients.findDtoById(id);
  }

  return {
    listPatients,
    createPatient,
    getPatient,
    findPatientForPortalLink,
  };
}

export type PatientUseCases = ReturnType<typeof createPatientUseCases>;
