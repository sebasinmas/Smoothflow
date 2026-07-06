import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import type { AppointmentDto, AvailabilitySlotDto } from "@smoothflow/shared";
import { AppShell } from "@/components/layout/AppShell";
import { CalendarToolbar, mergeCalendarEvents, SegmentedControl } from "@/components/calendar/CalendarToolbar";
import { ScheduleCalendar } from "@/components/calendar/ScheduleCalendar";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { api } from "@/lib/api";
import { addDays, startOfWeek } from "@/lib/utils";
import { useRealtime } from "@/contexts/RealtimeContext";

const navItems = [
  { to: "/secretaria/panel", label: "Panel de control" },
  { to: "/secretaria/calendario", label: "Calendario" },
  { to: "/secretaria/pacientes", label: "Pacientes" },
];

export default function SecretaryCalendarPage() {
  const { lastEvent } = useRealtime();
  const [view, setView] = useState<"week" | "day">("week");
  const [weekStart, setWeekStart] = useState(() => startOfWeek());
  const [selectedPractitioner, setSelectedPractitioner] = useState("");

  const step = view === "week" ? 7 : 1;
  const weekEnd = addDays(weekStart, step);

  const { data: practitioners } = useQuery({
    queryKey: ["practitioners"],
    queryFn: () =>
      api.get<{ items: Array<{ id: string; givenName: string; familyName: string }> }>(
        "/owner/practitioners",
      ),
  });

  const { data: appointments, refetch } = useQuery({
    queryKey: ["appointments", weekStart.toISOString(), selectedPractitioner, lastEvent],
    queryFn: () => {
      const params = new URLSearchParams({
        from: weekStart.toISOString(),
        to: weekEnd.toISOString(),
      });
      if (selectedPractitioner) params.set("practitionerId", selectedPractitioner);
      return api.get<{ items: AppointmentDto[] }>(`/appointments?${params}`);
    },
  });

  const { data: availability } = useQuery({
    queryKey: ["availability", weekStart.toISOString(), selectedPractitioner, lastEvent],
    queryFn: () => {
      const params = new URLSearchParams({
        from: weekStart.toISOString(),
        to: weekEnd.toISOString(),
      });
      if (selectedPractitioner) params.set("practitionerId", selectedPractitioner);
      return api.get<{ slots: AvailabilitySlotDto[] }>(`/availability?${params}`);
    },
  });

  const days = useMemo(() => {
    const count = view === "week" ? 7 : 1;
    return Array.from({ length: count }, (_, i) => addDays(weekStart, i));
  }, [view, weekStart]);

  const events = useMemo(
    () =>
      mergeCalendarEvents(
        availability?.slots ?? [],
        appointments?.items ?? [],
      ),
    [availability?.slots, appointments?.items],
  );

  const practitionerOptions = [
    { value: "", label: "Todos los médicos" },
    ...(practitioners?.items.map((p) => ({
      value: p.id,
      label: `${p.givenName} ${p.familyName}`,
    })) ?? []),
  ];

  return (
    <AppShell
      role="secretaria"
      navItems={navItems}
      title="Calendario de agenda"
      showNotifications
      fillContent
      primaryAction={{
        label: "Crea una reservación",
        onClick: () => document.getElementById("new-booking")?.focus(),
      }}
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <CalendarToolbar>
          <Select
            label="Médico"
            value={selectedPractitioner}
            onChange={(e) => setSelectedPractitioner(e.target.value)}
            options={practitionerOptions}
          />
          <SegmentedControl
            value={view}
            options={[
              { value: "week", label: "Semanal" },
              { value: "day", label: "Diaria" },
            ]}
            onChange={(v) => setView(v as "week" | "day")}
          />
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setWeekStart(addDays(weekStart, -step))}>
              ← Anterior
            </Button>
            <Button variant="secondary" onClick={() => setWeekStart(addDays(weekStart, step))}>
              Siguiente →
            </Button>
          </div>
          <Button variant="secondary" onClick={() => refetch()}>
            Actualizar
          </Button>
        </CalendarToolbar>

        <ScheduleCalendar days={days} events={events} />
      </div>

      <div id="new-booking" tabIndex={-1} className="sr-only">
        Use la vista de pacientes para crear reservas en representación del paciente.
      </div>
    </AppShell>
  );
}
