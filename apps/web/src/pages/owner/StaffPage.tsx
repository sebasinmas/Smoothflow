import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { UserDto } from "@smoothflow/shared";
import { AppShell } from "@/components/layout/AppShell";
import { CreateStaffDrawer } from "@/components/owner/CreateStaffDrawer";
import { StaffCard } from "@/components/ui/StaffCard";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { ApiError, api } from "@/lib/api";
import { formatPersonName } from "@/lib/utils";
import { OWNER_NAV, OWNER_BOTTOM_NAV } from "@/lib/navigation";
import { TOOLTIPS } from "@/lib/tooltips";

type StaffFilter = "medicos" | "secretarias" | "inactivos";

const EMPTY_MESSAGES: Record<StaffFilter, string> = {
  medicos: "No hay médicos activos.",
  secretarias: "No hay secretarias activas.",
  inactivos: "No hay empleados inactivos.",
};

function filterStaff(items: UserDto[], filter: StaffFilter): UserDto[] {
  switch (filter) {
    case "medicos":
      return items.filter((s) => s.role === "medico" && s.active);
    case "secretarias":
      return items.filter((s) => s.role === "secretaria" && s.active);
    case "inactivos":
      return items.filter((s) => !s.active);
  }
}

export default function OwnerStaffPage() {
  const queryClient = useQueryClient();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [unlinkTarget, setUnlinkTarget] = useState<UserDto | null>(null);
  const [filter, setFilter] = useState<StaffFilter>("medicos");

  const { data, isLoading } = useQuery({
    queryKey: ["staff"],
    queryFn: () => api.get<{ items: UserDto[] }>("/owner/staff"),
  });

  const items = data?.items ?? [];

  const owner = useMemo(() => items.find((s) => s.role === "dueno"), [items]);

  const counts = useMemo(
    () => ({
      medicos: filterStaff(items, "medicos").length,
      secretarias: filterStaff(items, "secretarias").length,
      inactivos: filterStaff(items, "inactivos").length,
    }),
    [items],
  );

  const filteredItems = useMemo(() => filterStaff(items, filter), [items, filter]);

  const filterOptions = useMemo(
    () => [
      { value: "medicos" as const, label: `Médicos (${counts.medicos})` },
      { value: "secretarias" as const, label: `Secretarias (${counts.secretarias})` },
      { value: "inactivos" as const, label: `Inactivos (${counts.inactivos})` },
    ],
    [counts],
  );

  const unlinkMutation = useMutation({
    mutationFn: (id: string) => api.post(`/owner/staff/${id}/unlink`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      setUnlinkTarget(null);
      toast.success("Empleado desvinculado");
    },
    onError: (err) => {
      const message = err instanceof ApiError ? err.message : "No se pudo desvincular al empleado";
      toast.error(message);
    },
  });

  const headerExtra = useMemo(
    () => (
      <Button onClick={() => setDrawerOpen(true)}>
        Añadir empleado
      </Button>
    ),
    [],
  );

  const hasAnyStaff = items.length > 0;

  return (
    <AppShell
      userRole="dueno"
      navItems={OWNER_NAV}
      bottomNavItems={OWNER_BOTTOM_NAV}
      title="Directorio de empleados"
      headerExtra={headerExtra}
    >
      <p className="mb-6 text-text-muted">Gestiona el personal de la clínica y su actividad.</p>

      {isLoading ? (
        <LoadingState message="Cargando personal…" />
      ) : !hasAnyStaff ? (
        <EmptyState message="Aún no hay empleados registrados. Use 'Añadir empleado' para crear el primero." />
      ) : (
        <div className="space-y-6">
          {owner && (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <StaffCard staff={owner} />
            </div>
          )}

          <SegmentedControl
            value={filter}
            options={filterOptions}
            onChange={(value) => setFilter(value as StaffFilter)}
            optionHints={{ inactivos: TOOLTIPS.owner.inactiveFilter }}
          />

          {filteredItems.length === 0 ? (
            <EmptyState message={EMPTY_MESSAGES[filter]} />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredItems.map((staff) => (
                <StaffCard
                  key={staff.id}
                  staff={staff}
                  onUnlink={
                    filter !== "inactivos" && staff.role !== "dueno"
                      ? () => setUnlinkTarget(staff)
                      : undefined
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}

      <CreateStaffDrawer isOpen={drawerOpen} onOpenChange={setDrawerOpen} />

      <ConfirmDialog
        isOpen={unlinkTarget !== null}
        onOpenChange={(open) => !open && setUnlinkTarget(null)}
        title="Desvincular empleado"
        description={
          unlinkTarget ? (
            <>
              ¿Está seguro que desea desvincular a{" "}
              <strong>{formatPersonName(unlinkTarget.givenName, unlinkTarget.familyName)}</strong>?
              Perderá acceso inmediato al sistema y sus sesiones activas serán cerradas.
            </>
          ) : null
        }
        confirmLabel="Desvincular"
        cancelLabel="Cancelar"
        loading={unlinkMutation.isPending}
        onConfirm={() => {
          if (unlinkTarget) unlinkMutation.mutate(unlinkTarget.id);
        }}
      />
    </AppShell>
  );
}
