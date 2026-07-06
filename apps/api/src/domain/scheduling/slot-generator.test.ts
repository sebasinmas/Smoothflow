import { describe, expect, it } from "vitest";
import { generateSlotsFromTemplate } from "./slot-generator.js";

const practitioner = {
  id: "prac-1",
  specialtyId: "spec-1",
  givenName: "Ana",
  familyName: "López",
  specialtyName: "Medicina General",
};

const mondayTemplate = {
  dayOfWeek: 1,
  startTime: "09:00",
  endTime: "17:00",
  slotDurationMinutes: 30,
};

function localMonday(year: number, month: number, day: number, hour = 0, minute = 0): Date {
  const d = new Date(year, month - 1, day, hour, minute, 0, 0);
  if (d.getDay() !== 1) {
    throw new Error(`Expected Monday, got day ${d.getDay()} for ${year}-${month}-${day}`);
  }
  return d;
}

describe("generateSlotsFromTemplate (RF-01, RF-02)", () => {
  it("generates 30-minute slots for a Monday 09:00–17:00", () => {
    const weekStart = localMonday(2026, 7, 6);
    const weekEnd = localMonday(2026, 7, 6, 23, 59);

    const slots = generateSlotsFromTemplate(
      mondayTemplate,
      weekStart,
      weekEnd,
      practitioner,
      [],
    );

    expect(slots.length).toBe(16);
    const first = new Date(slots[0]!.startAt);
    expect(first.getHours()).toBe(9);
    expect(first.getMinutes()).toBe(0);
    expect(slots[0]).toMatchObject({
      status: "disponible",
      practitionerId: "prac-1",
      specialtyName: "Medicina General",
    });
    expect(slots.every((s) => s.status === "disponible")).toBe(true);
  });

  it("marks overlapping confirmado appointment as reservado", () => {
    const weekStart = localMonday(2026, 7, 6);
    const weekEnd = localMonday(2026, 7, 6, 23, 59);

    const slots = generateSlotsFromTemplate(
      mondayTemplate,
      weekStart,
      weekEnd,
      practitioner,
      [
        {
          id: "apt-1",
          status: "confirmado",
          startAt: localMonday(2026, 7, 6, 10, 0),
          endAt: localMonday(2026, 7, 6, 10, 30),
          patientName: "Juan Pérez",
        },
      ],
    );

    const tenAmSlot = slots.find((s) => {
      const d = new Date(s.startAt);
      return d.getHours() === 10 && d.getMinutes() === 0;
    });

    expect(tenAmSlot).toBeDefined();
    expect(tenAmSlot?.status).toBe("reservado");
    expect(tenAmSlot?.appointmentId).toBe("apt-1");
    expect(tenAmSlot?.patientName).toBe("Juan Pérez");
  });

  it("marks bloqueado slot with blockReason from notes", () => {
    const weekStart = localMonday(2026, 7, 6);
    const weekEnd = localMonday(2026, 7, 6, 23, 59);

    const slots = generateSlotsFromTemplate(
      mondayTemplate,
      weekStart,
      weekEnd,
      practitioner,
      [
        {
          id: "block-1",
          status: "bloqueado",
          startAt: localMonday(2026, 7, 6, 14, 0),
          endAt: localMonday(2026, 7, 6, 15, 0),
          notes: "Reunión administrativa",
        },
      ],
    );

    const blockedSlots = slots.filter((s) => s.status === "bloqueado");
    expect(blockedSlots.length).toBeGreaterThan(0);
    expect(blockedSlots[0]?.blockReason).toBe("Reunión administrativa");
    expect(blockedSlots[0]?.appointmentId).toBe("block-1");
  });

  it("does not generate slots outside from/to range", () => {
    const from = localMonday(2026, 7, 6, 10, 0);
    const to = localMonday(2026, 7, 6, 11, 0);

    const slots = generateSlotsFromTemplate(mondayTemplate, from, to, practitioner, []);

    expect(slots.length).toBe(3);
    slots.forEach((s) => {
      expect(new Date(s.startAt).getTime()).toBeGreaterThanOrEqual(from.getTime());
      expect(new Date(s.startAt).getTime()).toBeLessThanOrEqual(to.getTime());
    });
  });

  it("does not generate slots on non-template weekdays", () => {
    const saturday = new Date(2026, 6, 11, 0, 0, 0, 0);
    const saturdayEnd = new Date(2026, 6, 11, 23, 59, 59, 999);
    expect(saturday.getDay()).toBe(6);

    const slots = generateSlotsFromTemplate(
      mondayTemplate,
      saturday,
      saturdayEnd,
      practitioner,
      [],
    );

    expect(slots).toHaveLength(0);
  });
});
