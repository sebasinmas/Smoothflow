import type { Role } from "@smoothflow/shared";

export const ROLE_HOME: Record<Role, string> = {
  secretaria: "/secretaria/calendario",
  medico: "/doctor/calendario",
  dueno: "/owner/staff",
  paciente: "/paciente/reservar",
};

export function formatPersonName(given: string, family: string): string {
  return `${given} ${family}`;
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("es-CL", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function startOfWeek(date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
