import type { AppointmentStatus } from "@smoothflow/shared";

// Slots libres asumidos por día ante ausencia de plantilla explícita.
const ASSUMED_FREE_SLOTS_PER_DAY = 20;

export interface DayOccupancy {
  totalSlots: number;
  bookedSlots: number;
  occupancyRate: number;
}

export function computeDayOccupancy(statuses: AppointmentStatus[]): DayOccupancy {
  const booked = statuses.filter(
    (s) => s !== "cancelado" && s !== "bloqueado" && s !== "disponible",
  ).length;
  const blocked = statuses.filter((s) => s === "bloqueado").length;
  const totalSlots = booked + blocked + ASSUMED_FREE_SLOTS_PER_DAY;
  return {
    totalSlots,
    bookedSlots: booked,
    occupancyRate: totalSlots > 0 ? Math.round((booked / totalSlots) * 100) : 0,
  };
}
