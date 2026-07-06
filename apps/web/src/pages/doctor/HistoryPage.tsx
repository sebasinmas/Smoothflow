import { useQuery } from "@tanstack/react-query";
import type { AppointmentDto } from "@smoothflow/shared";
import { AppShell } from "@/components/layout/AppShell";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";

const navItems = [
  { to: "/doctor/calendario", label: "Agenda del día" },
  { to: "/doctor/historial", label: "Historial" },
];

export default function DoctorHistoryPage() {
  const monthAgo = new Date();
  monthAgo.setMonth(monthAgo.getMonth() - 1);

  const { data } = useQuery({
    queryKey: ["appointments", "doctor-history"],
    queryFn: () =>
      api.get<{ items: AppointmentDto[] }>(
        `/appointments?from=${monthAgo.toISOString()}&to=${new Date().toISOString()}`,
      ),
  });

  return (
    <AppShell role="medico" navItems={navItems} title="Historial de citas" showNotifications>
      <div className="overflow-x-auto rounded-lg border border-border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-surface-muted">
            <tr>
              <th className="px-4 py-3" scope="col">Fecha</th>
              <th className="px-4 py-3" scope="col">Paciente</th>
              <th className="px-4 py-3" scope="col">Estado</th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((a) => (
              <tr key={a.id} className="border-b border-border">
                <td className="px-4 py-3">{formatDateTime(a.startAt)}</td>
                <td className="px-4 py-3">{a.patientName ?? "—"}</td>
                <td className="px-4 py-3 capitalize">{a.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
