import type { AppointmentStatus, AvailabilitySlotDto } from "@smoothflow/shared";
import { resolveSlotStatusFromOverlap } from "./appointment-rules.js";
import { timeRangesOverlap } from "./time-range.js";
import { calendarDateInZone, weekdayOfDate, zonedTimeToUtc } from "./timezone.js";

const DAY_MS = 24 * 60 * 60 * 1000;

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
  timeZone: string,
): AvailabilitySlotDto[] {
  const slots: AvailabilitySlotDto[] = [];
  const [sh, sm] = template.startTime.split(":").map(Number);
  const [eh, em] = template.endTime.split(":").map(Number);

  // Iteramos por fecha calendario en la zona horaria de la clinica. El cursor
  // se ancla a mediodia UTC de cada fecha para avanzar dia a dia sin ambiguedad.
  const startDate = calendarDateInZone(from, timeZone);
  const endDate = calendarDateInZone(to, timeZone);
  let cursorMs = Date.UTC(startDate.year, startDate.month - 1, startDate.day, 12);
  const endMs = Date.UTC(endDate.year, endDate.month - 1, endDate.day, 12);

  while (cursorMs <= endMs) {
    const cursor = new Date(cursorMs);
    const year = cursor.getUTCFullYear();
    const month = cursor.getUTCMonth() + 1;
    const day = cursor.getUTCDate();

    if (weekdayOfDate(year, month, day) === template.dayOfWeek) {
      let slotStart = zonedTimeToUtc(year, month, day, sh, sm, timeZone);
      const dayEnd = zonedTimeToUtc(year, month, day, eh, em, timeZone);

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
    cursorMs += DAY_MS;
  }

  return slots;
}
