import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Link2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { SpecialtyDto, UserDto } from "@smoothflow/shared";
import { ROLE_LABELS } from "@smoothflow/shared";
import { AppShell } from "@/components/layout/AppShell";
import { EditSpecialtyDrawer } from "@/components/owner/EditSpecialtyDrawer";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import { AppTooltip } from "@/components/ui/Tooltip";
import { FieldHint } from "@/components/ui/FieldHint";
import { ApiError, api } from "@/lib/api";
import { formatDateTime, formatPersonName } from "@/lib/utils";
import { OWNER_NAV, OWNER_BOTTOM_NAV } from "@/lib/navigation";
import { TOOLTIPS } from "@/lib/tooltips";

function isRevokedStaff(staff: UserDto): boolean {
  return !staff.active && staff.revokedAt != null;
}

export default function OwnerConfigPage() {
  const queryClient = useQueryClient();
  const [specialtyName, setSpecialtyName] = useState("");
  const [editTarget, setEditTarget] = useState<SpecialtyDto | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SpecialtyDto | null>(null);
  const [relinkTarget, setRelinkTarget] = useState<UserDto | null>(null);
  const [hardDeleteTarget, setHardDeleteTarget] = useState<UserDto | null>(null);

  const { data: specialties } = useQuery({
    queryKey: ["specialties"],
    queryFn: () => api.get<{ items: SpecialtyDto[] }>("/owner/specialties"),
  });

  const { data: staffData } = useQuery({
    queryKey: ["staff"],
    queryFn: () => api.get<{ items: UserDto[] }>("/owner/staff"),
  });

  const inactiveStaff = useMemo(
    () => staffData?.items.filter(isRevokedStaff) ?? [],
    [staffData?.items],
  );

  const invalidateStaffQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["staff"] });
    queryClient.invalidateQueries({ queryKey: ["practitioners"] });
    queryClient.invalidateQueries({ queryKey: ["schedules"] });
  };

  const createSpecialty = useMutation({
    mutationFn: (name: string) => api.post("/owner/specialties", { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specialties"] });
      setSpecialtyName("");
      toast.success("Especialidad creada");
    },
    onError: (err) => {
      const message = err instanceof ApiError ? err.message : "No se pudo crear la especialidad";
      toast.error(message);
    },
  });

  const deleteSpecialty = useMutation({
    mutationFn: (id: string) => api.delete(`/owner/specialties/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specialties"] });
      setDeleteTarget(null);
      toast.success("Especialidad eliminada");
    },
    onError: (err) => {
      const message = err instanceof ApiError ? err.message : "No se pudo eliminar la especialidad";
      toast.error(message);
    },
  });

  const relinkStaff = useMutation({
    mutationFn: (id: string) => api.post(`/owner/staff/${id}/relink`),
    onSuccess: () => {
      invalidateStaffQueries();
      setRelinkTarget(null);
      toast.success("Empleado revinculado");
    },
    onError: (err) => {
      const message = err instanceof ApiError ? err.message : "No se pudo revincular al empleado";
      toast.error(message);
    },
  });

  const hardDeleteStaff = useMutation({
    mutationFn: (id: string) => api.delete(`/owner/staff/${id}`),
    onSuccess: () => {
      invalidateStaffQueries();
      setHardDeleteTarget(null);
      toast.success("Empleado eliminado permanentemente");
    },
    onError: (err) => {
      const message =
        err instanceof ApiError ? err.message : "No se pudo eliminar al empleado permanentemente";
      toast.error(message);
    },
  });

  const openEdit = (specialty: SpecialtyDto) => {
    setEditTarget(specialty);
    setEditOpen(true);
  };

  return (
    <AppShell userRole="dueno" navItems={OWNER_NAV} bottomNavItems={OWNER_BOTTOM_NAV} title="Configuración de la clínica">
      <section className="rounded-lg border border-border bg-white p-4 md:p-5 lg:max-w-xl">
        <h2 className="mb-4 text-lg font-semibold">Especialidades</h2>
        <form
          className="mb-4 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            createSpecialty.mutate(specialtyName);
          }}
        >
          <div className="flex flex-1 flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <label htmlFor="new-specialty" className="text-sm font-medium text-text">
                Nueva especialidad
              </label>
              <FieldHint content={TOOLTIPS.owner.newSpecialty} />
            </div>
            <Input
              id="new-specialty"
              label="Nueva especialidad"
              value={specialtyName}
              onChange={(e) => setSpecialtyName(e.target.value)}
              className="flex-1 [&_label]:sr-only"
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" loading={createSpecialty.isPending}>
              Agregar
            </Button>
          </div>
        </form>
        <ul className="space-y-1 text-sm">
          {specialties?.items.map((s) => (
            <li
              key={s.id}
              className="flex items-center justify-between gap-2 rounded bg-surface-muted px-3 py-2"
            >
              <div className="min-w-0">
                <span className="font-medium">{s.name}</span>
                {s.description && (
                  <p className="truncate text-xs text-text-muted">{s.description}</p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <AppTooltip content={TOOLTIPS.owner.editSpecialty}>
                  <button
                    type="button"
                    onClick={() => openEdit(s)}
                    className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-white hover:text-brand"
                    aria-label={`Editar ${s.name}`}
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                  </button>
                </AppTooltip>
                <AppTooltip content={TOOLTIPS.owner.deleteSpecialty}>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(s)}
                    className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-white hover:text-red-600"
                    aria-label={`Eliminar ${s.name}`}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </button>
                </AppTooltip>
              </div>
            </li>
          ))}
          {specialties?.items.length === 0 && (
            <li className="px-3 py-2 text-text-muted">Aún no hay especialidades registradas.</li>
          )}
        </ul>
      </section>

      <section className="mt-6 rounded-lg border border-border bg-white p-4 md:p-5 lg:max-w-xl">
        <h2 className="mb-2 text-lg font-semibold">Personal desvinculado</h2>
        <p className="mb-4 text-sm text-text-muted">
          Revincule empleados para restaurar su acceso o elimínelos permanentemente del sistema.
        </p>
        <ul className="space-y-1 text-sm">
          {inactiveStaff.map((staff) => (
            <li
              key={staff.id}
              className="flex items-center justify-between gap-2 rounded bg-surface-muted px-3 py-2"
            >
              <div className="min-w-0">
                <span className="font-medium">
                  {formatPersonName(staff.givenName, staff.familyName)}
                </span>
                <p className="truncate text-xs text-text-muted">
                  {ROLE_LABELS[staff.role]}
                  {staff.revokedAt && ` · Desvinculado el ${formatDateTime(staff.revokedAt)}`}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <AppTooltip content={TOOLTIPS.owner.relinkStaff}>
                  <button
                    type="button"
                    onClick={() => setRelinkTarget(staff)}
                    className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-white hover:text-brand"
                    aria-label={`Revincular a ${formatPersonName(staff.givenName, staff.familyName)}`}
                  >
                    <Link2 className="size-4" aria-hidden="true" />
                  </button>
                </AppTooltip>
                <AppTooltip content={TOOLTIPS.owner.hardDeleteStaff}>
                  <button
                    type="button"
                    onClick={() => setHardDeleteTarget(staff)}
                    className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-white hover:text-red-600"
                    aria-label={`Eliminar permanentemente a ${formatPersonName(staff.givenName, staff.familyName)}`}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </button>
                </AppTooltip>
              </div>
            </li>
          ))}
          {inactiveStaff.length === 0 && (
            <li className="px-3 py-2 text-text-muted">No hay empleados desvinculados.</li>
          )}
        </ul>
      </section>

      <EditSpecialtyDrawer
        specialty={editTarget}
        isOpen={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditTarget(null);
        }}
      />

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Eliminar especialidad"
        description={
          deleteTarget ? (
            <>
              ¿Está seguro que desea eliminar la especialidad{" "}
              <strong>{deleteTarget.name}</strong>? Esta acción no se puede deshacer.
            </>
          ) : null
        }
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        loading={deleteSpecialty.isPending}
        onConfirm={() => {
          if (deleteTarget) deleteSpecialty.mutate(deleteTarget.id);
        }}
      />

      <ConfirmDialog
        isOpen={relinkTarget !== null}
        onOpenChange={(open) => !open && setRelinkTarget(null)}
        title="Revincular empleado"
        description={
          relinkTarget ? (
            <>
              ¿Está seguro que desea revincular a{" "}
              <strong>{formatPersonName(relinkTarget.givenName, relinkTarget.familyName)}</strong>?
              Recuperará acceso al sistema con sus credenciales anteriores.
            </>
          ) : null
        }
        confirmLabel="Revincular"
        cancelLabel="Cancelar"
        loading={relinkStaff.isPending}
        onConfirm={() => {
          if (relinkTarget) relinkStaff.mutate(relinkTarget.id);
        }}
      />

      <ConfirmDialog
        isOpen={hardDeleteTarget !== null}
        onOpenChange={(open) => !open && setHardDeleteTarget(null)}
        title="Eliminar empleado permanentemente"
        description={
          hardDeleteTarget ? (
            <>
              ¿Está seguro que desea eliminar permanentemente a{" "}
              <strong>
                {formatPersonName(hardDeleteTarget.givenName, hardDeleteTarget.familyName)}
              </strong>
              ? Esta acción eliminará el registro del empleado y no podrá recuperarse. Se perderá el
              rastro de este empleado en el sistema.
            </>
          ) : null
        }
        confirmLabel="Eliminar permanentemente"
        cancelLabel="Cancelar"
        loading={hardDeleteStaff.isPending}
        onConfirm={() => {
          if (hardDeleteTarget) hardDeleteStaff.mutate(hardDeleteTarget.id);
        }}
      />
    </AppShell>
  );
}
