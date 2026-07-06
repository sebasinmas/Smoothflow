import { describe, expect, it } from "vitest";
import {
  canUnlinkStaff,
  canRelinkStaff,
  canDeleteStaff,
  isRevokedStaff,
} from "./staff-rules.js";

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

describe("canRelinkStaff", () => {
  it("returns false for dueno", () => {
    expect(canRelinkStaff("dueno")).toBe(false);
  });

  it("returns true for other roles", () => {
    expect(canRelinkStaff("secretaria")).toBe(true);
    expect(canRelinkStaff("medico")).toBe(true);
  });
});

describe("canDeleteStaff", () => {
  it("returns false for dueno", () => {
    expect(canDeleteStaff("dueno")).toBe(false);
  });

  it("returns true for other roles", () => {
    expect(canDeleteStaff("secretaria")).toBe(true);
    expect(canDeleteStaff("medico")).toBe(true);
  });
});

describe("isRevokedStaff", () => {
  it("returns true when inactive and revokedAt is set", () => {
    expect(isRevokedStaff({ active: false, revokedAt: new Date() })).toBe(true);
    expect(isRevokedStaff({ active: false, revokedAt: "2026-01-01T00:00:00.000Z" })).toBe(true);
  });

  it("returns false when active", () => {
    expect(isRevokedStaff({ active: true, revokedAt: null })).toBe(false);
    expect(isRevokedStaff({ active: true, revokedAt: new Date() })).toBe(false);
  });

  it("returns false when inactive but not revoked", () => {
    expect(isRevokedStaff({ active: false, revokedAt: null })).toBe(false);
  });
});
