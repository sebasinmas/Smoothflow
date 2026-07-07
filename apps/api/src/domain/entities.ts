import type { AppointmentStatus, Role } from "@smoothflow/shared";

/**
 * Entidades de dominio: representaciones planas e independientes de la
 * infraestructura de persistencia. Las fechas son objetos Date.
 */

export interface AppointmentEntity {
  id: string;
  clinicId: string;
  patientId: string | null;
  practitionerId: string;
  status: AppointmentStatus;
  startAt: Date;
  endAt: Date;
  notes: string | null;
  pendingReschedule: { startAt: Date; endAt: Date } | null;
  createdByUserId: string | null;
  requestedByUserId: string | null;
  requestReason: string | null;
  reviewedByUserId: string | null;
  reviewNote: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserEntity {
  id: string;
  clinicId: string | null;
  email: string;
  passwordHash: string;
  role: Role;
  givenName: string;
  familyName: string;
  active: boolean;
  revokedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PatientEntity {
  id: string;
  clinicId: string;
  userId: string | null;
  givenName: string;
  familyName: string;
  email: string | null;
  createdAt: Date;
}

export interface PractitionerRef {
  id: string;
  clinicId: string;
}
