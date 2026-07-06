import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import type { AppointmentDto, AvailabilitySlotDto } from "@smoothflow/shared";
import { AppShell } from "@/components/layout/AppShell";
import { AppointmentSlot } from "@/components/ui/AppointmentSlot";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { api } from "@/lib/api";
import { addDays, formatDateTime, startOfWeek } from "@/lib/utils";
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

  const weekEnd = addDays(weekStart, view === "week" ? 7 : 1);

  const { data: practitioners } = useQuery({
    queryKey: ["practitioners"],
    queryFn: () => api.get<{ items: Array<{ id: string; givenName: string; familyName: string }> }>("/owner/practitioners"),
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
    queryKey: ["availability", weekStart.toISOString(), selectedPractitioner],
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
      showLive
      primaryAction={{
        label: "Crea una reservación",
        onClick: () => document.getElementById("new-booking")?.focus(),
      }}
    >
      <div className="mb-6 flex flex-wrap items-end gap-4">
        <Select
          label="Médico"
          value={selectedPractitioner}
          onChange={(e) => setSelectedPractitioner(e.target.value)}
          options={practitionerOptions}
        />
        <div className="flex gap-2">
          <Button variant={view === "week" ? "primary" : "secondary"} onClick={() => setView("week")}>
            Semanal
          </Button>
          <Button variant={view === "day" ? "primary" : "secondary"} onClick={() => setView("day")}>
            Diaria
          </Button>
          <Button variant="secondary" onClick={() => setWeekStart(addDays(weekStart, -7))}>
            ← Anterior
          </Button>
          <Button variant="secondary" onClick={() => setWeekStart(addDays(weekStart, 7))}>
            Siguiente →
          </Button>
        </div>
        <Button variant="secondary" onClick={() => refetch()}>
          Actualizar
        </Button>
      </div>

      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}
        role="grid"
        aria-label="Calendario semanal de citas"
      >
        {days.map((day) => {
          const dayKey = day.toISOString().slice(0, 10);
          const daySlots =
            availability?.slots.filter((s) => s.startAt.startsWith(dayKey)) ?? [];
          const dayAppts =
            appointments?.items.filter((a) => a.startAt.startsWith(dayKey)) ?? [];

          return (
            <section key={dayKey} role="row" aria-label={day.toLocaleDateString("es-CL", { weekday: "long", day: "numeric" })}>
              <h2 className="mb-3 text-center text-sm font-semibold text-brand">
                {day.toLocaleDateString("es-CL", { weekday: "short", day: "numeric", month: "short" })}
              </h2>
              <div className="flex flex-col gap-2" role="rowgroup">
                {daySlots.length === 0 &&
                  dayAppts.map((appt) => (
                    <AppointmentSlot
                      key={appt.id}
                      status={appt.status === "bloqueado" ? "bloqueado" : "reservado"}
                      label={appt.patientName ?? appt.practitionerName ?? "Cita"}
                      time={formatDateTime(appt.startAt)}
                    />
                  ))}
                {daySlots.map((slot) => (
                  <AppointmentSlot
                    key={`${slot.startAt}-${slot.practitionerId}`}
                    status={slot.status}
                    label={slot.practitionerName}
                    time={formatDateTime(slot.startAt)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <div id="new-booking" tabIndex={-1} className="sr-only">
        Use la vista de pacientes para crear reservas en representación del paciente.
      </div>
    </AppShell>
  );
}
