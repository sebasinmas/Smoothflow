import { z } from "zod";
import { ROLES } from "../types/roles.js";

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export const patientRegisterSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  givenName: z.string().min(1, "Nombre requerido"),
  familyName: z.string().min(1, "Apellido requerido"),
  phone: z.string().min(8, "Teléfono inválido").optional(),
  identifier: z.string().min(8, "RUT inválido").optional(),
});

export const sessionUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(ROLES),
  clinicId: z.string().uuid().nullable(),
  givenName: z.string(),
  familyName: z.string(),
  active: z.boolean(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type PatientRegisterInput = z.infer<typeof patientRegisterSchema>;
export type SessionUser = z.infer<typeof sessionUserSchema>;
