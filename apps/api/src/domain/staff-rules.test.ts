import { describe, expect, it } from "vitest";
import { canUnlinkStaff } from "./staff-rules.js";

describe("canUnlinkStaff", () => {
  it("returns false for dueno", () => {
    expect(canUnlinkStaff("dueno")).toBe(false);
  });

  it("returns true for other roles", () => {
    expect(canUnlinkStaff("secretaria")).toBe(true);
    expect(canUnlinkStaff("medico")).toBe(true);
    expect(canUnlinkStaff("paciente")).toBe(true);
  });
});
