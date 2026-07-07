import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { DoctorAction } from "@smoothflow/shared";
import { APPOINTMENT_STATUS_LABELS } from "@smoothflow/shared";
import type { CalendarEventItem } from "@/components/calendar/calendar-utils";
import { SecretaryModal } from "@/components/secretary/SecretaryModal";
import { Button } from "@/components/ui/Button";
import { AppTooltip } from "@/components/ui/Tooltip";
import { Input } from "@/components/ui/Input";
import { ApiError, api } from "@/lib/api";
import { TOOLTIPS } from "@/lib/tooltips";
import { formatDateTime } from "@/lib/utils";

interface DoctorAppointmentSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  event: CalendarEventItem | null;
}

const ATTENDANCE_WINDOW_MS = 15 * 60 * 1000;

export function DoctorAppointmentSheet({
  isOpen,
  onOpenChange,
  event,
}: DoctorAppointmentSheetProps) {
  const queryClient = useQueryClient();
  const [pendingAction, setPendingAction] = useState<DoctorAction | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const appointmentId = event?.appointmentId;

  const actionMutation = useMutation({
    mutationFn: ({ action, actionReason }: { action: DoctorAction; actionReason?: string }) => {
      if (!appointmentId) throw new Error("Cita no encontrada");
      return api.post(`/appointments/${appointmentId}/doctor-actions`, {
        action,
        reason: actionReason?.trim() || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["availability"] });
      setPendingAction(null);
      setReason("");
      setError("");
      onOpenChange(false);
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : "No se pudo registrar la acción");
    },
  });

  if (!event) return null;

  const status = event.appointmentStatus;
  const isActionable =
    Boolean(appointmentId) &&
    (status === "reservado" || status === "confirmado" || status === "reagendado");
  // Marcar asistencia solo tiene sentido cerca o después del inicio de la cita.
  const attendanceEnabled =
    isActionable && Date.now() >= new Date(event.startAt).getTime() - ATTENDANCE_WINDOW_MS;
  // No se puede cancelar una cita una vez iniciada la sesión.
  const sessionStarted = Date.now() >= new Date(event.startAt).getTime();
  const canRequestCancellation = isActionable && !sessionStarted;
  const cancellationReasonValid = reason.trim().length >= 10;

  const handleClose = (open: boolean) => {
    if (!open) {
      setPendingAction(null);
      setReason("");
      setError("");
    }
    onOpenChange(open);
  };

  const submitAction = (action: DoctorAction, actionReason?: string) => {
    setError("");
    actionMutation.mutate({ action, actionReason });
  };

  return (
    <SecretaryModal
      isOpen={isOpen}
      onOpenChange={handleClose}
      title="Detalle de cita"
      footer={
        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            size="lg"
            className="flex-1 sm:flex-none"
            onClick={() => handleClose(false)}
          >
            Cerrar
          </Button>
          {isActionable && pendingAction === null && (
            <>
              <AppTooltip
                content={!attendanceEnabled ? TOOLTIPS.doctor.actionWindow : TOOLTIPS.doctor.markAttended}
              >
                <span className="inline-flex flex-1 sm:flex-none">
                  <Button
                    size="lg"
                    className="w-full"
                    disabled={!attendanceEnabled}
                    loading={actionMutation.isPending}
                    onClick={() => submitAction("atendido")}
                  >
                    Todo bien
                  </Button>
                </span>
              </AppTooltip>
              <AppTooltip
                content={!attendanceEnabled ? TOOLTIPS.doctor.actionWindow : TOOLTIPS.doctor.markNoShow}
              >
                <span className="inline-flex flex-1 sm:flex-none">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="w-full"
                    disabled={!attendanceEnabled}
                    loading={actionMutation.isPending}
                    onClick={() => submitAction("no_asistio")}
                  >
                    El paciente no llegó
                  </Button>
                </span>
              </AppTooltip>
              {canRequestCancellation && (
                <AppTooltip content={TOOLTIPS.doctor.requestCancel}>
                  <Button
                    variant="danger"
                    size="lg"
                    className="flex-1 sm:flex-none"
                    onClick={() => setPendingAction("solicitar_cancelacion")}
                  >
                    Cancelar hora
                  </Button>
                </AppTooltip>
              )}
            </>
          )}
          {pendingAction === "solicitar_cancelacion" && (
            <>
              <Button
                variant="secondary"
                size="lg"
                className="flex-1 sm:flex-none"
                onClick={() => {
                  setPendingAction(null);
                  setReason("");
                }}
              >
                Volver
              </Button>
              <Button
                variant="danger"
                size="lg"
                className="flex-1 sm:flex-none"
                disabled={!cancellationReasonValid}
                loading={actionMutation.isPending}
                onClick={() => submitAction("solicitar_cancelacion", reason)}
              >
                Enviar solicitud
              </Button>
            </>
          )}
        </div>
      }
    >
      <dl className="grid gap-2 text-sm">
        <div>
          <dt className="text-text-muted">Horario</dt>
          <dd className="font-medium">{formatDateTime(event.startAt)}</dd>
        </div>
        <div>
          <dt className="text-text-muted">Paciente</dt>
          <dd className="font-medium">{event.patientName ?? event.label}</dd>
        </div>
        {event.specialtyName && (
          <div>
            <dt className="text-text-muted">Especialidad</dt>
            <dd className="font-medium">{event.specialtyName}</dd>
          </div>
        )}
        <div>
          <dt className="text-text-muted">Estado</dt>
          <dd className="font-medium">
            {status ? APPOINTMENT_STATUS_LABELS[status] : "Reservado"}
          </dd>
        </div>
        {status === "cancelacion_pendiente" && event.requestReason && (
          <div>
            <dt className="text-text-muted">Motivo de la solicitud</dt>
            <dd className="font-medium">{event.requestReason}</dd>
          </div>
        )}
      </dl>

      {isActionable && !attendanceEnabled && pendingAction === null && (
        <p className="mt-3 text-xs text-text-muted">
          Las acciones de asistencia se habilitan 15 minutos antes del inicio de la cita.
          {canRequestCancellation
            ? ' Para cancelar antes, use "Cancelar hora".'
            : ""}
        </p>
      )}

      {isActionable && sessionStarted && pendingAction === null && (
        <p className="mt-3 text-xs text-text-muted">
          La cita ya inició; no es posible cancelarla. Registre la asistencia del paciente.
        </p>
      )}

      {status === "cancelacion_pendiente" && (
        <p className="mt-3 rounded-lg bg-orange-50 px-3 py-2 text-sm text-orange-900">
          Su solicitud de cancelación está pendiente de aprobación por la secretaría.
        </p>
      )}

      {pendingAction === "solicitar_cancelacion" && (
        <div className="mt-4 grid gap-2">
          <Input
            label="Motivo de la cancelación"
            icon={null}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Describa el motivo (mínimo 10 caracteres)"
            maxLength={300}
          />
          <p className="text-xs text-text-muted">
            La secretaría debe aprobar esta solicitud antes de que la cita se cancele.
          </p>
        </div>
      )}

      {error && (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </SecretaryModal>
  );
}
