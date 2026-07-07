import type { Role } from "@smoothflow/shared";

export const ROLE_HOME: Record<Role, string> = {
  secretaria: "/secretary/calendar",
  medico: "/doctor/calendar",
  dueno: "/owner/staff",
  paciente: "/patient/booking",
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
