import type { ReactNode } from "react";
import type { AppointmentDto, AvailabilitySlotDto } from "@smoothflow/shared";
import type { CalendarEventItem } from "@/components/calendar/calendar-utils";

export function slotsToEvents(slots: AvailabilitySlotDto[]): CalendarEventItem[] {
  return slots.map((slot) => ({
    id: slot.appointmentId ?? `${slot.startAt}-${slot.practitionerId}`,
    startAt: slot.startAt,
    endAt: slot.endAt,
    status: slot.status,
    label: slot.status === "disponible" ? slot.practitionerName : slot.practitionerName,
    sublabel:
      slot.status === "reservado"
        ? slot.specialtyName
        : slot.status === "disponible"
          ? "Disponible"
          : undefined,
    appointmentId: slot.appointmentId,
    practitionerId: slot.practitionerId,
  }));
}

export function appointmentsToEvents(appointments: AppointmentDto[]): CalendarEventItem[] {
  return appointments.map((appt) => ({
    id: appt.id,
    startAt: appt.startAt,
    endAt: appt.endAt,
    status: appt.status === "bloqueado" ? "bloqueado" : "reservado",
    label: appt.patientName ?? appt.practitionerName ?? "Cita",
    sublabel: appt.specialtyName,
    appointmentId: appt.id,
    patientId: appt.patientId ?? undefined,
    practitionerId: appt.practitionerId,
  }));
}

export function mergeCalendarEvents(
  slots: AvailabilitySlotDto[],
  appointments: AppointmentDto[],
): CalendarEventItem[] {
  const slotEvents = slotsToEvents(slots);
  if (slotEvents.length > 0) return slotEvents;

  const bookedIds = new Set(
    slots.filter((s) => s.appointmentId).map((s) => s.appointmentId),
  );
  const orphanAppts = appointments.filter((a) => !bookedIds.has(a.id));
  return appointmentsToEvents(orphanAppts);
}

interface SegmentedControlProps {
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}

export function SegmentedControl({ value, options, onChange }: SegmentedControlProps) {
  return (
    <div
      className="inline-flex rounded-lg border border-border bg-surface-muted p-0.5"
      role="group"
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          aria-pressed={value === opt.value}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
            value === opt.value
              ? "bg-white text-brand shadow-sm"
              : "text-text-muted hover:text-text"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

interface CalendarToolbarProps {
  children: ReactNode;
}

export function CalendarToolbar({ children }: CalendarToolbarProps) {
  return (
    <div className="mb-4 flex shrink-0 flex-wrap items-center gap-x-4 gap-y-3 rounded-xl border border-border bg-white p-3 shadow-card">
      {children}
    </div>
  );
}
