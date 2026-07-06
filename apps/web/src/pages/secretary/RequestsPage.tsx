import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SecretaryShell } from "@/components/layout/SecretaryShell";
import { api } from "@/lib/api";
import type { AppointmentDto } from "@smoothflow/shared";
import { formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export default function SecretaryRequestsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["appointments"],
    queryFn: () => api.get<{ items: AppointmentDto[] }>("/appointments"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => api.patch(`/appointments/${id}`, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["appointments"] }),
  });

  const pendingRequests = data?.items.filter((a) => !!a.pendingReschedule) ?? [];

  return (
    <SecretaryShell title="Solicitudes de Reagendamiento">
      {isLoading ? (
        <p className="text-text-muted">Cargando solicitudes...</p>
      ) : pendingRequests.length === 0 ? (
        <div className="rounded-xl border border-border bg-white p-8 text-center shadow-card">
          <p className="text-text-muted">No hay solicitudes pendientes.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {pendingRequests.map((a) => (
            <li key={a.id} className="rounded-xl border border-border bg-white p-4 shadow-card">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-semibold text-lg">{a.patientName}</p>
                  <p className="text-sm text-text-muted">Médico: {a.practitionerName}</p>

                  <div className="mt-4 grid grid-cols-2 gap-4 rounded-lg bg-background p-3">
                    <div>
                      <p className="text-xs font-semibold text-text-muted uppercase">Horario Original</p>
                      <p className="text-sm text-text line-through">{formatDateTime(a.startAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-brand uppercase">Nuevo Horario</p>
                      <p className="text-sm font-semibold text-brand">{formatDateTime(a.pendingReschedule!.startAt)}</p>
                    </div>
                  </div>
                </div>
                <div className="flex sm:flex-col gap-2">
                  <Button
                    variant="primary"
                    onClick={() =>
                      updateMutation.mutate({
                        id: a.id,
                        payload: {
                          startAt: a.pendingReschedule!.startAt,
                          endAt: a.pendingReschedule!.endAt,
                          status: "confirmado",
                          pendingReschedule: null,
                        },
                      })
                    }
                  >
                    Aprobar
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() =>
                      updateMutation.mutate({
                        id: a.id,
                        payload: { pendingReschedule: null },
                      })
                    }
                  >
                    Rechazar
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </SecretaryShell>
  );
}
