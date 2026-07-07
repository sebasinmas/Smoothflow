import type { SessionUser } from "@smoothflow/shared";
import { ValidationError } from "../../domain/errors.js";

/**
 * Garantiza que el usuario autenticado tenga una clínica asignada y devuelve
 * su identificador. Reemplaza el uso de la aserción non-null `user.clinicId!`
 * en la capa de controladores.
 */
export function requireClinic(user: SessionUser): string {
  if (!user.clinicId) throw new ValidationError("Clínica no asignada");
  return user.clinicId;
}
