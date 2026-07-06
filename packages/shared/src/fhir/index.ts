import type { PatientDto, PractitionerDto, AppointmentDto } from "../types/dtos.js";

export interface FhirIdentifier {
  system: string;
  value: string;
}

export interface FhirHumanName {
  family: string;
  given: string[];
}

export interface FhirPatient {
  resourceType: "Patient";
  id: string;
  identifier?: FhirIdentifier[];
  name: FhirHumanName[];
  telecom?: Array<{ system: string; value: string }>;
}

export interface FhirPractitioner {
  resourceType: "Practitioner";
  id: string;
  name: FhirHumanName[];
  telecom?: Array<{ system: string; value: string }>;
}

export interface FhirAppointment {
  resourceType: "Appointment";
  id: string;
  status: string;
  start: string;
  end: string;
  participant: Array<{
    actor: { reference: string };
    status: string;
  }>;
}

export function toFhirPatient(patient: PatientDto): FhirPatient {
  const resource: FhirPatient = {
    resourceType: "Patient",
    id: patient.id,
    name: [{ family: patient.familyName, given: [patient.givenName] }],
  };
  if (patient.identifier) {
    resource.identifier = [{ system: "https://www.registrocivil.cl/rut", value: patient.identifier }];
  }
  const telecom = [];
  if (patient.email) telecom.push({ system: "email", value: patient.email });
  if (patient.phone) telecom.push({ system: "phone", value: patient.phone });
  if (telecom.length > 0) resource.telecom = telecom;
  return resource;
}

export function toFhirPractitioner(practitioner: PractitionerDto): FhirPractitioner {
  const resource: FhirPractitioner = {
    resourceType: "Practitioner",
    id: practitioner.id,
    name: [{ family: practitioner.familyName, given: [practitioner.givenName] }],
  };
  if (practitioner.email) {
    resource.telecom = [{ system: "email", value: practitioner.email }];
  }
  return resource;
}

const APPOINTMENT_STATUS_FHIR: Record<AppointmentDto["status"], string> = {
  disponible: "proposed",
  reservado: "pending",
  confirmado: "booked",
  reagendado: "pending",
  cancelado: "cancelled",
  bloqueado: "cancelled",
  atendido: "fulfilled",
  no_asistio: "noshow",
  cancelacion_pendiente: "booked",
};

export function toFhirAppointment(appointment: AppointmentDto): FhirAppointment {
  const participants = [
    { actor: { reference: `Practitioner/${appointment.practitionerId}` }, status: "accepted" },
  ];
  if (appointment.patientId) {
    participants.push({
      actor: { reference: `Patient/${appointment.patientId}` },
      status: "accepted",
    });
  }
  return {
    resourceType: "Appointment",
    id: appointment.id,
    status: APPOINTMENT_STATUS_FHIR[appointment.status],
    start: appointment.startAt,
    end: appointment.endAt,
    participant: participants,
  };
}
