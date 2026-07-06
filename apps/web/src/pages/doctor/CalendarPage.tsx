import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { AppointmentDto, AvailabilitySlotDto } from "@smoothflow/shared";
import { AppShell } from "@/components/layout/AppShell";
import { mergeCalendarEvents } from "@/components/calendar/CalendarToolbar";
import { ScheduleCalendar } from "@/components/calendar/ScheduleCalendar";
import { api } from "@/lib/api";
import { useRealtime } from "@/contexts/RealtimeContext";

const navItems = [
  { to: "/doctor/calendario", label: "Agenda del día" },
  { to: "/doctor/historial", label: "Historial" },
];

export default function DoctorCalendarPage() {
  const { lastEvent } = useRealtime();
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const tomorrow = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    return d;
  }, [today]);

  const { data: appointments } = useQuery({
    queryKey: ["appointments", "doctor-today", lastEvent],
    queryFn: () =>
      api.get<{ items: AppointmentDto[] }>(
        `/appointments?from=${today.toISOString()}&to=${tomorrow.toISOString()}`,
      ),
  });

  const { data: availability } = useQuery({
    queryKey: ["availability", "doctor-today", lastEvent],
    queryFn: () =>
      api.get<{ slots: AvailabilitySlotDto[] }>(
        `/availability?from=${today.toISOString()}&to=${tomorrow.toISOString()}`,
      ),
  });

  const events = useMemo(
    () =>
      mergeCalendarEvents(
        availability?.slots ?? [],
        appointments?.items ?? [],
      ),
    [availability?.slots, appointments?.items],
  );

  return (
    <AppShell
      role="medico"
      navItems={navItems}
      title="Agenda del día"
      showNotifications
      fillContent
    >
      <div className="flex min-h-0 flex-1 flex-col">
        {events.length === 0 ? (
          <p className="text-text-muted">No tiene citas programadas para hoy.</p>
        ) : (
          <ScheduleCalendar days={[today]} events={events} />
        )}
      </div>
    </AppShell>
  );
}
