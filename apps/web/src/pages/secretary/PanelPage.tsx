import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { CalendarOff } from "lucide-react";
import type { AppointmentDto } from "@smoothflow/shared";
import { SecretaryShell } from "@/components/layout/SecretaryShell";
import { AppointmentActionsDialog } from "@/components/secretary/AppointmentActionsDialog";
import type { CalendarEventItem } from "@/components/calendar/calendar-utils";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import { useRealtime } from "@/contexts/RealtimeContext";

function appointmentToEvent(appt: AppointmentDto): CalendarEventItem {
  return {
    id: appt.id,
    startAt: appt.startAt,
    endAt: appt.endAt,
    status: appt.status === "bloqueado" ? "bloqueado" : "reservado",
    label: appt.patientName ?? appt.practitionerName ?? "Cita",
    sublabel: appt.specialtyName,
    appointmentId: appt.id,
    patientId: appt.patientId ?? undefined,
    practitionerId: appt.practitionerId,
  };
}

export default function SecretaryPanelPage() {
  const { lastEvent } = useRealtime();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventItem | null>(null);
  const [actionsOpen, setActionsOpen] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data, isLoading } = useQuery({
    queryKey: ["appointments", "today", lastEvent],
    queryFn: () =>
      api.get<{ items: AppointmentDto[] }>(
        `/appointments?from=${today.toISOString()}&to=${tomorrow.toISOString()}`,
      ),
  });

  const confirmed = data?.items.filter((a) => a.status === "confirmado" || a.status === "reservado").length ?? 0;
  const blocked = data?.items.filter((a) => a.status === "bloqueado").length ?? 0;

  return (
    <SecretaryShell title="Panel de control">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-white p-6 shadow-card">
          <p className="text-sm text-text-muted">Citas hoy</p>
          <p className="text-3xl font-bold text-brand">{data?.items.length ?? 0}</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-6 shadow-card">
          <p className="text-sm text-text-muted">Confirmadas</p>
          <p className="text-3xl font-bold text-success">{confirmed}</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-6 shadow-card">
          <p className="text-sm text-text-muted">Bloqueos</p>
          <p className="text-3xl font-bold text-red-600">{blocked}</p>
        </div>
      </div>

      <section className="mt-8" aria-labelledby="today-heading">
        <h2 id="today-heading" className="mb-4 text-lg font-semibold">
          Agenda de hoy
        </h2>
        {isLoading ? (
          <LoadingState message="Cargando agenda de hoy…" />
        ) : data?.items.length === 0 ? (
          <EmptyState
            icon={CalendarOff}
            message="No hay citas programadas hoy."
            action={
              <Link
                to="/secretaria/calendario"
                className="text-sm font-medium text-brand underline"
              >
                Ir al calendario
              </Link>
            }
          />
        ) : (
          <ul className="space-y-2">
            {data?.items.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedEvent(appointmentToEvent(a));
                    setActionsOpen(true);
                  }}
                  className="w-full rounded border border-border bg-white px-4 py-3 text-left transition-colors duration-200 hover:border-brand/40 hover:bg-brand/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  aria-label={`Ver detalle de cita: ${formatDateTime(a.startAt)}, ${a.patientName ?? "Sin paciente"}`}
                >
                  <span className="font-medium">{formatDateTime(a.startAt)}</span>
                  {" — "}
                  {a.patientName ?? "Sin paciente"} con {a.practitionerName}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <AppointmentActionsDialog
        isOpen={actionsOpen}
        onOpenChange={setActionsOpen}
        event={selectedEvent}
      />
    </SecretaryShell>
  );
}
