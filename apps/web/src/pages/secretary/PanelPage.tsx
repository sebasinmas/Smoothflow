import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { CalendarOff } from "lucide-react";
import type { AppointmentDto } from "@smoothflow/shared";
import { SecretaryShell } from "@/components/layout/SecretaryShell";
import { AppointmentActionsDialog } from "@/components/secretary/AppointmentActionsDialog";
import type { CalendarEventItem } from "@/components/calendar/calendar-utils";
import { EmptyState } from "@/components/ui/EmptyState";
import { AppTooltip } from "@/components/ui/Tooltip";
import { LoadingState } from "@/components/ui/LoadingState";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import { TOOLTIPS } from "@/lib/tooltips";
import { useRealtime } from "@/contexts/RealtimeContext";

function appointmentToEvent(appt: AppointmentDto): CalendarEventItem {
  return {
    id: appt.id,
    startAt: appt.startAt,
    endAt: appt.endAt,
    status: appt.status === "bloqueado" ? "bloqueado" : "reservado",
    appointmentStatus: appt.status,
    label: appt.patientName ?? appt.practitionerName ?? "Cita",
    sublabel: appt.specialtyName,
    appointmentId: appt.id,
    patientId: appt.patientId ?? undefined,
    practitionerId: appt.practitionerId,
    practitionerName: appt.practitionerName,
    patientName: appt.patientName,
    specialtyName: appt.specialtyName,
    requestReason: appt.requestReason ?? undefined,
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

  const requestsFrom = new Date(today);
  requestsFrom.setDate(requestsFrom.getDate() - 7);
  const requestsTo = new Date(today);
  requestsTo.setDate(requestsTo.getDate() + 30);

  const { data: requestsData } = useQuery({
    queryKey: ["appointments", "pending-requests", lastEvent],
    queryFn: () =>
      api.get<{ items: AppointmentDto[] }>(
        `/appointments?from=${requestsFrom.toISOString()}&to=${requestsTo.toISOString()}`,
      ),
  });

  const pendingRequests =
    requestsData?.items.filter((a) => a.status === "cancelacion_pendiente") ?? [];

  const confirmed = data?.items.filter((a) => a.status === "confirmado" || a.status === "reservado").length ?? 0;
  const blocked = data?.items.filter((a) => a.status === "bloqueado").length ?? 0;

  return (
    <SecretaryShell title="Panel de control">
      <div className="grid gap-6 md:grid-cols-3">
        <AppTooltip content={TOOLTIPS.secretary.kpiToday}>
          <div className="cursor-help rounded-xl border border-border bg-white p-6 shadow-card">
            <p className="text-sm text-text-muted">Citas hoy</p>
            <p className="text-3xl font-bold text-brand">{data?.items.length ?? 0}</p>
          </div>
        </AppTooltip>
        <AppTooltip content={TOOLTIPS.secretary.kpiConfirmed}>
          <div className="cursor-help rounded-xl border border-border bg-white p-6 shadow-card">
            <p className="text-sm text-text-muted">Confirmadas</p>
            <p className="text-3xl font-bold text-success">{confirmed}</p>
          </div>
        </AppTooltip>
        <AppTooltip content={TOOLTIPS.secretary.kpiBlocked}>
          <div className="cursor-help rounded-xl border border-border bg-white p-6 shadow-card">
            <p className="text-sm text-text-muted">Bloqueos</p>
            <p className="text-3xl font-bold text-red-600">{blocked}</p>
          </div>
        </AppTooltip>
      </div>

      {pendingRequests.length > 0 && (
        <section className="mt-8" aria-labelledby="requests-heading">
          <h2 id="requests-heading" className="mb-4 text-lg font-semibold">
            Solicitudes de cancelación pendientes
            <AppTooltip content={TOOLTIPS.secretary.pendingRequests(pendingRequests.length)}>
              <span className="ml-2 cursor-help rounded-full bg-orange-100 px-2 py-0.5 text-sm font-semibold text-orange-800">
                {pendingRequests.length}
              </span>
            </AppTooltip>
          </h2>
          <ul className="space-y-2">
            {pendingRequests.map((a) => (
              <li key={a.id}>
                <AppTooltip content={TOOLTIPS.secretary.pendingRequestRow}>
                  <button
                  type="button"
                  onClick={() => {
                    setSelectedEvent(appointmentToEvent(a));
                    setActionsOpen(true);
                  }}
                  className="w-full cursor-pointer rounded border border-orange-200 bg-orange-50 px-4 py-3 text-left transition-colors duration-200 hover:border-orange-400 hover:bg-orange-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  aria-label={`Revisar solicitud de cancelación: ${formatDateTime(a.startAt)}, ${a.patientName ?? "Sin paciente"}`}
                >
                  <span className="font-medium">{formatDateTime(a.startAt)}</span>
                  {" — "}
                  {a.patientName ?? "Sin paciente"} con {a.practitionerName}
                  {a.requestReason && (
                    <span className="mt-1 block text-sm text-orange-900/80">
                      Motivo: {a.requestReason}
                    </span>
                  )}
                </button>
                </AppTooltip>
              </li>
            ))}
          </ul>
        </section>
      )}

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
                className="cursor-pointer text-sm font-medium text-brand underline"
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
                  className="w-full cursor-pointer rounded border border-border bg-white px-4 py-3 text-left transition-colors duration-200 hover:border-brand/40 hover:bg-brand/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
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
