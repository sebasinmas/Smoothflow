import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { PractitionerDto, ScheduleTemplateDto, SpecialtyDto } from "@smoothflow/shared";
import { AppShell } from "@/components/layout/AppShell";
import { EditSpecialtyDrawer } from "@/components/owner/EditSpecialtyDrawer";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ApiError, api } from "@/lib/api";
import { OWNER_NAV, OWNER_BOTTOM_NAV } from "@/lib/navigation";

const DAYS = [
  { value: "1", label: "Lunes" },
  { value: "2", label: "Martes" },
  { value: "3", label: "Miércoles" },
  { value: "4", label: "Jueves" },
  { value: "5", label: "Viernes" },
];

export default function OwnerConfigPage() {
  const queryClient = useQueryClient();
  const [specialtyName, setSpecialtyName] = useState("");
  const [practitionerId, setPractitionerId] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("1");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [editTarget, setEditTarget] = useState<SpecialtyDto | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SpecialtyDto | null>(null);

  const { data: specialties } = useQuery({
    queryKey: ["specialties"],
    queryFn: () => api.get<{ items: SpecialtyDto[] }>("/owner/specialties"),
  });

  const { data: practitioners } = useQuery({
    queryKey: ["practitioners"],
    queryFn: () => api.get<{ items: PractitionerDto[] }>("/owner/practitioners"),
  });

  const { data: schedules } = useQuery({
    queryKey: ["schedules"],
    queryFn: () => api.get<{ items: ScheduleTemplateDto[] }>("/owner/schedules"),
  });

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

  const createSchedule = useMutation({
    mutationFn: (body: unknown) => api.post("/owner/schedules", body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["schedules"] }),
  });

  const practitionerOptions =
    practitioners?.items.map((p) => ({
      value: p.id,
      label: `${p.givenName} ${p.familyName}`,
    })) ?? [];

  const openEdit = (specialty: SpecialtyDto) => {
    setEditTarget(specialty);
    setEditOpen(true);
  };

  return (
    <AppShell userRole="dueno" navItems={OWNER_NAV} bottomNavItems={OWNER_BOTTOM_NAV} title="Configuración de la clínica">
      <div className="grid gap-8 lg:grid-cols-2">
        <section className="rounded-lg border border-border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Especialidades</h2>
          <form
            className="mb-4 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              createSpecialty.mutate(specialtyName);
            }}
          >
            <Input
              label="Nueva especialidad"
              value={specialtyName}
              onChange={(e) => setSpecialtyName(e.target.value)}
              className="flex-1"
            />
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
                  <button
                    type="button"
                    onClick={() => openEdit(s)}
                    className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-white hover:text-brand"
                    aria-label={`Editar ${s.name}`}
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(s)}
                    className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-white hover:text-red-600"
                    aria-label={`Eliminar ${s.name}`}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
            {specialties?.items.length === 0 && (
              <li className="px-3 py-2 text-text-muted">Aún no hay especialidades registradas.</li>
            )}
          </ul>
        </section>

        <section className="rounded-lg border border-border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Horarios base</h2>
          <form
            className="grid gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              createSchedule.mutate({
                practitionerId,
                dayOfWeek: Number(dayOfWeek),
                startTime,
                endTime,
                slotDurationMinutes: 30,
              });
            }}
          >
            <Select
              label="Médico"
              value={practitionerId}
              onChange={(e) => setPractitionerId(e.target.value)}
              options={[{ value: "", label: "Seleccionar…" }, ...practitionerOptions]}
            />
            <Select
              label="Día"
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(e.target.value)}
              options={DAYS}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Inicio" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              <Input label="Fin" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
            <Button type="submit" disabled={!practitionerId} loading={createSchedule.isPending}>
              Guardar horario
            </Button>
          </form>
          <ul className="mt-4 space-y-1 text-sm">
            {schedules?.items.map((s) => {
              const p = practitioners?.items.find((x) => x.id === s.practitionerId);
              return (
                <li key={s.id} className="rounded bg-surface-muted px-3 py-2">
                  {p ? `${p.givenName} ${p.familyName}` : s.practitionerId} — día {s.dayOfWeek}{" "}
                  {s.startTime}-{s.endTime}
                </li>
              );
            })}
            {schedules?.items.length === 0 && (
              <li className="px-3 py-2 text-text-muted">Aún no hay horarios configurados.</li>
            )}
          </ul>
        </section>
      </div>

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
    </AppShell>
  );
}
