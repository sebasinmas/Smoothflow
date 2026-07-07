import { describe, expect, it } from "vitest";
import { generateSlotsFromTemplate } from "./slot-generator.js";

const TZ = "America/Santiago";

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

// 2026-07-06 es lunes y cae en invierno chileno (America/Santiago = UTC-4).
// 2026-01-05 es lunes y cae en verano chileno (America/Santiago = UTC-3, DST).
// Construimos los instantes con offset explicito para no depender de la zona
// horaria de la maquina que corre los tests.

describe("generateSlotsFromTemplate (RF-01, RF-02)", () => {
  it("generates 30-minute slots for a Monday 09:00–17:00 in clinic tz", () => {
    const from = new Date("2026-07-06T00:00:00-04:00");
    const to = new Date("2026-07-06T23:59:00-04:00");

    const slots = generateSlotsFromTemplate(
      mondayTemplate,
      from,
      to,
      practitioner,
      [],
      TZ,
    );

    expect(slots.length).toBe(16);
    const first = new Date(slots[0]!.startAt);
    // 09:00 en Santiago (UTC-4 en julio) equivale a 13:00 UTC.
    expect(first.toISOString()).toBe("2026-07-06T13:00:00.000Z");
    expect(first.getUTCHours()).toBe(13);
    expect(slots[0]).toMatchObject({
      status: "disponible",
      practitionerId: "prac-1",
      specialtyName: "Medicina General",
    });
    expect(slots.every((s) => s.status === "disponible")).toBe(true);
  });

  it("uses the clinic timezone offset including DST (summer = UTC-3)", () => {
    const from = new Date("2026-01-05T00:00:00-03:00");
    const to = new Date("2026-01-05T23:59:00-03:00");

    const slots = generateSlotsFromTemplate(
      mondayTemplate,
      from,
      to,
      practitioner,
      [],
      TZ,
    );

    expect(slots.length).toBe(16);
    const first = new Date(slots[0]!.startAt);
    // 09:00 en Santiago (UTC-3 en enero por DST) equivale a 12:00 UTC.
    expect(first.toISOString()).toBe("2026-01-05T12:00:00.000Z");
    expect(first.getUTCHours()).toBe(12);
  });

  it("marks overlapping confirmado appointment as reservado", () => {
    const from = new Date("2026-07-06T00:00:00-04:00");
    const to = new Date("2026-07-06T23:59:00-04:00");

    const slots = generateSlotsFromTemplate(
      mondayTemplate,
      from,
      to,
      practitioner,
      [
        {
          id: "apt-1",
          status: "confirmado",
          startAt: new Date("2026-07-06T10:00:00-04:00"),
          endAt: new Date("2026-07-06T10:30:00-04:00"),
          patientName: "Juan Pérez",
        },
      ],
      TZ,
    );

    const tenAmSlot = slots.find(
      (s) => new Date(s.startAt).toISOString() === "2026-07-06T14:00:00.000Z",
    );

    expect(tenAmSlot).toBeDefined();
    expect(tenAmSlot?.status).toBe("reservado");
    expect(tenAmSlot?.appointmentId).toBe("apt-1");
    expect(tenAmSlot?.patientName).toBe("Juan Pérez");
  });

  it("marks bloqueado slot with blockReason from notes", () => {
    const from = new Date("2026-07-06T00:00:00-04:00");
    const to = new Date("2026-07-06T23:59:00-04:00");

    const slots = generateSlotsFromTemplate(
      mondayTemplate,
      from,
      to,
      practitioner,
      [
        {
          id: "block-1",
          status: "bloqueado",
          startAt: new Date("2026-07-06T14:00:00-04:00"),
          endAt: new Date("2026-07-06T15:00:00-04:00"),
          notes: "Reunión administrativa",
        },
      ],
      TZ,
    );

    const blockedSlots = slots.filter((s) => s.status === "bloqueado");
    expect(blockedSlots.length).toBeGreaterThan(0);
    expect(blockedSlots[0]?.blockReason).toBe("Reunión administrativa");
    expect(blockedSlots[0]?.appointmentId).toBe("block-1");
  });

  it("does not generate slots outside from/to range", () => {
    const from = new Date("2026-07-06T10:00:00-04:00");
    const to = new Date("2026-07-06T11:00:00-04:00");

    const slots = generateSlotsFromTemplate(mondayTemplate, from, to, practitioner, [], TZ);

    expect(slots.length).toBe(3);
    slots.forEach((s) => {
      expect(new Date(s.startAt).getTime()).toBeGreaterThanOrEqual(from.getTime());
      expect(new Date(s.startAt).getTime()).toBeLessThanOrEqual(to.getTime());
    });
  });

  it("does not generate slots on non-template weekdays", () => {
    // 2026-07-11 es sábado (dayOfWeek 6), la plantilla es para lunes.
    const from = new Date("2026-07-11T00:00:00-04:00");
    const to = new Date("2026-07-11T23:59:00-04:00");

    const slots = generateSlotsFromTemplate(mondayTemplate, from, to, practitioner, [], TZ);

    expect(slots).toHaveLength(0);
  });
});
