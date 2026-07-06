import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import type { AppointmentDto } from "@smoothflow/shared";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";

export default function PatientAppointmentsPage() {
  const { logout } = useAuth();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["my-appointments"],
    queryFn: () => api.get<{ items: AppointmentDto[] }>("/appointments"),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/appointments/${id}`, { status: "cancelado" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-appointments"] }),
  });

  const active = data?.items.filter((a) => a.status !== "cancelado") ?? [];

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-border bg-white px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <h1 className="text-xl font-bold text-brand">Mis citas</h1>
          <nav className="flex gap-4 text-sm">
            <Link to="/paciente/reservar" className="text-text-muted hover:text-brand">
              Reservar
            </Link>
            <button type="button" onClick={() => logout()} className="text-text-muted hover:text-brand">
              Salir
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        <ul className="space-y-4">
          {active.map((a) => (
            <li key={a.id} className="rounded-lg border border-border bg-white p-4">
              <p className="font-semibold">{formatDateTime(a.startAt)}</p>
              <p className="text-sm text-text-muted">
                {a.practitionerName} — {a.specialtyName}
              </p>
              <p className="mt-1 text-xs capitalize text-text-muted">Estado: {a.status}</p>
              <div className="mt-3 flex gap-2">
                <Button
                  variant="danger"
                  onClick={() => {
                    if (confirm("¿Cancelar esta cita?")) cancelMutation.mutate(a.id);
                  }}
                  loading={cancelMutation.isPending}
                >
                  Cancelar
                </Button>
              </div>
            </li>
          ))}
          {active.length === 0 && (
            <li className="text-text-muted">No tiene citas activas.</li>
          )}
        </ul>
      </main>
    </div>
  );
}
