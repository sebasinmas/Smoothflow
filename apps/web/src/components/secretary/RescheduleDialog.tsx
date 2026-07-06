import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import type { AvailabilitySlotDto } from "@smoothflow/shared";
import { AppointmentSlot } from "@/components/ui/AppointmentSlot";
import { Button } from "@/components/ui/Button";
import { SecretaryModal } from "@/components/secretary/SecretaryModal";
import { ApiError, api } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";

interface RescheduleDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentId: string;
  practitionerId: string;
  onSuccess?: () => void;
}

export function RescheduleDialog({
  isOpen,
  onOpenChange,
  appointmentId,
  practitionerId,
  onSuccess,
}: RescheduleDialogProps) {
  const queryClient = useQueryClient();
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlotDto | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setSelectedSlot(null);
      setError("");
    }
  }, [isOpen, appointmentId]);

  const from = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const to = useMemo(() => {
    const d = new Date(from);
    d.setDate(d.getDate() + 14);
    return d;
  }, [from]);

  const { data: availability, isLoading } = useQuery({
    queryKey: ["availability", practitionerId, "reschedule", appointmentId],
    enabled: isOpen && !!practitionerId,
    queryFn: () =>
      api.get<{ slots: AvailabilitySlotDto[] }>(
        `/availability?from=${from.toISOString()}&to=${to.toISOString()}&practitionerId=${practitionerId}`,
      ),
  });

  const availableSlots = availability?.slots.filter((s) => s.status === "disponible") ?? [];

  const rescheduleMutation = useMutation({
    mutationFn: async () => {
      if (!selectedSlot) throw new Error("Seleccione un horario");
      return api.patch(`/appointments/${appointmentId}`, {
        startAt: selectedSlot.startAt,
        endAt: selectedSlot.endAt,
        status: "reagendado",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["availability"] });
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : "No se pudo reagendar la cita");
    },
  });

  return (
    <SecretaryModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Reagendar cita"
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            loading={rescheduleMutation.isPending}
            disabled={!selectedSlot}
            onClick={() => {
              setError("");
              rescheduleMutation.mutate();
            }}
          >
            Confirmar reagendamiento
          </Button>
        </>
      }
    >
      {isLoading ? (
        <p className="text-sm text-text-muted" role="status">
          Buscando horarios disponibles…
        </p>
      ) : (
        <div className="grid max-h-64 gap-2 overflow-y-auto sm:grid-cols-2">
          {availableSlots.map((slot) => (
            <AppointmentSlot
              key={`${slot.startAt}-${slot.practitionerId}`}
              status="disponible"
              label={slot.practitionerName}
              time={formatDateTime(slot.startAt)}
              selected={selectedSlot?.startAt === slot.startAt}
              onClick={() => setSelectedSlot(slot)}
            />
          ))}
          {availableSlots.length === 0 && (
            <p className="text-sm text-text-muted">
              No hay horarios disponibles en las próximas 2 semanas.
            </p>
          )}
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
