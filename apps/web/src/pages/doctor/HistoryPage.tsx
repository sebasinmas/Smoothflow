import { useQuery } from "@tanstack/react-query";
import type { AppointmentDto } from "@smoothflow/shared";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingState } from "@/components/ui/LoadingState";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import { DOCTOR_NAV } from "@/lib/navigation";

export default function DoctorHistoryPage() {
  const monthAgo = new Date();
  monthAgo.setMonth(monthAgo.getMonth() - 1);

  const { data, isLoading } = useQuery({
    queryKey: ["appointments", "doctor-history"],
    queryFn: () =>
      api.get<{ items: AppointmentDto[] }>(
        `/appointments?from=${monthAgo.toISOString()}&to=${new Date().toISOString()}`,
      ),
  });

  return (
    <AppShell userRole="medico" navItems={DOCTOR_NAV} title="Historial de citas" showNotifications>
      {isLoading ? (
        <LoadingState message="Cargando historial…" />
      ) : (
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
                <tr key={a.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">{formatDateTime(a.startAt)}</td>
                  <td className="px-4 py-3">{a.patientName ?? "—"}</td>
                  <td className="px-4 py-3 capitalize">{a.status}</td>
                </tr>
              ))}
              {data?.items.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-text-muted">
                    No hay citas registradas en el último mes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
