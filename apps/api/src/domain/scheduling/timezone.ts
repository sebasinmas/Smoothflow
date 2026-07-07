/**
 * Utilidades puras de zona horaria basadas en `Intl` (sin librerias externas).
 *
 * Las plantillas de horario se guardan como texto "HH:mm" interpretado en la
 * zona horaria de la clinica, pero el servidor puede correr en cualquier zona
 * (UTC en produccion). Estas funciones convierten esa hora de pared al instante
 * UTC real (manejando DST) para que los slots se serialicen correctamente.
 */

interface ZoneParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

function getZoneParts(date: Date, timeZone: string): ZoneParts {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const map: Record<string, number> = {};
  for (const part of dtf.formatToParts(date)) {
    if (part.type !== "literal") map[part.type] = Number(part.value);
  }
  return {
    year: map.year,
    month: map.month,
    day: map.day,
    hour: map.hour,
    minute: map.minute,
    second: map.second,
  };
}

/** Offset en ms de la zona respecto de UTC en el instante dado (incl. DST). */
function getZoneOffsetMs(date: Date, timeZone: string): number {
  const p = getZoneParts(date, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUtc - date.getTime();
}

/**
 * Convierte una hora de pared (year/month/day/hour/minute) en una zona horaria
 * al instante UTC correcto. Realiza una segunda pasada para corregir el offset
 * cuando el primer estimado cae al otro lado de un salto de horario de verano.
 */
export function zonedTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
): Date {
  const guessMs = Date.UTC(year, month - 1, day, hour, minute, 0, 0);
  const offset = getZoneOffsetMs(new Date(guessMs), timeZone);
  let utcMs = guessMs - offset;
  const offset2 = getZoneOffsetMs(new Date(utcMs), timeZone);
  if (offset2 !== offset) {
    utcMs = guessMs - offset2;
  }
  return new Date(utcMs);
}

/** Fecha calendario (year/month/day) de un instante visto en una zona horaria. */
export function calendarDateInZone(
  date: Date,
  timeZone: string,
): { year: number; month: number; day: number } {
  const p = getZoneParts(date, timeZone);
  return { year: p.year, month: p.month, day: p.day };
}

/**
 * Dia de la semana (0=domingo .. 6=sabado) de una fecha calendario, compatible
 * con `Date.getDay()` y `template.dayOfWeek`. Usa mediodia UTC para evitar
 * ambiguedades en bordes de DST.
 */
export function weekdayOfDate(year: number, month: number, day: number): number {
  return new Date(Date.UTC(year, month - 1, day, 12)).getUTCDay();
}
