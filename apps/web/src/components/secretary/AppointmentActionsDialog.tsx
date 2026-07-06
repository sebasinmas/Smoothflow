import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { CalendarEventItem } from "@/components/calendar/calendar-utils";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SecretaryModal } from "@/components/secretary/SecretaryModal";
import { RescheduleDialog } from "@/components/secretary/RescheduleDialog";
import { ApiError, api } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import { SLOT_STATUS_LABELS } from "@smoothflow/shared";

interface AppointmentActionsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  event: CalendarEventItem | null;
}

export function AppointmentActionsDialog({
  isOpen,
  onOpenChange,
  event,
}: AppointmentActionsDialogProps) {
  const queryClient = useQueryClient();
  const [showReschedule, setShowReschedule] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showUnblockConfirm, setShowUnblockConfirm] = useState(false);
  const [error, setError] = useState("");

  const appointmentId = event?.appointmentId;

  const cancelMutation = useMutation({
    mutationFn: () => {
      if (!appointmentId) throw new Error("Cita no encontrada");
      return api.patch(`/appointments/${appointmentId}`, { status: "cancelado" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["availability"] });
      setShowCancelConfirm(false);
      onOpenChange(false);
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : "No se pudo cancelar la cita");
    },
  });

  const unblockMutation = useMutation({
    mutationFn: () => {
      if (!appointmentId) throw new Error("Bloqueo no encontrado");
      return api.patch(`/appointments/${appointmentId}`, { status: "cancelado" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["availability"] });
      setShowUnblockConfirm(false);
      onOpenChange(false);
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : "No se pudo levantar el bloqueo");
    },
  });

  if (!event) return null;

  const isBlocked = event.status === "bloqueado";
  const patientName = event.patientName ?? (isBlocked ? undefined : event.label);
  const practitionerName = event.practitionerName ?? (isBlocked ? event.label : undefined);

  return (
    <>
      <SecretaryModal
        isOpen={isOpen && !showReschedule}
        onOpenChange={onOpenChange}
        title={isBlocked ? "Bloqueo de agenda" : "Detalle de cita"}
        footer={
          isBlocked ? (
            <>
              <Button variant="secondary" onClick={() => onOpenChange(false)}>
                Cerrar
              </Button>
              <Button variant="danger" onClick={() => setShowUnblockConfirm(true)}>
                Levantar bloqueo
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" onClick={() => onOpenChange(false)}>
                Cerrar
              </Button>
              <Button
                variant="secondary"
                disabled={!appointmentId || !event.practitionerId}
                onClick={() => setShowReschedule(true)}
              >
                Reagendar
              </Button>
              <Button variant="danger" disabled={!appointmentId} onClick={() => setShowCancelConfirm(true)}>
                Cancelar cita
              </Button>
            </>
          )
        }
      >
        <dl className="grid gap-2 text-sm">
          <div>
            <dt className="text-text-muted">Horario</dt>
            <dd className="font-medium">{formatDateTime(event.startAt)}</dd>
          </div>
          {isBlocked ? (
            <div>
              <dt className="text-text-muted">Médico</dt>
              <dd className="font-medium">{practitionerName}</dd>
            </div>
          ) : (
            <>
              <div>
                <dt className="text-text-muted">Paciente</dt>
                <dd className="font-medium">{patientName}</dd>
              </div>
              {practitionerName && (
                <div>
                  <dt className="text-text-muted">Médico</dt>
                  <dd className="font-medium">{practitionerName}</dd>
                </div>
              )}
            </>
          )}
          {event.specialtyName && (
            <div>
              <dt className="text-text-muted">Especialidad</dt>
              <dd className="font-medium">{event.specialtyName}</dd>
            </div>
          )}
          {isBlocked && event.sublabel && (
            <div>
              <dt className="text-text-muted">Motivo</dt>
              <dd className="font-medium">{event.sublabel}</dd>
            </div>
          )}
          <div>
            <dt className="text-text-muted">Estado</dt>
            <dd className="font-medium capitalize">{SLOT_STATUS_LABELS[event.status]}</dd>
          </div>
        </dl>
        {error && (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </SecretaryModal>

      {appointmentId && event.practitionerId && (
        <RescheduleDialog
          isOpen={showReschedule}
          onOpenChange={setShowReschedule}
          appointmentId={appointmentId}
          practitionerId={event.practitionerId}
          onSuccess={() => onOpenChange(false)}
        />
      )}

      <ConfirmDialog
        isOpen={showCancelConfirm}
        onOpenChange={setShowCancelConfirm}
        title="Cancelar cita"
        description={
          <>
            ¿Está seguro que desea cancelar la cita del{" "}
            <strong>{formatDateTime(event.startAt)}</strong>
            {patientName ? (
              <>
                {" "}
                con <strong>{patientName}</strong>
              </>
            ) : null}
            ?
          </>
        }
        confirmLabel="Cancelar cita"
        cancelLabel="Volver"
        loading={cancelMutation.isPending}
        onConfirm={() => cancelMutation.mutate()}
      />

      <ConfirmDialog
        isOpen={showUnblockConfirm}
        onOpenChange={setShowUnblockConfirm}
        title="Levantar bloqueo"
        description={
          <>
            ¿Desea levantar el bloqueo del{" "}
            <strong>{formatDateTime(event.startAt)}</strong>? El horario volverá a estar disponible.
          </>
        }
        confirmLabel="Levantar bloqueo"
        cancelLabel="Volver"
        loading={unblockMutation.isPending}
        onConfirm={() => unblockMutation.mutate()}
      />
    </>
  );
}
