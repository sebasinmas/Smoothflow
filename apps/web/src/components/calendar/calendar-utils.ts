import type { SlotStatus } from "@smoothflow/shared";

export const ROW_HEIGHT = 48;
export const MINUTES_PER_ROW = 30;
export const DEFAULT_DAY_START = 8 * 60;
export const DEFAULT_DAY_END = 18 * 60;

export interface CalendarEventItem {
  id: string;
  startAt: string;
  endAt: string;
  status: SlotStatus;
  label: string;
  sublabel?: string;
}

export function minutesSinceMidnight(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

export function parseIsoMinutes(iso: string): number {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes();
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function computeTimeRange(events: CalendarEventItem[]): {
  dayStartMinutes: number;
  dayEndMinutes: number;
} {
  if (events.length === 0) {
    return { dayStartMinutes: DEFAULT_DAY_START, dayEndMinutes: DEFAULT_DAY_END };
  }

  let min = DEFAULT_DAY_START;
  let max = DEFAULT_DAY_END;

  for (const ev of events) {
    const start = parseIsoMinutes(ev.startAt);
    const end = parseIsoMinutes(ev.endAt);
    min = Math.min(min, start);
    max = Math.max(max, end);
  }

  const paddedStart = Math.floor(min / MINUTES_PER_ROW) * MINUTES_PER_ROW;
  const paddedEnd = Math.ceil(max / MINUTES_PER_ROW) * MINUTES_PER_ROW;

  return {
    dayStartMinutes: Math.max(0, paddedStart),
    dayEndMinutes: Math.min(24 * 60, paddedEnd),
  };
}

export function formatHourLabel(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const period = h >= 12 ? "p. m." : "a. m.";
  const hour12 = h % 12 || 12;
  return m === 0 ? `${hour12}:00 ${period}` : `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

export function formatEventTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-CL", { hour: "numeric", minute: "2-digit" });
}

export function eventTop(startAt: string, dayStartMinutes: number): number {
  const start = parseIsoMinutes(startAt);
  return ((start - dayStartMinutes) / MINUTES_PER_ROW) * ROW_HEIGHT;
}

export function eventHeight(startAt: string, endAt: string): number {
  const start = parseIsoMinutes(startAt);
  const end = parseIsoMinutes(endAt);
  const duration = Math.max(end - start, MINUTES_PER_ROW);
  return (duration / MINUTES_PER_ROW) * ROW_HEIGHT;
}
