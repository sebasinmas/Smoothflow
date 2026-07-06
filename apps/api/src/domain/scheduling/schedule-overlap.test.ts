import { describe, expect, it } from "vitest";
import {
  findOverlappingSchedule,
  isValidScheduleRange,
  scheduleRangesOverlap,
  type ScheduleTimeRange,
} from "./schedule-overlap.js";

describe("isValidScheduleRange", () => {
  it("accepts start before end", () => {
    expect(isValidScheduleRange("09:00", "17:00")).toBe(true);
  });

  it("rejects inverted or equal times", () => {
    expect(isValidScheduleRange("17:00", "09:00")).toBe(false);
    expect(isValidScheduleRange("09:00", "09:00")).toBe(false);
  });
});

describe("scheduleRangesOverlap", () => {
  const morning: ScheduleTimeRange = { dayOfWeek: 1, startTime: "09:00", endTime: "12:00" };
  const afternoon: ScheduleTimeRange = { dayOfWeek: 1, startTime: "11:00", endTime: "17:00" };
  const otherDay: ScheduleTimeRange = { dayOfWeek: 2, startTime: "11:00", endTime: "17:00" };
  const nonOverlapping: ScheduleTimeRange = { dayOfWeek: 1, startTime: "12:00", endTime: "17:00" };

  it("detects overlap on the same weekday", () => {
    expect(scheduleRangesOverlap(morning, afternoon)).toBe(true);
  });

  it("returns false for non-overlapping ranges on the same day", () => {
    expect(scheduleRangesOverlap(morning, nonOverlapping)).toBe(false);
  });

  it("returns false for different weekdays even with same times", () => {
    expect(scheduleRangesOverlap(morning, otherDay)).toBe(false);
  });
});

describe("findOverlappingSchedule", () => {
  const existing: ScheduleTimeRange[] = [
    { dayOfWeek: 1, startTime: "09:00", endTime: "12:00" },
    { dayOfWeek: 1, startTime: "14:00", endTime: "17:00" },
  ];
  const ids = ["sched-1", "sched-2"];

  it("finds the first overlapping schedule", () => {
    const overlap = findOverlappingSchedule(
      { dayOfWeek: 1, startTime: "11:00", endTime: "13:00" },
      existing,
      undefined,
      ids,
    );
    expect(overlap).toEqual(existing[0]);
  });

  it("excludes schedule by excludeId", () => {
    const overlap = findOverlappingSchedule(
      { dayOfWeek: 1, startTime: "09:30", endTime: "10:30" },
      existing,
      "sched-1",
      ids,
    );
    expect(overlap).toBeUndefined();
  });
});
