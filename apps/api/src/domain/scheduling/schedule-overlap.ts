import { timeRangesOverlap } from "./time-range.js";

export interface ScheduleTimeRange {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function toDateRange(dayOfWeek: number, startTime: string, endTime: string): { start: Date; end: Date } {
  const start = new Date(2024, 0, 7 + dayOfWeek);
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  start.setHours(sh, sm, 0, 0);
  const end = new Date(start);
  end.setHours(eh, em, 0, 0);
  return { start, end };
}

export function scheduleRangesOverlap(a: ScheduleTimeRange, b: ScheduleTimeRange): boolean {
  if (a.dayOfWeek !== b.dayOfWeek) return false;
  const aRange = toDateRange(a.dayOfWeek, a.startTime, a.endTime);
  const bRange = toDateRange(b.dayOfWeek, b.startTime, b.endTime);
  return timeRangesOverlap(aRange.start, aRange.end, bRange.start, bRange.end);
}

export function isValidScheduleRange(startTime: string, endTime: string): boolean {
  return timeToMinutes(startTime) < timeToMinutes(endTime);
}

export function findOverlappingSchedule(
  candidate: ScheduleTimeRange,
  existing: ScheduleTimeRange[],
  excludeId?: string,
  existingIds?: string[],
): ScheduleTimeRange | undefined {
  for (let i = 0; i < existing.length; i++) {
    if (excludeId && existingIds?.[i] === excludeId) continue;
    if (scheduleRangesOverlap(candidate, existing[i])) {
      return existing[i];
    }
  }
  return undefined;
}
