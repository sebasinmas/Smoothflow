export const APPOINTMENT_STATUSES = [
  "disponible",
  "reservado",
  "confirmado",
  "reagendado",
  "cancelado",
  "bloqueado",
  "atendido",
  "no_asistio",
  "cancelacion_pendiente",
] as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  disponible: "Disponible",
  reservado: "Reservado",
  confirmado: "Confirmado",
  reagendado: "Reagendado",
  cancelado: "Cancelado",
  bloqueado: "Bloqueado",
  atendido: "Atendido",
  no_asistio: "No asistió",
  cancelacion_pendiente: "Cancelación pendiente",
};

export const DOCTOR_ACTIONS = ["atendido", "no_asistio", "solicitar_cancelacion"] as const;
export type DoctorAction = (typeof DOCTOR_ACTIONS)[number];

export const SLOT_STATUSES = ["disponible", "reservado", "bloqueado"] as const;
export type SlotStatus = (typeof SLOT_STATUSES)[number];

export const SLOT_STATUS_LABELS: Record<SlotStatus, string> = {
  disponible: "Disponible",
  reservado: "Reservado",
  bloqueado: "Bloqueado",
};
