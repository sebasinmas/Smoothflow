import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { PatientDto } from "@smoothflow/shared";
import { AppShell } from "@/components/layout/AppShell";
import { CreateReservationDialog } from "@/components/secretary/CreateReservationDialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LoadingState } from "@/components/ui/LoadingState";
import { api, ApiError } from "@/lib/api";
import { formatDateTime, formatPersonName } from "@/lib/utils";
import { SECRETARIA_NAV } from "@/lib/navigation";

function PortalAccessBadge({ hasPortalAccess }: { hasPortalAccess: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
        hasPortalAccess
          ? "bg-slot-reserved text-brand"
          : "bg-surface-muted text-text-muted"
      }`}
    >
      {hasPortalAccess ? "Con acceso portal" : "Sin acceso portal"}
    </span>
  );
}

export default function SecretaryPatientsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [reservationPatientId, setReservationPatientId] = useState<string | undefined>();
  const [reservationOpen, setReservationOpen] = useState(false);
  const [givenName, setGivenName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [formError, setFormError] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["patients"],
    queryFn: () => api.get<{ items: PatientDto[] }>("/patients"),
  });

  const createMutation = useMutation({
    mutationFn: (body: { givenName: string; familyName: string; email?: string; phone?: string }) =>
      api.post("/patients", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      setShowForm(false);
      setGivenName("");
      setFamilyName("");
      setEmail("");
      setPhone("");
      setFormError("");
    },
    onError: (err) => {
      setFormError(err instanceof ApiError ? err.message : "No se pudo guardar el paciente");
    },
  });

  return (
    <AppShell role="secretaria" navItems={SECRETARIA_NAV} title="Gestión de pacientes" showNotifications>
      <div className="mb-6 flex items-center justify-between gap-4">
        <p className="text-text-muted">
          Administre pacientes y cree citas en su representación. La ficha permite agendar citas; el
          paciente puede crear su cuenta en el portal cuando lo desee.
        </p>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancelar" : "Nuevo paciente"}
        </Button>
      </div>

      {showForm && (
        <form
          className="mb-8 grid max-w-xl gap-4 rounded-lg border border-border bg-white p-6"
          onSubmit={(e) => {
            e.preventDefault();
            setFormError("");
            createMutation.mutate({ givenName, familyName, email: email || undefined, phone: phone || undefined });
          }}
        >
          <Input label="Nombre" value={givenName} onChange={(e) => setGivenName(e.target.value)} required />
          <Input label="Apellido" value={familyName} onChange={(e) => setFamilyName(e.target.value)} required />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label="Teléfono" value={phone} onChange={(e) => setPhone(e.target.value)} />
          {formError && (
            <p className="text-sm text-red-600" role="alert">
              {formError}
            </p>
          )}
          <Button type="submit" loading={createMutation.isPending}>
            Guardar paciente
          </Button>
        </form>
      )}

      {isLoading ? (
        <LoadingState message="Cargando pacientes…" />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-surface-muted">
              <tr>
                <th className="px-4 py-3 font-semibold" scope="col">
                  Paciente
                </th>
                <th className="px-4 py-3 font-semibold" scope="col">
                  Portal
                </th>
                <th className="px-4 py-3 font-semibold" scope="col">
                  Email
                </th>
                <th className="px-4 py-3 font-semibold" scope="col">
                  Teléfono
                </th>
                <th className="px-4 py-3 font-semibold" scope="col">
                  Registrado
                </th>
                <th className="px-4 py-3 font-semibold" scope="col">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">{formatPersonName(p.givenName, p.familyName)}</td>
                  <td className="px-4 py-3">
                    <PortalAccessBadge hasPortalAccess={p.hasPortalAccess} />
                  </td>
                  <td className="px-4 py-3">{p.email ?? "—"}</td>
                  <td className="px-4 py-3">{p.phone ?? "—"}</td>
                  <td className="px-4 py-3">{formatDateTime(p.createdAt)}</td>
                  <td className="px-4 py-3">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setReservationPatientId(p.id);
                        setReservationOpen(true);
                      }}
                    >
                      Reservar cita
                    </Button>
                  </td>
                </tr>
              ))}
              {data?.items.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-text-muted">
                    Aún no hay pacientes registrados. Use &quot;Nuevo paciente&quot; para agregar el primero.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <CreateReservationDialog
        isOpen={reservationOpen}
        onOpenChange={setReservationOpen}
        preset={{ patientId: reservationPatientId }}
      />
    </AppShell>
  );
}
