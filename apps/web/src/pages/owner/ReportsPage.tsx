import { useQuery } from "@tanstack/react-query";
import { BarChart3 } from "lucide-react";
import type { OccupancyReportDto } from "@smoothflow/shared";
import { AppShell } from "@/components/layout/AppShell";
import { AppTooltip } from "@/components/ui/Tooltip";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { api } from "@/lib/api";
import { startOfWeek } from "@/lib/utils";
import { OWNER_NAV, OWNER_BOTTOM_NAV } from "@/lib/navigation";
import { TOOLTIPS } from "@/lib/tooltips";

export default function OwnerReportsPage() {
  const weekStart = startOfWeek().toISOString().slice(0, 10);

  const { data, isLoading } = useQuery({
    queryKey: ["occupancy", weekStart],
    queryFn: () =>
      api.get<{ report: OccupancyReportDto }>(`/owner/reports/occupancy?weekStart=${weekStart}`),
  });

  const maxRate = Math.max(...(data?.report.days.map((d) => d.occupancyRate) ?? [1]), 1);

  return (
    <AppShell userRole="dueno" navItems={OWNER_NAV} bottomNavItems={OWNER_BOTTOM_NAV} title="Reportes de ocupación">
      <p className="mb-6 text-text-muted">
        Ocupación semanal de la agenda — semana del {weekStart}
      </p>

      {isLoading && <LoadingState message="Cargando reporte de ocupación…" />}

      {!isLoading && (data?.report.days.length ?? 0) === 0 && (
        <EmptyState
          icon={BarChart3}
          message="No hay datos de ocupación para esta semana."
        />
      )}

      {!isLoading && (data?.report.days.length ?? 0) > 0 && (
      <>
      <div
        className="flex h-64 items-end gap-4 rounded-lg border border-border bg-white p-6"
        role="img"
        aria-label="Gráfico de barras de ocupación semanal"
      >
        {data?.report.days.map((day) => (
          <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
            <AppTooltip
              content={TOOLTIPS.owner.occupationBar(
                day.occupancyRate,
                day.bookedSlots,
                day.totalSlots,
              )}
            >
              <div
                className="w-full cursor-help rounded-t bg-brand transition-all"
                style={{ height: `${(day.occupancyRate / maxRate) * 100}%`, minHeight: day.occupancyRate > 0 ? "8px" : "0" }}
              />
            </AppTooltip>
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
            <th className="py-2" scope="col">
              <AppTooltip content={TOOLTIPS.owner.occupationColumn}>
                <span className="cursor-help">Ocupación</span>
              </AppTooltip>
            </th>
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
      </>
      )}
    </AppShell>
  );
}
