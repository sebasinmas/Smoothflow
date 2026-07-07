import { describe, expect, it } from "vitest";
import type { AppointmentStatus } from "@smoothflow/shared";
import { computeDayOccupancy } from "./occupancy.js";

describe("computeDayOccupancy", () => {
  it("handles an empty day", () => {
    const result = computeDayOccupancy([]);
    expect(result).toEqual({
      totalSlots: 20,
      bookedSlots: 0,
      occupancyRate: 0,
    });
  });

  it("counts booked appointments and ignores cancelled/available", () => {
    const statuses: AppointmentStatus[] = [
      "reservado",
      "confirmado",
      "atendido",
      "cancelado",
      "disponible",
    ];
    const result = computeDayOccupancy(statuses);
    // 3 booked, 0 blocked, +20 free => total 23
    expect(result.bookedSlots).toBe(3);
    expect(result.totalSlots).toBe(23);
    expect(result.occupancyRate).toBe(Math.round((3 / 23) * 100));
  });

  it("handles a day with only blocked slots", () => {
    const statuses: AppointmentStatus[] = ["bloqueado", "bloqueado"];
    const result = computeDayOccupancy(statuses);
    // 0 booked, 2 blocked, +20 free => total 22
    expect(result.bookedSlots).toBe(0);
    expect(result.totalSlots).toBe(22);
    expect(result.occupancyRate).toBe(0);
  });
});
