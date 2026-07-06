import { z } from "zod";
import { APPOINTMENT_STATUSES } from "../types/appointments.js";

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
});

export const createBlockSchema = z.object({
  practitionerId: z.string().uuid(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  reason: z.string().max(200).optional(),
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
