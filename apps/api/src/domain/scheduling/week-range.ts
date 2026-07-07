/**
 * Lógica de calendario pura para reportes semanales: dado el inicio de la semana,
 * produce los 7 rangos diarios [00:00:00.000, 23:59:59.999] consecutivos.
 * Mantiene el cálculo temporal en `domain/scheduling/` en lugar del caso de uso.
 */
export interface DayRange {
  date: string;
  start: Date;
  end: Date;
}

/** Etiqueta ISO `YYYY-MM-DD` de una fecha. Helper temporal puro reutilizable. */
export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function buildWeekDayRanges(weekStart: Date): DayRange[] {
  const ranges: DayRange[] = [];
  for (let i = 0; i < 7; i++) {
    const start = new Date(weekStart);
    start.setDate(weekStart.getDate() + i);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setHours(23, 59, 59, 999);
    ranges.push({ date: toIsoDate(start), start, end });
  }
  return ranges;
}
