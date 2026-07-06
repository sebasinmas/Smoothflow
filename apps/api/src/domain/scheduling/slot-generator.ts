import type { AppointmentStatus, AvailabilitySlotDto } from "@smoothflow/shared";
import { resolveSlotStatusFromOverlap } from "./appointment-rules.js";
import { timeRangesOverlap } from "./time-range.js";

export interface ScheduleTemplateSlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
}

export interface BookedAppointmentSlot {
  id: string;
  status: AppointmentStatus;
  startAt: Date;
  endAt: Date;
  notes?: string | null;
  patientName?: string;
  requestReason?: string | null;
}

export interface PractitionerAvailabilityContext {
  id: string;
  specialtyId: string;
  givenName: string;
  familyName: string;
  specialtyName: string;
}

export function generateSlotsFromTemplate(
  template: ScheduleTemplateSlot,
  from: Date,
  to: Date,
  practitioner: PractitionerAvailabilityContext,
  booked: BookedAppointmentSlot[],
): AvailabilitySlotDto[] {
  const slots: AvailabilitySlotDto[] = [];
  const cursor = new Date(from);

  while (cursor <= to) {
    if (cursor.getDay() === template.dayOfWeek) {
      const [sh, sm] = template.startTime.split(":").map(Number);
      const [eh, em] = template.endTime.split(":").map(Number);
      let slotStart = new Date(cursor);
      slotStart.setHours(sh, sm, 0, 0);
      const dayEnd = new Date(cursor);
      dayEnd.setHours(eh, em, 0, 0);

      while (slotStart < dayEnd) {
        const slotEnd = new Date(slotStart.getTime() + template.slotDurationMinutes * 60_000);
        if (slotEnd <= dayEnd && slotStart >= from && slotStart <= to) {
          const overlap = booked.find(
            (b) =>
              b.status !== "cancelado" &&
              timeRangesOverlap(b.startAt, b.endAt, slotStart, slotEnd),
          );
          const status = resolveSlotStatusFromOverlap(overlap);
          slots.push({
            startAt: slotStart.toISOString(),
            endAt: slotEnd.toISOString(),
            status,
            appointmentId: overlap?.id,
            appointmentStatus: overlap?.status,
            practitionerId: practitioner.id,
            practitionerName: `${practitioner.givenName} ${practitioner.familyName}`,
            specialtyId: practitioner.specialtyId,
            specialtyName: practitioner.specialtyName,
            patientName: overlap?.patientName,
            blockReason:
              overlap?.status === "bloqueado" ? (overlap.notes ?? undefined) : undefined,
            requestReason: overlap?.requestReason ?? undefined,
          });
        }
        slotStart = slotEnd;
      }
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return slots;
}
