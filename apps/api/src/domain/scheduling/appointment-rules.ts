import type { AppointmentStatus } from "@smoothflow/shared";
import { timeRangesOverlap } from "./time-range.js";

export interface AppointmentTimeSlot {
  id: string;
  status: AppointmentStatus;
  startAt: Date;
  endAt: Date;
}

const BLOCK_RANGE_CONFLICT_STATUSES: ReadonlySet<AppointmentStatus> = new Set([
  "confirmado",
  "reservado",
  "reagendado",
]);

export function findBookingConflict(
  existing: AppointmentTimeSlot[],
  startAt: Date,
  endAt: Date,
  excludeId?: string,
): AppointmentTimeSlot | undefined {
  return existing.find(
    (slot) =>
      slot.id !== excludeId &&
      slot.status !== "cancelado" &&
      slot.status !== "disponible" &&
      timeRangesOverlap(slot.startAt, slot.endAt, startAt, endAt),
  );
}

export function hasAppointmentsBlockingRange(
  existing: AppointmentTimeSlot[],
  startAt: Date,
  endAt: Date,
): boolean {
  return existing.some(
    (slot) =>
      BLOCK_RANGE_CONFLICT_STATUSES.has(slot.status) &&
      timeRangesOverlap(slot.startAt, slot.endAt, startAt, endAt),
  );
}

export function resolveSlotStatusFromOverlap(
  overlap: Pick<AppointmentTimeSlot, "status"> | undefined,
): "disponible" | "reservado" | "bloqueado" {
  if (!overlap || overlap.status === "cancelado") return "disponible";
  return overlap.status === "bloqueado" ? "bloqueado" : "reservado";
}
