import type { SessionUser } from "@smoothflow/shared";
import { ValidationError } from "../errors.js";

/**
 * Regla de negocio: un usuario debe tener una clínica asignada para operar sobre
 * sus recursos. Garantiza la asignación y devuelve el identificador de la clínica.
 * Única fuente de verdad compartida por casos de uso y adaptadores HTTP.
 */
export function requireClinic(user: SessionUser): string {
  if (!user.clinicId) throw new ValidationError("Clínica no asignada");
  return user.clinicId;
}
