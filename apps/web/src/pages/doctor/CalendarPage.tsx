import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import type { AppointmentDto, AvailabilitySlotDto } from "@smoothflow/shared";
import { CalendarOff } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import type { CalendarEventItem } from "@/components/calendar/calendar-utils";
import { mergeCalendarEvents } from "@/components/calendar/calendar-utils";
import { ScheduleCalendar } from "@/components/calendar/ScheduleCalendar";
import { DoctorAppointmentSheet } from "@/components/doctor/DoctorAppointmentSheet";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { api } from "@/lib/api";
import { useRealtime } from "@/contexts/RealtimeContext";
import { DOCTOR_NAV } from "@/lib/navigation";

export default function DoctorCalendarPage() {
  const { lastEvent } = useRealtime();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventItem | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
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

  const { data: appointments, isLoading: loadingAppointments } = useQuery({
    queryKey: ["appointments", "doctor-today", lastEvent],
    queryFn: () =>
      api.get<{ items: AppointmentDto[] }>(
        `/appointments?from=${today.toISOString()}&to=${tomorrow.toISOString()}`,
      ),
  });

  const { data: availability, isLoading: loadingAvailability } = useQuery({
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

  const handleEventClick = (event: CalendarEventItem) => {
    if (event.status !== "reservado" || !event.appointmentId) return;
    setSelectedEvent(event);
    setSheetOpen(true);
  };

  return (
    <AppShell
      userRole="medico"
      navItems={DOCTOR_NAV}
      title="Agenda del día"
      showNotifications
      fillContent
    >
      <div className="flex min-h-0 flex-1 flex-col">
        {loadingAppointments || loadingAvailability ? (
          <LoadingState message="Cargando agenda del día…" />
        ) : events.length === 0 ? (
          <EmptyState icon={CalendarOff} message="No tiene citas programadas para hoy." />
        ) : (
          <ScheduleCalendar days={[today]} events={events} onEventClick={handleEventClick} />
        )}
      </div>

      <DoctorAppointmentSheet
        isOpen={sheetOpen}
        onOpenChange={setSheetOpen}
        event={selectedEvent}
      />
    </AppShell>
  );
}
