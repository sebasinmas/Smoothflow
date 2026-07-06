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
import { ApiError, api } from "@/lib/api";
import { formatPersonName } from "@/lib/utils";
import { OWNER_NAV, OWNER_BOTTOM_NAV } from "@/lib/navigation";

export default function OwnerStaffPage() {
  const queryClient = useQueryClient();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [unlinkTarget, setUnlinkTarget] = useState<UserDto | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["staff"],
    queryFn: () => api.get<{ items: UserDto[] }>("/owner/staff"),
  });

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
      ) : data?.items.length === 0 ? (
        <EmptyState message="Aún no hay empleados registrados. Use 'Añadir empleado' para crear el primero." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data?.items.map((staff) => (
            <StaffCard
              key={staff.id}
              staff={staff}
              onUnlink={
                staff.role !== "dueno"
                  ? () => setUnlinkTarget(staff)
                  : undefined
              }
            />
          ))}
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
