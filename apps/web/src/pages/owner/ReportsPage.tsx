import { useQuery } from "@tanstack/react-query";
import type { OccupancyReportDto } from "@smoothflow/shared";
import { AppShell } from "@/components/layout/AppShell";
import { api } from "@/lib/api";
import { startOfWeek } from "@/lib/utils";

const navItems = [
  { to: "/owner/staff", label: "Personal" },
  { to: "/owner/reportes", label: "Reportes" },
];

const bottomNavItems = [{ to: "/owner/configuracion", label: "Configuración" }];

export default function OwnerReportsPage() {
  const weekStart = startOfWeek().toISOString().slice(0, 10);

  const { data } = useQuery({
    queryKey: ["occupancy", weekStart],
    queryFn: () =>
      api.get<{ report: OccupancyReportDto }>(`/owner/reports/occupancy?weekStart=${weekStart}`),
  });

  const maxRate = Math.max(...(data?.report.days.map((d) => d.occupancyRate) ?? [1]), 1);

  return (
    <AppShell role="dueno" navItems={navItems} bottomNavItems={bottomNavItems} title="Reportes de ocupación">
      <p className="mb-6 text-text-muted">
        Ocupación semanal de la agenda — semana del {weekStart}
      </p>

      <div
        className="flex h-64 items-end gap-4 rounded-lg border border-border bg-white p-6"
        role="img"
        aria-label="Gráfico de barras de ocupación semanal"
      >
        {data?.report.days.map((day) => (
          <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
            <div
              className="w-full rounded-t bg-brand transition-all"
              style={{ height: `${(day.occupancyRate / maxRate) * 100}%`, minHeight: day.occupancyRate > 0 ? "8px" : "0" }}
              title={`${day.occupancyRate}%`}
            />
            <span className="text-xs text-text-muted">
              {new Date(day.date).toLocaleDateString("es-CL", { weekday: "short" })}
            </span>
            <span className="text-xs font-medium">{day.occupancyRate}%</span>
          </div>
        ))}
      </div>

      <table className="mt-8 w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="py-2" scope="col">Día</th>
            <th className="py-2" scope="col">Reservados</th>
            <th className="py-2" scope="col">Total</th>
            <th className="py-2" scope="col">Ocupación</th>
          </tr>
        </thead>
        <tbody>
          {data?.report.days.map((d) => (
            <tr key={d.date} className="border-b border-border">
              <td className="py-2">{d.date}</td>
              <td className="py-2">{d.bookedSlots}</td>
              <td className="py-2">{d.totalSlots}</td>
              <td className="py-2">{d.occupancyRate}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </AppShell>
  );
}
