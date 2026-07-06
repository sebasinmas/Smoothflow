export interface DefaultScheduleTemplate {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
}

/** Lun–Vie 09:00–17:00, bloques de 30 min (alineado al seed demo). */
export const DEFAULT_WEEKDAY_SCHEDULE: DefaultScheduleTemplate[] = [
  { dayOfWeek: 1, startTime: "09:00", endTime: "17:00", slotDurationMinutes: 30 },
  { dayOfWeek: 2, startTime: "09:00", endTime: "17:00", slotDurationMinutes: 30 },
  { dayOfWeek: 3, startTime: "09:00", endTime: "17:00", slotDurationMinutes: 30 },
  { dayOfWeek: 4, startTime: "09:00", endTime: "17:00", slotDurationMinutes: 30 },
  { dayOfWeek: 5, startTime: "09:00", endTime: "17:00", slotDurationMinutes: 30 },
];

export function buildScheduleTemplateRows(
  practitionerId: string,
  templates: DefaultScheduleTemplate[] = DEFAULT_WEEKDAY_SCHEDULE,
) {
  return templates.map((t) => ({
    practitionerId,
    dayOfWeek: t.dayOfWeek,
    startTime: t.startTime,
    endTime: t.endTime,
    slotDurationMinutes: t.slotDurationMinutes,
  }));
}
