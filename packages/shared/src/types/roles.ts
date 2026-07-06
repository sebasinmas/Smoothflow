export const ROLES = ["paciente", "secretaria", "medico", "dueno"] as const;
export type Role = (typeof ROLES)[number];

export const STAFF_ROLES = ["secretaria", "medico", "dueno"] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  paciente: "Paciente",
  secretaria: "Secretaria",
  medico: "Médico",
  dueno: "Dueño de la clínica",
};
