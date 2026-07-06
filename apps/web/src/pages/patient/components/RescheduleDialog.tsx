import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Dialog, DialogTrigger, Modal, ModalOverlay, Heading } from "react-aria-components";
import type { AppointmentDto, AvailabilitySlotDto } from "@smoothflow/shared";
import { AppointmentSlot } from "@/components/ui/AppointmentSlot";
import { Button } from "@/components/ui/Button";
import { AppTooltip } from "@/components/ui/Tooltip";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import { TOOLTIPS } from "@/lib/tooltips";

interface RescheduleDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: AppointmentDto | null;
}

export function RescheduleDialog({ isOpen, onOpenChange, appointment }: RescheduleDialogProps) {
  const queryClient = useQueryClient();
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlotDto | null>(null);

  const from = new Date();
  from.setHours(0, 0, 0, 0);
  const to = new Date(from);
  to.setDate(to.getDate() + 14);

  const { data: availability, isLoading } = useQuery({
    queryKey: ["availability", appointment?.practitionerId],
    enabled: isOpen && !!appointment,
    queryFn: () =>
      api.get<{ slots: AvailabilitySlotDto[] }>(
        `/availability?from=${from.toISOString()}&to=${to.toISOString()}&practitionerId=${appointment!.practitionerId}`,
      ),
  });

  const rescheduleMutation = useMutation({
    mutationFn: async () => {
      if (!appointment || !selectedSlot) return;
      return api.patch(`/appointments/${appointment.id}`, {
        startAt: selectedSlot.startAt,
        endAt: selectedSlot.endAt,
        status: "reagendado",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-appointments"] });
      onOpenChange(false);
      setSelectedSlot(null);
    },
  });

  const availableSlots = availability?.slots.filter((s) => s.status === "disponible") ?? [];

  return (
    <DialogTrigger isOpen={isOpen} onOpenChange={(open) => {
      if (!open) setSelectedSlot(null);
      onOpenChange(open);
    }}>
      <ModalOverlay
        className="fixed inset-0 z-modal flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm entering:animate-in entering:fade-in exiting:animate-out exiting:fade-out"
        isDismissable
      >
        <Modal className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-white shadow-xl entering:animate-in entering:fade-in entering:zoom-in-95 exiting:animate-out exiting:fade-out exiting:zoom-out-95">
          <Dialog className="outline-none">
            {({ close }) => (
              <div className="p-6">
                <Heading slot="title" className="text-xl font-semibold text-text">
                  Reagendar cita con {appointment?.practitionerName}
                </Heading>
                <div className="mt-2 text-sm text-text-muted">
                  Seleccione un nuevo horario para su cita original del {appointment ? formatDateTime(appointment.startAt) : ""}.
                </div>

                <div className="mt-6">
                  {isLoading ? (
                    <p className="text-text-muted">Buscando horarios disponibles…</p>
                  ) : (
                    <div className="grid gap-2 sm:grid-cols-2">
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
                        <p className="text-text-muted">No hay horarios disponibles en las próximas 2 semanas.</p>
                      )}
                    </div>
                  )}
                </div>

                {rescheduleMutation.isError && (
                  <p className="mt-3 text-sm text-red-600" role="alert">
                    {rescheduleMutation.error instanceof Error
                      ? rescheduleMutation.error.message
                      : "No se pudo reagendar la reserva. Puede que esté fuera del plazo permitido (24h). Contacte a la clínica."}
                  </p>
                )}

                <div className="mt-6 flex justify-end gap-3">
                  <Button variant="secondary" onClick={close} disabled={rescheduleMutation.isPending}>
                    Cancelar
                  </Button>
                  <AppTooltip content={TOOLTIPS.patient.rescheduleRequest}>
                    <Button
                      loading={rescheduleMutation.isPending}
                      disabled={!selectedSlot}
                      onClick={() => rescheduleMutation.mutate()}
                    >
                      Enviar solicitud de nuevo horario
                    </Button>
                  </AppTooltip>
                </div>
              </div>
            )}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  );
}
