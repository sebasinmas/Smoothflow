import { useQuery } from "@tanstack/react-query";
import type { AppointmentDto } from "@smoothflow/shared";
import { AppShell } from "@/components/layout/AppShell";
import { AppointmentSlot } from "@/components/ui/AppointmentSlot";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import { useRealtime } from "@/contexts/RealtimeContext";

const navItems = [
  { to: "/doctor/calendario", label: "Agenda del día" },
  { to: "/doctor/historial", label: "Historial" },
];

export default function DoctorCalendarPage() {
  const { lastEvent } = useRealtime();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data } = useQuery({
    queryKey: ["appointments", "doctor-today", lastEvent],
    queryFn: () =>
      api.get<{ items: AppointmentDto[] }>(
        `/appointments?from=${today.toISOString()}&to=${tomorrow.toISOString()}`,
      ),
  });

  return (
    <AppShell role="medico" navItems={navItems} title="Agenda del día" showLive>
      {lastEvent && (
        <div
          className="mb-6 rounded-lg border border-brand bg-slot-reserved px-4 py-3 text-sm text-brand"
          role="status"
          aria-live="polite"
        >
          {lastEvent}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {data?.items.map((appt) => (
          <AppointmentSlot
            key={appt.id}
            status={appt.status === "bloqueado" ? "bloqueado" : "reservado"}
            label={appt.patientName ?? "Bloqueo de agenda"}
            time={formatDateTime(appt.startAt)}
          />
        ))}
        {data?.items.length === 0 && (
          <p className="text-text-muted">No tiene citas programadas para hoy.</p>
        )}
      </div>
    </AppShell>
  );
}
