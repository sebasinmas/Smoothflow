import { describe, expect, it } from "vitest";
import { isWithinRange, timeRangesOverlap } from "./time-range.js";

describe("timeRangesOverlap", () => {
  it("returns false for adjacent half-open ranges", () => {
    const aStart = new Date("2026-07-06T09:00:00");
    const aEnd = new Date("2026-07-06T10:00:00");
    const bStart = new Date("2026-07-06T10:00:00");
    const bEnd = new Date("2026-07-06T11:00:00");
    expect(timeRangesOverlap(aStart, aEnd, bStart, bEnd)).toBe(false);
  });

  it("returns true for partial overlap", () => {
    const aStart = new Date("2026-07-06T09:00:00");
    const aEnd = new Date("2026-07-06T10:30:00");
    const bStart = new Date("2026-07-06T10:00:00");
    const bEnd = new Date("2026-07-06T11:00:00");
    expect(timeRangesOverlap(aStart, aEnd, bStart, bEnd)).toBe(true);
  });

  it("returns true when one range fully contains the other", () => {
    const outerStart = new Date("2026-07-06T09:00:00");
    const outerEnd = new Date("2026-07-06T12:00:00");
    const innerStart = new Date("2026-07-06T10:00:00");
    const innerEnd = new Date("2026-07-06T11:00:00");
    expect(timeRangesOverlap(outerStart, outerEnd, innerStart, innerEnd)).toBe(true);
    expect(timeRangesOverlap(innerStart, innerEnd, outerStart, outerEnd)).toBe(true);
  });

  it("returns false for disjoint ranges", () => {
    const aStart = new Date("2026-07-06T08:00:00");
    const aEnd = new Date("2026-07-06T09:00:00");
    const bStart = new Date("2026-07-06T10:00:00");
    const bEnd = new Date("2026-07-06T11:00:00");
    expect(timeRangesOverlap(aStart, aEnd, bStart, bEnd)).toBe(false);
  });
});

describe("isWithinRange", () => {
  const rangeStart = new Date("2026-07-06T09:00:00");
  const rangeEnd = new Date("2026-07-06T17:00:00");

  it("includes boundary points", () => {
    expect(isWithinRange(rangeStart, rangeStart, rangeEnd)).toBe(true);
    expect(isWithinRange(rangeEnd, rangeStart, rangeEnd)).toBe(true);
  });

  it("excludes points outside the range", () => {
    expect(isWithinRange(new Date("2026-07-06T08:59:00"), rangeStart, rangeEnd)).toBe(false);
    expect(isWithinRange(new Date("2026-07-06T17:01:00"), rangeStart, rangeEnd)).toBe(false);
  });
});
