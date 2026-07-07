import type { AppointmentStatus, AppointmentDto, AvailabilityQuery } from "@smoothflow/shared";
import type { AppointmentEntity } from "../entities.js";
import type { AppointmentTimeSlot } from "../scheduling/appointment-rules.js";
import type {
  ScheduleTemplateSlot,
  BookedAppointmentSlot,
  PractitionerAvailabilityContext,
} from "../scheduling/slot-generator.js";

export interface AppointmentListFilters {
  clinicId?: string;
  practitionerId?: string;
  patientId?: string;
  from?: string;
  to?: string;
}

export interface NewAppointment {
  clinicId: string;
  patientId?: string | null;
  practitionerId: string;
  status: AppointmentStatus;
  startAt: Date;
  endAt: Date;
  notes?: string | null;
  createdByUserId?: string | null;
}

export interface AppointmentChanges {
  startAt?: Date;
  endAt?: Date;
  status?: AppointmentStatus;
  notes?: string | null;
  pendingReschedule?: { startAt: Date; endAt: Date } | null;
  requestedByUserId?: string | null;
  requestReason?: string | null;
  reviewedByUserId?: string | null;
  reviewNote?: string | null;
  reviewedAt?: Date | null;
}

export interface NewAppointmentEvent {
  appointmentId: string;
  userId?: string | null;
  previousStatus?: AppointmentStatus | null;
  newStatus: AppointmentStatus;
  metadata?: Record<string, unknown>;
}

export interface AvailabilityData {
  practitioners: PractitionerAvailabilityContext[];
  templates: Array<ScheduleTemplateSlot & { practitionerId: string }>;
  booked: Array<BookedAppointmentSlot & { practitionerId: string }>;
  timezone: string;
}

export interface AppointmentRepository {
  findById(id: string): Promise<AppointmentEntity | null>;
  findConflicting(
    clinicId: string,
    practitionerId: string,
    startAt: Date,
    endAt: Date,
  ): Promise<AppointmentTimeSlot[]>;
  findBlockingCandidates(
    clinicId: string,
    practitionerId: string,
    startAt: Date,
    endAt: Date,
  ): Promise<AppointmentTimeSlot[]>;
  list(filters: AppointmentListFilters): Promise<AppointmentDto[]>;
  create(data: NewAppointment): Promise<AppointmentEntity>;
  update(id: string, changes: AppointmentChanges): Promise<AppointmentEntity>;
  addEvent(event: NewAppointmentEvent): Promise<void>;
  findPreviousStatusOfLatestRequest(appointmentId: string): Promise<AppointmentStatus | null>;
  getAvailabilityData(clinicId: string, query: AvailabilityQuery): Promise<AvailabilityData>;
  listStatusesForDay(clinicId: string, dayStart: Date, dayEnd: Date): Promise<AppointmentStatus[]>;
}
