import { describe, expect, it } from "vitest";
import { doctorActionSchema, reviewCancellationSchema } from "./appointments.js";

describe("doctorActionSchema", () => {
  it("accepts atendido and no_asistio without reason", () => {
    expect(doctorActionSchema.safeParse({ action: "atendido" }).success).toBe(true);
    expect(doctorActionSchema.safeParse({ action: "no_asistio" }).success).toBe(true);
  });

  it("requires reason of at least 10 characters for solicitar_cancelacion", () => {
    const short = doctorActionSchema.safeParse({
      action: "solicitar_cancelacion",
      reason: "corto",
    });
    expect(short.success).toBe(false);

    const valid = doctorActionSchema.safeParse({
      action: "solicitar_cancelacion",
      reason: "Paciente no puede asistir",
    });
    expect(valid.success).toBe(true);
  });
});

describe("reviewCancellationSchema", () => {
  it("requires note of at least 5 characters", () => {
    const short = reviewCancellationSchema.safeParse({
      decision: "aprobar",
      note: "ok",
    });
    expect(short.success).toBe(false);

    const valid = reviewCancellationSchema.safeParse({
      decision: "rechazar",
      note: "Motivo válido",
    });
    expect(valid.success).toBe(true);
  });
});
