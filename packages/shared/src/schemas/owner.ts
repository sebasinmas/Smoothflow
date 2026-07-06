import { z } from "zod";
import { STAFF_ROLES } from "../types/roles.js";

export const createPatientSchema = z.object({
  givenName: z.string().min(1),
  familyName: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().min(8).optional(),
  identifier: z.string().min(8).optional(),
});

export const createStaffSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(STAFF_ROLES),
  givenName: z.string().min(1),
  familyName: z.string().min(1),
  specialtyId: z.string().uuid().optional(),
});

export const updateStaffSchema = z.object({
  givenName: z.string().min(1).optional(),
  familyName: z.string().min(1).optional(),
  role: z.enum(STAFF_ROLES).optional(),
  active: z.boolean().optional(),
  specialtyId: z.string().uuid().nullable().optional(),
});

export const createSpecialtySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(300).optional(),
});

export const updateSpecialtySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(300).nullable().optional(),
});

export const createPractitionerSchema = z.object({
  userId: z.string().uuid().optional(),
  givenName: z.string().min(1),
  familyName: z.string().min(1),
  specialtyId: z.string().uuid(),
  email: z.string().email().optional(),
});

export const createScheduleTemplateSchema = z.object({
  practitionerId: z.string().uuid(),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  slotDurationMinutes: z.number().int().min(15).max(120).default(30),
});

export const updateScheduleTemplateSchema = z
  .object({
    dayOfWeek: z.number().int().min(0).max(6).optional(),
    startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    slotDurationMinutes: z.number().int().min(15).max(120).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debe indicar al menos un campo a actualizar",
  });

export type CreatePatientInput = z.infer<typeof createPatientSchema>;
export type CreateStaffInput = z.infer<typeof createStaffSchema>;
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;
export type CreateSpecialtyInput = z.infer<typeof createSpecialtySchema>;
export type UpdateSpecialtyInput = z.infer<typeof updateSpecialtySchema>;
export type CreatePractitionerInput = z.infer<typeof createPractitionerSchema>;
export type CreateScheduleTemplateInput = z.infer<typeof createScheduleTemplateSchema>;
export type UpdateScheduleTemplateInput = z.infer<typeof updateScheduleTemplateSchema>;
