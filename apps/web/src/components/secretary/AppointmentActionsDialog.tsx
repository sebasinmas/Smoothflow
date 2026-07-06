import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { CalendarEventItem } from "@/components/calendar/calendar-utils";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import { SecretaryModal } from "@/components/secretary/SecretaryModal";
import { RescheduleDialog } from "@/components/secretary/RescheduleDialog";
import { ApiError, api } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import { APPOINTMENT_STATUS_LABELS, SLOT_STATUS_LABELS } from "@smoothflow/shared";

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
  const [cancelReason, setCancelReason] = useState("");
  const [reviewNote, setReviewNote] = useState("");
  const [error, setError] = useState("");

  const appointmentId = event?.appointmentId;

  const cancelMutation = useMutation({
    mutationFn: () => {
      if (!appointmentId) throw new Error("Cita no encontrada");
      return api.patch(`/appointments/${appointmentId}`, {
        status: "cancelado",
        notes: cancelReason.trim() || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["availability"] });
      setShowCancelConfirm(false);
      setCancelReason("");
      onOpenChange(false);
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : "No se pudo cancelar la cita");
    },
  });

  const reviewMutation = useMutation({
    mutationFn: (decision: "aprobar" | "rechazar") => {
      if (!appointmentId) throw new Error("Cita no encontrada");
      return api.patch(`/appointments/${appointmentId}/review-request`, {
        decision,
        note: reviewNote.trim(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["availability"] });
      setReviewNote("");
      onOpenChange(false);
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : "No se pudo procesar la solicitud");
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
  const isPendingCancellation = event.appointmentStatus === "cancelacion_pendiente";
  const patientName = event.patientName ?? (isBlocked ? undefined : event.label);
  const practitionerName = event.practitionerName ?? (isBlocked ? event.label : undefined);
  const reviewNoteValid = reviewNote.trim().length >= 5;

  return (
    <>
      <SecretaryModal
        isOpen={isOpen && !showReschedule}
        onOpenChange={onOpenChange}
        title={isBlocked ? "Bloqueo de agenda" : "Detalle de cita"}
        footer={
          isPendingCancellation ? (
            <div className="flex flex-wrap gap-3">
              <Button
                variant="secondary"
                size="lg"
                className="flex-1 sm:flex-none"
                onClick={() => onOpenChange(false)}
              >
                Cerrar
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="flex-1 sm:flex-none"
                disabled={!reviewNoteValid}
                loading={reviewMutation.isPending}
                onClick={() => {
                  setError("");
                  reviewMutation.mutate("rechazar");
                }}
              >
                Rechazar
              </Button>
              <Button
                variant="danger"
                size="lg"
                className="flex-1 sm:flex-none"
                disabled={!reviewNoteValid}
                loading={reviewMutation.isPending}
                onClick={() => {
                  setError("");
                  reviewMutation.mutate("aprobar");
                }}
              >
                Aprobar cancelación
              </Button>
            </div>
          ) : isBlocked ? (
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" size="lg" className="flex-1 sm:flex-none" onClick={() => onOpenChange(false)}>
                Cerrar
              </Button>
              <Button variant="danger" size="lg" className="flex-1 sm:flex-none" onClick={() => setShowUnblockConfirm(true)}>
                Levantar bloqueo
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" size="lg" className="flex-1 sm:flex-none" onClick={() => onOpenChange(false)}>
                Cerrar
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="flex-1 sm:flex-none"
                disabled={!appointmentId || !event.practitionerId}
                onClick={() => setShowReschedule(true)}
              >
                Reagendar
              </Button>
              <Button variant="danger" size="lg" className="flex-1 sm:flex-none" disabled={!appointmentId} onClick={() => setShowCancelConfirm(true)}>
                Cancelar cita
              </Button>
            </div>
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
            <dd className="font-medium">
              {event.appointmentStatus
                ? APPOINTMENT_STATUS_LABELS[event.appointmentStatus]
                : SLOT_STATUS_LABELS[event.status]}
            </dd>
          </div>
        </dl>

        {isPendingCancellation && (
          <div className="mt-4 grid gap-3 rounded-lg border border-orange-200 bg-orange-50 p-3">
            <div>
              <p className="text-sm font-semibold text-orange-900">
                Solicitud de cancelación del médico
              </p>
              <p className="mt-1 text-sm text-orange-900/90">
                {event.requestReason ?? "Sin motivo registrado"}
              </p>
            </div>
            <Input
              label="Motivo de la revisión"
              icon={null}
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              placeholder="Indique el motivo de su decisión (mínimo 5 caracteres)"
              maxLength={300}
            />
          </div>
        )}

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
        onOpenChange={(open) => {
          setShowCancelConfirm(open);
          if (!open) setCancelReason("");
        }}
        title="Cancelar cita"
        description={
          <div className="grid gap-3">
            <p>
              ¿Está seguro que desea cancelar la cita del{" "}
              <strong>{formatDateTime(event.startAt)}</strong>
              {patientName ? (
                <>
                  {" "}
                  con <strong>{patientName}</strong>
                </>
              ) : null}
              ?
            </p>
            <Input
              label="Motivo de la cancelación"
              icon={null}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Ej: solicitado por el paciente"
              maxLength={300}
            />
          </div>
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
