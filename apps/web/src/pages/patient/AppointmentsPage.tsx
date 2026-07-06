import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import type { AppointmentDto } from "@smoothflow/shared";
import { PatientShell } from "@/components/layout/PatientShell";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";

export default function PatientAppointmentsPage() {
  const queryClient = useQueryClient();
  const [cancelTarget, setCancelTarget] = useState<AppointmentDto | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["my-appointments"],
    queryFn: () => api.get<{ items: AppointmentDto[] }>("/appointments"),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/appointments/${id}`, { status: "cancelado" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-appointments"] });
      setCancelTarget(null);
    },
  });

  const active = data?.items.filter((a) => a.status !== "cancelado") ?? [];

  return (
    <PatientShell title="Mis citas">
      {isLoading ? (
        <p className="text-text-muted" role="status">Cargando sus citas…</p>
      ) : (
        <ul className="space-y-4">
          {active.map((a) => (
            <li key={a.id} className="rounded-xl border border-border bg-white p-4 shadow-card">
              <p className="font-semibold">{formatDateTime(a.startAt)}</p>
              <p className="text-sm text-text-muted">
                {a.practitionerName} — {a.specialtyName}
              </p>
              <p className="mt-1 text-xs capitalize text-text-muted">Estado: {a.status}</p>
              <div className="mt-3 flex gap-2">
                <Button variant="danger" onClick={() => setCancelTarget(a)}>
                  Cancelar
                </Button>
              </div>
            </li>
          ))}
          {active.length === 0 && (
            <li className="rounded-xl border border-border bg-white p-8 text-center shadow-card">
              <p className="text-text-muted">No tiene citas activas.</p>
              <Link
                to="/paciente/reservar"
                className="mt-3 inline-block rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-brand-hover"
              >
                Reservar una cita
              </Link>
            </li>
          )}
        </ul>
      )}

      <ConfirmDialog
        isOpen={cancelTarget !== null}
        onOpenChange={(open) => !open && setCancelTarget(null)}
        title="Cancelar cita"
        description={
          cancelTarget ? (
            <>
              ¿Está seguro que desea cancelar su cita del{" "}
              <strong>{formatDateTime(cancelTarget.startAt)}</strong> con{" "}
              {cancelTarget.practitionerName}? Esta acción no se puede deshacer.
            </>
          ) : null
        }
        confirmLabel="Cancelar cita"
        cancelLabel="Volver"
        loading={cancelMutation.isPending}
        onConfirm={() => {
          if (cancelTarget) cancelMutation.mutate(cancelTarget.id);
        }}
      />
    </PatientShell>
  );
}
