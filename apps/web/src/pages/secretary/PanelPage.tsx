import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { api } from "@/lib/api";
import type { AppointmentDto } from "@smoothflow/shared";
import { formatDateTime } from "@/lib/utils";
import { useRealtime } from "@/contexts/RealtimeContext";

const navItems = [
  { to: "/secretaria/panel", label: "Panel de control" },
  { to: "/secretaria/calendario", label: "Calendario" },
  { to: "/secretaria/pacientes", label: "Pacientes" },
];

export default function SecretaryPanelPage() {
  const { lastEvent } = useRealtime();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data } = useQuery({
    queryKey: ["appointments", "today", lastEvent],
    queryFn: () =>
      api.get<{ items: AppointmentDto[] }>(
        `/appointments?from=${today.toISOString()}&to=${tomorrow.toISOString()}`,
      ),
  });

  const confirmed = data?.items.filter((a) => a.status === "confirmado" || a.status === "reservado").length ?? 0;
  const blocked = data?.items.filter((a) => a.status === "bloqueado").length ?? 0;

  return (
    <AppShell role="secretaria" navItems={navItems} title="Panel de control" showLive>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-white p-6">
          <p className="text-sm text-text-muted">Citas hoy</p>
          <p className="text-3xl font-bold text-brand">{data?.items.length ?? 0}</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-6">
          <p className="text-sm text-text-muted">Confirmadas</p>
          <p className="text-3xl font-bold text-success">{confirmed}</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-6">
          <p className="text-sm text-text-muted">Bloqueos</p>
          <p className="text-3xl font-bold text-red-600">{blocked}</p>
        </div>
      </div>

      <section className="mt-8" aria-labelledby="today-heading">
        <h2 id="today-heading" className="mb-4 text-lg font-semibold">
          Agenda de hoy
        </h2>
        <ul className="space-y-2">
          {data?.items.map((a) => (
            <li key={a.id} className="rounded border border-border bg-white px-4 py-3">
              <span className="font-medium">{formatDateTime(a.startAt)}</span>
              {" — "}
              {a.patientName ?? "Sin paciente"} con {a.practitionerName}
            </li>
          ))}
          {data?.items.length === 0 && <li className="text-text-muted">No hay citas programadas hoy.</li>}
        </ul>
      </section>
    </AppShell>
  );
}
