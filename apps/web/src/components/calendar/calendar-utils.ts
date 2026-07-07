import type {
  AppointmentDto,
  AppointmentStatus,
  AvailabilitySlotDto,
  SlotStatus,
} from "@smoothflow/shared";

export const ROW_HEIGHT = 48;
export const MINUTES_PER_ROW = 30;
const DEFAULT_DAY_START = 8 * 60;
const DEFAULT_DAY_END = 18 * 60;

export interface CalendarEventItem {
  id: string;
  startAt: string;
  endAt: string;
  status: SlotStatus;
  appointmentStatus?: AppointmentStatus;
  label: string;
  sublabel?: string;
  appointmentId?: string;
  patientId?: string;
  practitionerId?: string;
  practitionerName?: string;
  patientName?: string;
  specialtyName?: string;
  requestReason?: string;
}

export interface EventLayout {
  columnIndex: number;
  columnCount: number;
}

export function minutesSinceMidnight(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

function parseIsoMinutes(iso: string): number {
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
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function eventDayKey(iso: string): string {
  return dayKey(new Date(iso));
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

const calendarTimeFormatter = new Intl.DateTimeFormat("es-CL", {
  hour: "numeric",
  minute: "2-digit",
});

export function formatCalendarTime(input: string | Date): string {
  const date = typeof input === "string" ? new Date(input) : input;
  return calendarTimeFormatter.format(date);
}

export function formatHourLabel(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const date = new Date();
  date.setHours(h, m, 0, 0);
  return formatCalendarTime(date);
}

export function formatEventTime(iso: string): string {
  return formatCalendarTime(iso);
}

export function practitionerInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function minutesToTop(
  minutes: number,
  dayStartMinutes: number,
  rowHeight: number = ROW_HEIGHT,
): number {
  return ((minutes - dayStartMinutes) / MINUTES_PER_ROW) * rowHeight;
}

export function eventTop(
  startAt: string,
  dayStartMinutes: number,
  rowHeight: number = ROW_HEIGHT,
): number {
  return minutesToTop(parseIsoMinutes(startAt), dayStartMinutes, rowHeight);
}

export function eventHeight(
  startAt: string,
  endAt: string,
  rowHeight: number = ROW_HEIGHT,
): number {
  const start = parseIsoMinutes(startAt);
  const end = parseIsoMinutes(endAt);
  const duration = Math.max(end - start, MINUTES_PER_ROW);
  return (duration / MINUTES_PER_ROW) * rowHeight;
}

function formatDoctorSublabel(practitionerName: string, specialtyName?: string): string {
  const doctor = practitionerName.startsWith("Dr.")
    ? practitionerName
    : `Dr. ${practitionerName}`;
  return specialtyName ? `${doctor} · ${specialtyName}` : doctor;
}

function eventsOverlap(a: CalendarEventItem, b: CalendarEventItem): boolean {
  const aStart = parseIsoMinutes(a.startAt);
  const aEnd = parseIsoMinutes(a.endAt);
  const bStart = parseIsoMinutes(b.startAt);
  const bEnd = parseIsoMinutes(b.endAt);
  return aStart < bEnd && bStart < aEnd;
}

export function computeDayEventLayouts(events: CalendarEventItem[]): Map<string, EventLayout> {
  const sorted = [...events].sort((a, b) => a.startAt.localeCompare(b.startAt));
  const layouts = new Map<string, EventLayout>();

  const clusters: CalendarEventItem[][] = [];
  let currentCluster: CalendarEventItem[] = [];

  for (const event of sorted) {
    if (currentCluster.length === 0) {
      currentCluster.push(event);
      continue;
    }
    const overlapsCluster = currentCluster.some((e) => eventsOverlap(e, event));
    if (overlapsCluster) {
      currentCluster.push(event);
    } else {
      clusters.push(currentCluster);
      currentCluster = [event];
    }
  }
  if (currentCluster.length) clusters.push(currentCluster);

  for (const cluster of clusters) {
    const columns: CalendarEventItem[][] = [];

    for (const event of cluster) {
      let columnIndex = 0;
      while (true) {
        if (!columns[columnIndex]) columns[columnIndex] = [];
        const hasOverlap = columns[columnIndex].some((e) => eventsOverlap(e, event));
        if (!hasOverlap) {
          columns[columnIndex].push(event);
          break;
        }
        columnIndex++;
      }
    }

    const columnCount = columns.length;
    columns.forEach((col, columnIndex) => {
      for (const event of col) {
        layouts.set(event.id, { columnIndex, columnCount });
      }
    });
  }

  return layouts;
}

function slotsToEvents(slots: AvailabilitySlotDto[]): CalendarEventItem[] {
  return slots.map((slot) => {
    const practitionerName = slot.practitionerName;
    const specialtyName = slot.specialtyName;

    if (slot.status === "reservado") {
      return {
        id: slot.appointmentId ?? `${slot.startAt}-${slot.practitionerId}`,
        startAt: slot.startAt,
        endAt: slot.endAt,
        status: slot.status,
        appointmentStatus: slot.appointmentStatus,
        label: slot.patientName ?? "Sin paciente",
        sublabel: formatDoctorSublabel(practitionerName, specialtyName),
        appointmentId: slot.appointmentId,
        practitionerId: slot.practitionerId,
        practitionerName,
        patientName: slot.patientName,
        specialtyName,
        requestReason: slot.requestReason,
      };
    }

    if (slot.status === "bloqueado") {
      return {
        id: slot.appointmentId ?? `${slot.startAt}-${slot.practitionerId}`,
        startAt: slot.startAt,
        endAt: slot.endAt,
        status: slot.status,
        label: practitionerName,
        sublabel: slot.blockReason,
        appointmentId: slot.appointmentId,
        practitionerId: slot.practitionerId,
        practitionerName,
        specialtyName,
      };
    }

    return {
      id: `${slot.startAt}-${slot.practitionerId}`,
      startAt: slot.startAt,
      endAt: slot.endAt,
      status: slot.status,
      label: practitionerName,
      sublabel: "Disponible",
      practitionerId: slot.practitionerId,
      practitionerName,
      specialtyName,
    };
  });
}

function appointmentsToEvents(appointments: AppointmentDto[]): CalendarEventItem[] {
  return appointments.map((appt) => {
    const practitionerName = appt.practitionerName ?? "Médico";
    const isBlocked = appt.status === "bloqueado";

    return {
      id: appt.id,
      startAt: appt.startAt,
      endAt: appt.endAt,
      status: isBlocked ? "bloqueado" : "reservado",
      appointmentStatus: appt.status,
      label: isBlocked ? practitionerName : (appt.patientName ?? practitionerName ?? "Cita"),
      sublabel: isBlocked
        ? (appt.notes ?? undefined)
        : formatDoctorSublabel(practitionerName, appt.specialtyName),
      appointmentId: appt.id,
      patientId: appt.patientId ?? undefined,
      practitionerId: appt.practitionerId,
      practitionerName,
      patientName: appt.patientName,
      specialtyName: appt.specialtyName,
      requestReason: appt.requestReason ?? undefined,
    };
  });
}

export function mergeCalendarEvents(
  slots: AvailabilitySlotDto[],
  appointments: AppointmentDto[],
): CalendarEventItem[] {
  const slotEvents = slotsToEvents(slots);
  if (slotEvents.length > 0) return slotEvents;

  const bookedIds = new Set<string>();
  for (const slot of slots) {
    if (slot.appointmentId) bookedIds.add(slot.appointmentId);
  }
  const orphanAppts = appointments.filter((a) => !bookedIds.has(a.id));
  return appointmentsToEvents(orphanAppts);
}

const TOOLTIP_STATUS_LABELS: Partial<Record<AppointmentStatus, string>> = {
  reservado: "Por confirmar",
  reagendado: "Reagendada",
  atendido: "Atendido",
  no_asistio: "No asistió",
  cancelacion_pendiente: "Cancelación pendiente de aprobación",
};

export function buildEventTooltip(event: CalendarEventItem): string {
  const time = formatEventTime(event.startAt);
  if (event.status === "reservado") {
    const parts = [time, event.patientName ?? event.label];
    if (event.practitionerName) parts.push(`Dr. ${event.practitionerName}`);
    if (event.specialtyName) parts.push(event.specialtyName);
    const statusLabel = event.appointmentStatus && TOOLTIP_STATUS_LABELS[event.appointmentStatus];
    if (statusLabel) parts.push(statusLabel);
    return parts.join(" · ");
  }
  if (event.status === "bloqueado") {
    return [time, event.practitionerName ?? event.label, event.sublabel].filter(Boolean).join(" · ");
  }
  return [time, event.label, event.sublabel].filter(Boolean).join(" · ");
}
