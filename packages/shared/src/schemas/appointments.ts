import { z } from "zod";
import { APPOINTMENT_STATUSES, DOCTOR_ACTIONS } from "../types/appointments.js";

export const createAppointmentSchema = z.object({
  patientId: z.string().uuid().optional(),
  practitionerId: z.string().uuid(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  notes: z.string().max(500).optional(),
});

export const updateAppointmentSchema = z.object({
  startAt: z.string().datetime().optional(),
  endAt: z.string().datetime().optional(),
  status: z.enum(APPOINTMENT_STATUSES).optional(),
  notes: z.string().max(500).optional(),
  pendingReschedule: z.object({ startAt: z.string().datetime(), endAt: z.string().datetime() }).nullable().optional(),
});

export const createBlockSchema = z.object({
  practitionerId: z.string().uuid(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  reason: z.string().max(200).optional(),
});

export const doctorActionSchema = z
  .object({
    action: z.enum(DOCTOR_ACTIONS),
    reason: z.string().max(300).optional(),
  })
  .refine(
    (v) => v.action !== "solicitar_cancelacion" || (v.reason ?? "").trim().length >= 10,
    {
      message: "Debe indicar un motivo de al menos 10 caracteres",
      path: ["reason"],
    },
  );

export const reviewCancellationSchema = z.object({
  decision: z.enum(["aprobar", "rechazar"]),
  note: z.string().trim().min(5, "Debe indicar un motivo").max(300),
});

export const availabilityQuerySchema = z.object({
  practitionerId: z.string().uuid().optional(),
  specialtyId: z.string().uuid().optional(),
  from: z.string().datetime(),
  to: z.string().datetime(),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
export type CreateBlockInput = z.infer<typeof createBlockSchema>;
export type AvailabilityQuery = z.infer<typeof availabilityQuerySchema>;
export type DoctorActionInput = z.infer<typeof doctorActionSchema>;
export type ReviewCancellationInput = z.infer<typeof reviewCancellationSchema>;
