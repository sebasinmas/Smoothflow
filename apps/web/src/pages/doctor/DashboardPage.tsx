import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, CalendarOff } from "lucide-react";
import type { AppointmentDto } from "@smoothflow/shared";
import { AppShell } from "@/components/layout/AppShell";
import { DoctorAppointmentSheet } from "@/components/doctor/DoctorAppointmentSheet";
import type { CalendarEventItem } from "@/components/calendar/calendar-utils";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import { DOCTOR_NAV } from "@/lib/navigation";
import { useRealtime } from "@/contexts/RealtimeContext";

// Estados de cita que el médico todavía debe gestionar (marcar asistencia).
const UNMANAGED_STATUSES = new Set(["reservado", "confirmado", "reagendado"]);

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

function formatElapsed(startAt: string, now: number): string {
  const diffMinutes = Math.floor((now - new Date(startAt).getTime()) / 60_000);
  if (diffMinutes < 1) return "recién iniciada";
  if (diffMinutes < 60) return `hace ${diffMinutes} min`;
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  return minutes > 0 ? `hace ${hours} h ${minutes} min` : `hace ${hours} h`;
}

export default function DoctorDashboardPage() {
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

  const { data, isLoading } = useQuery({
    queryKey: ["appointments", "doctor-dashboard", lastEvent],
    queryFn: () =>
      api.get<{ items: AppointmentDto[] }>(
        `/appointments?from=${today.toISOString()}&to=${tomorrow.toISOString()}`,
      ),
  });

  const now = Date.now();
  const items = data?.items ?? [];

  const urgent = useMemo(
    () =>
      items
        .filter(
          (a) =>
            UNMANAGED_STATUSES.has(a.status) && new Date(a.startAt).getTime() <= now,
        )
        .sort((a, b) => a.startAt.localeCompare(b.startAt)),
    [items, now],
  );

  const attended = items.filter((a) => a.status === "atendido").length;
  const totalToday = items.filter((a) => a.status !== "bloqueado").length;

  const openSheet = (appt: AppointmentDto) => {
    setSelectedEvent(appointmentToEvent(appt));
    setSheetOpen(true);
  };

  return (
    <AppShell userRole="medico" navItems={DOCTOR_NAV} title="Panel" showNotifications>
      {isLoading ? (
        <LoadingState message="Cargando panel…" />
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-border bg-white p-6 shadow-card">
              <p className="text-sm text-text-muted">Citas hoy</p>
              <p className="text-3xl font-bold text-brand">{totalToday}</p>
            </div>
            <div className="rounded-xl border border-border bg-white p-6 shadow-card">
              <p className="text-sm text-text-muted">Por gestionar</p>
              <p className="text-3xl font-bold text-amber-600">{urgent.length}</p>
            </div>
            <div className="rounded-xl border border-border bg-white p-6 shadow-card">
              <p className="text-sm text-text-muted">Atendidas</p>
              <p className="text-3xl font-bold text-success">{attended}</p>
            </div>
          </div>

          <section className="mt-8" aria-labelledby="urgent-heading">
            <h2 id="urgent-heading" className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <AlertTriangle className="size-5 text-amber-600" aria-hidden="true" />
              Requieren gestión
              {urgent.length > 0 && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-sm font-semibold text-amber-800">
                  {urgent.length}
                </span>
              )}
            </h2>
            {urgent.length === 0 ? (
              <EmptyState message="No hay citas iniciadas pendientes de gestionar." />
            ) : (
              <ul className="space-y-2">
                {urgent.map((a) => (
                  <li key={a.id}>
                    <button
                      type="button"
                      onClick={() => openSheet(a)}
                      className="w-full cursor-pointer rounded border border-amber-200 bg-amber-50 px-4 py-3 text-left transition-colors duration-200 hover:border-amber-400 hover:bg-amber-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                      aria-label={`Gestionar cita: ${formatDateTime(a.startAt)}, ${a.patientName ?? "Sin paciente"}`}
                    >
                      <span className="flex flex-wrap items-baseline justify-between gap-x-2">
                        <span className="font-medium">
                          {formatDateTime(a.startAt)} — {a.patientName ?? "Sin paciente"}
                        </span>
                        <span className="text-sm font-medium text-amber-800">
                          {formatElapsed(a.startAt, now)}
                        </span>
                      </span>
                      {a.specialtyName && (
                        <span className="mt-1 block text-sm text-text-muted">{a.specialtyName}</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="mt-8" aria-labelledby="today-heading">
            <h2 id="today-heading" className="mb-4 text-lg font-semibold">
              Agenda de hoy
            </h2>
            {totalToday === 0 ? (
              <EmptyState
                icon={CalendarOff}
                message="No tiene citas programadas para hoy."
                action={
                  <Link
                    to="/doctor/calendar"
                    className="cursor-pointer text-sm font-medium text-brand underline"
                  >
                    Ir a la agenda
                  </Link>
                }
              />
            ) : (
              <ul className="space-y-2">
                {items
                  .filter((a) => a.status !== "bloqueado")
                  .sort((a, b) => a.startAt.localeCompare(b.startAt))
                  .map((a) => (
                    <li key={a.id}>
                      <button
                        type="button"
                        onClick={() => openSheet(a)}
                        className="w-full cursor-pointer rounded border border-border bg-white px-4 py-3 text-left transition-colors duration-200 hover:border-brand/40 hover:bg-brand/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                        aria-label={`Ver detalle de cita: ${formatDateTime(a.startAt)}, ${a.patientName ?? "Sin paciente"}`}
                      >
                        <span className="font-medium">{formatDateTime(a.startAt)}</span>
                        {" — "}
                        {a.patientName ?? "Sin paciente"}
                      </button>
                    </li>
                  ))}
              </ul>
            )}
          </section>
        </>
      )}

      <DoctorAppointmentSheet
        isOpen={sheetOpen}
        onOpenChange={setSheetOpen}
        event={selectedEvent}
      />
    </AppShell>
  );
}
