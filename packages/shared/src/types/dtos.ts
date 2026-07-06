import type { Role } from "./roles.js";
import type { AppointmentStatus } from "./appointments.js";

export interface ClinicDto {
  id: string;
  name: string;
  timezone: string;
}

export interface UserDto {
  id: string;
  clinicId: string | null;
  email: string;
  role: Role;
  givenName: string;
  familyName: string;
  active: boolean;
  revokedAt: string | null;
  createdAt: string;
}

export interface PatientDto {
  id: string;
  clinicId: string;
  givenName: string;
  familyName: string;
  email: string | null;
  phone: string | null;
  identifier: string | null;
  hasPortalAccess: boolean;
  createdAt: string;
}

export interface SpecialtyDto {
  id: string;
  clinicId: string;
  name: string;
  description: string | null;
}

export interface PractitionerDto {
  id: string;
  clinicId: string;
  userId: string | null;
  specialtyId: string;
  givenName: string;
  familyName: string;
  email: string | null;
  specialtyName?: string;
}

export interface ScheduleTemplateDto {
  id: string;
  practitionerId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
}

export interface AppointmentDto {
  id: string;
  clinicId: string;
  patientId: string | null;
  practitionerId: string;
  status: AppointmentStatus;
  startAt: string;
  endAt: string;
  notes: string | null;
  createdByUserId: string | null;
  patientName?: string;
  practitionerName?: string;
  specialtyName?: string;
  requestReason?: string | null;
  reviewNote?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AvailabilitySlotDto {
  startAt: string;
  endAt: string;
  status: "disponible" | "reservado" | "bloqueado";
  appointmentId?: string;
  appointmentStatus?: AppointmentStatus;
  practitionerId: string;
  practitionerName: string;
  specialtyId: string;
  specialtyName: string;
  patientName?: string;
  blockReason?: string;
  requestReason?: string;
}

export interface OccupancyReportDto {
  weekStart: string;
  days: Array<{
    date: string;
    totalSlots: number;
    bookedSlots: number;
    occupancyRate: number;
  }>;
}

export interface AuditEntryDto {
  id: string;
  userId: string | null;
  action: string;
  resource: string;
  resourceId: string | null;
  ipAddress: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}
