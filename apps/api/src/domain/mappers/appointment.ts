import type { AppointmentDto } from "@smoothflow/shared";
import type { AppointmentEntity } from "../entities.js";

export function appointmentToDto(entity: AppointmentEntity): AppointmentDto {
  return {
    id: entity.id,
    clinicId: entity.clinicId,
    patientId: entity.patientId,
    practitionerId: entity.practitionerId,
    status: entity.status,
    startAt: entity.startAt.toISOString(),
    endAt: entity.endAt.toISOString(),
    notes: entity.notes,
    pendingReschedule: entity.pendingReschedule
      ? {
          startAt: entity.pendingReschedule.startAt.toISOString(),
          endAt: entity.pendingReschedule.endAt.toISOString(),
        }
      : null,
    createdByUserId: entity.createdByUserId,
    requestReason: entity.requestReason,
    reviewNote: entity.reviewNote,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}
