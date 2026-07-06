import { describe, expect, it } from "vitest";
import type { AppointmentStatus } from "@smoothflow/shared";
import {
  findBookingConflict,
  hasAppointmentsBlockingRange,
  resolveSlotStatusFromOverlap,
  type AppointmentTimeSlot,
} from "./appointment-rules.js";

function slot(
  id: string,
  status: AppointmentStatus,
  start: string,
  end: string,
): AppointmentTimeSlot {
  return {
    id,
    status,
    startAt: new Date(start),
    endAt: new Date(end),
  };
}

describe("findBookingConflict (RF-06)", () => {
  const existing = [
    slot("a1", "confirmado", "2026-07-07T10:00:00", "2026-07-07T10:30:00"),
    slot("a2", "cancelado", "2026-07-07T11:00:00", "2026-07-07T11:30:00"),
    slot("a3", "disponible", "2026-07-07T12:00:00", "2026-07-07T12:30:00"),
    slot("a4", "bloqueado", "2026-07-07T14:00:00", "2026-07-07T15:00:00"),
  ];

  it("detects conflict with confirmado, reservado and bloqueado", () => {
    const conflict = findBookingConflict(
      existing,
      new Date("2026-07-07T10:15:00"),
      new Date("2026-07-07T10:45:00"),
    );
    expect(conflict?.id).toBe("a1");

    const blockConflict = findBookingConflict(
      existing,
      new Date("2026-07-07T14:30:00"),
      new Date("2026-07-07T14:45:00"),
    );
    expect(blockConflict?.id).toBe("a4");
  });

  it("ignores cancelado and disponible", () => {
    const noConflict = findBookingConflict(
      existing,
      new Date("2026-07-07T11:00:00"),
      new Date("2026-07-07T11:30:00"),
    );
    expect(noConflict).toBeUndefined();

    const disponibleConflict = findBookingConflict(
      existing,
      new Date("2026-07-07T12:00:00"),
      new Date("2026-07-07T12:30:00"),
    );
    expect(disponibleConflict).toBeUndefined();
  });

  it("respects excludeId when updating an appointment", () => {
    const conflict = findBookingConflict(
      existing,
      new Date("2026-07-07T10:00:00"),
      new Date("2026-07-07T10:30:00"),
      "a1",
    );
    expect(conflict).toBeUndefined();
  });

  it("does not flag adjacent non-overlapping ranges", () => {
    const conflict = findBookingConflict(
      [slot("a1", "confirmado", "2026-07-07T10:00:00", "2026-07-07T10:30:00")],
      new Date("2026-07-07T10:30:00"),
      new Date("2026-07-07T11:00:00"),
    );
    expect(conflict).toBeUndefined();
  });
});

describe("hasAppointmentsBlockingRange (RF-09)", () => {
  const existing = [
    slot("a1", "confirmado", "2026-07-07T10:00:00", "2026-07-07T10:30:00"),
    slot("a2", "reagendado", "2026-07-07T11:00:00", "2026-07-07T11:30:00"),
    slot("a3", "cancelado", "2026-07-07T12:00:00", "2026-07-07T12:30:00"),
    slot("a4", "bloqueado", "2026-07-07T13:00:00", "2026-07-07T14:00:00"),
    slot("a5", "atendido", "2026-07-07T15:00:00", "2026-07-07T15:30:00"),
  ];

  it("blocks range when confirmado, reservado or reagendado overlap", () => {
    expect(
      hasAppointmentsBlockingRange(
        existing,
        new Date("2026-07-07T10:15:00"),
        new Date("2026-07-07T10:45:00"),
      ),
    ).toBe(true);

    expect(
      hasAppointmentsBlockingRange(
        [...existing, slot("a6", "reservado", "2026-07-07T16:00:00", "2026-07-07T16:30:00")],
        new Date("2026-07-07T16:00:00"),
        new Date("2026-07-07T16:30:00"),
      ),
    ).toBe(true);

    expect(
      hasAppointmentsBlockingRange(
        existing,
        new Date("2026-07-07T11:00:00"),
        new Date("2026-07-07T11:30:00"),
      ),
    ).toBe(true);
  });

  it("does not block for cancelado, bloqueado or atendido", () => {
    expect(
      hasAppointmentsBlockingRange(
        existing,
        new Date("2026-07-07T12:00:00"),
        new Date("2026-07-07T12:30:00"),
      ),
    ).toBe(false);

    expect(
      hasAppointmentsBlockingRange(
        existing,
        new Date("2026-07-07T13:30:00"),
        new Date("2026-07-07T13:45:00"),
      ),
    ).toBe(false);

    expect(
      hasAppointmentsBlockingRange(
        existing,
        new Date("2026-07-07T15:00:00"),
        new Date("2026-07-07T15:30:00"),
      ),
    ).toBe(false);
  });
});

describe("resolveSlotStatusFromOverlap", () => {
  it("maps bloqueado to bloqueado", () => {
    expect(resolveSlotStatusFromOverlap({ status: "bloqueado" })).toBe("bloqueado");
  });

  it("maps active appointments to reservado", () => {
    expect(resolveSlotStatusFromOverlap({ status: "confirmado" })).toBe("reservado");
    expect(resolveSlotStatusFromOverlap({ status: "reservado" })).toBe("reservado");
  });

  it("returns disponible when no overlap or cancelado", () => {
    expect(resolveSlotStatusFromOverlap(undefined)).toBe("disponible");
    expect(resolveSlotStatusFromOverlap({ status: "cancelado" })).toBe("disponible");
  });
});
