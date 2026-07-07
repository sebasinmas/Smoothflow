/**
 * Reexporta la regla de dominio `requireClinic` para la capa de controladores.
 * La única implementación vive en `domain/access/require-clinic.ts`; este módulo
 * mantiene la ruta de import estable para los adaptadores HTTP y evita duplicar
 * la aserción non-null `user.clinicId!`.
 */
export { requireClinic } from "../../domain/access/require-clinic.js";
