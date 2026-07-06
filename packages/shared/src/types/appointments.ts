export const APPOINTMENT_STATUSES = [
  "disponible",
  "reservado",
  "confirmado",
  "reagendado",
  "cancelado",
  "bloqueado",
] as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export const SLOT_STATUSES = ["disponible", "reservado", "bloqueado"] as const;
export type SlotStatus = (typeof SLOT_STATUSES)[number];

export const SLOT_STATUS_LABELS: Record<SlotStatus, string> = {
  disponible: "Disponible",
  reservado: "Reservado",
  bloqueado: "Bloqueado",
};
