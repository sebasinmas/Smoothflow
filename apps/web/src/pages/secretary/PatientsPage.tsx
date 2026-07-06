import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { PatientDto } from "@smoothflow/shared";
import { SecretaryShell } from "@/components/layout/SecretaryShell";
import { CreatePatientDrawer } from "@/components/secretary/CreatePatientDrawer";
import { CreateReservationDialog } from "@/components/secretary/CreateReservationDialog";
import { Button } from "@/components/ui/Button";
import { AppTooltip } from "@/components/ui/Tooltip";
import { LoadingState } from "@/components/ui/LoadingState";
import { api } from "@/lib/api";
import { formatDateTime, formatPersonName } from "@/lib/utils";
import { TOOLTIPS } from "@/lib/tooltips";

function PortalAccessBadge({ hasPortalAccess }: { hasPortalAccess: boolean }) {
  const tooltip = hasPortalAccess
    ? TOOLTIPS.secretary.portalAccess
    : TOOLTIPS.secretary.noPortalAccess;

  return (
    <AppTooltip content={tooltip}>
      <span
        className={`inline-flex cursor-help rounded-full px-2 py-0.5 text-xs font-medium ${
          hasPortalAccess
            ? "bg-slot-reserved text-brand"
            : "bg-surface-muted text-text-muted"
        }`}
      >
        {hasPortalAccess ? "Con acceso portal" : "Sin acceso portal"}
      </span>
    </AppTooltip>
  );
}

export default function SecretaryPatientsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [reservationPatientId, setReservationPatientId] = useState<string | undefined>();
  const [reservationOpen, setReservationOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["patients"],
    queryFn: () => api.get<{ items: PatientDto[] }>("/patients"),
  });

  return (
    <SecretaryShell title="Gestión de pacientes">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-2xl text-text-muted">
          Administre pacientes y cree citas en su representación. La ficha permite agendar citas; el
          paciente puede crear su cuenta en el portal cuando lo desee.
        </p>
        <Button size="lg" onClick={() => setCreateOpen(true)}>
          Nuevo paciente
        </Button>
      </div>

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
                  <AppTooltip content={TOOLTIPS.secretary.portalColumn}>
                    <span className="cursor-help">Portal</span>
                  </AppTooltip>
                </th>
                <th className="px-4 py-3 font-semibold" scope="col">
                  Email
                </th>
                <th className="px-4 py-3 font-semibold" scope="col">
                  Teléfono
                </th>
                <th className="px-4 py-3 font-semibold" scope="col">
                  <AppTooltip content={TOOLTIPS.secretary.registeredColumn}>
                    <span className="cursor-help">Registrado</span>
                  </AppTooltip>
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
                      size="sm"
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

      <CreatePatientDrawer isOpen={createOpen} onOpenChange={setCreateOpen} />
      <CreateReservationDialog
        isOpen={reservationOpen}
        onOpenChange={setReservationOpen}
        preset={{ patientId: reservationPatientId }}
      />
    </SecretaryShell>
  );
}
