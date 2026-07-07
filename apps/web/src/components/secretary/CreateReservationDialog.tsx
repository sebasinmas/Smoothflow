import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import type { AvailabilitySlotDto, PatientDto } from "@smoothflow/shared";
import { AppointmentSlot } from "@/components/ui/AppointmentSlot";
import { Input } from "@/components/ui/Input";
import { FieldHint } from "@/components/ui/FieldHint";
import { Select } from "@/components/ui/Select";
import { FormDialogFooter } from "@/components/secretary/FormDialogFooter";
import { AppDrawer } from "@/components/ui/AppDrawer";
import { ApiError, api } from "@/lib/api";
import { formatDateTime, formatPersonName } from "@/lib/utils";
import { TOOLTIPS } from "@/lib/tooltips";

export interface ReservationPreset {
  practitionerId?: string;
  startAt?: string;
  endAt?: string;
  patientId?: string;
}

interface CreateReservationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  preset?: ReservationPreset;
}

function presetKey(preset?: ReservationPreset): string {
  if (!preset) return "empty";
  return [preset.patientId, preset.practitionerId, preset.startAt, preset.endAt].join("|");
}

function initialSelectedSlot(preset?: ReservationPreset): AvailabilitySlotDto | null {
  if (preset?.startAt && preset?.endAt && preset?.practitionerId) {
    return {
      startAt: preset.startAt,
      endAt: preset.endAt,
      practitionerId: preset.practitionerId,
      practitionerName: "",
      specialtyId: "",
      specialtyName: "",
      status: "disponible",
    };
  }
  return null;
}

function CreateReservationDialogActive({
  preset,
  onOpenChange,
}: {
  preset?: ReservationPreset;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [patientId, setPatientId] = useState(preset?.patientId ?? "");
  const [practitionerId, setPractitionerId] = useState(preset?.practitionerId ?? "");
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlotDto | null>(
    () => initialSelectedSlot(preset),
  );
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const { data: patients } = useQuery({
    queryKey: ["patients"],
    queryFn: () => api.get<{ items: PatientDto[] }>("/patients"),
  });

  const { data: practitioners } = useQuery({
    queryKey: ["practitioners"],
    queryFn: () =>
      api.get<{ items: Array<{ id: string; givenName: string; familyName: string }> }>(
        "/owner/practitioners",
      ),
  });

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

  const { data: availability, isLoading: loadingSlots } = useQuery({
    queryKey: ["availability", practitionerId, "reservation-dialog"],
    enabled: !!practitionerId,
    queryFn: () =>
      api.get<{ slots: AvailabilitySlotDto[] }>(
        `/availability?from=${from.toISOString()}&to=${to.toISOString()}&practitionerId=${practitionerId}`,
      ),
  });

  const availableSlots = availability?.slots.filter((s) => s.status === "disponible") ?? [];

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!patientId) throw new Error("Seleccione un paciente");
      if (!selectedSlot) throw new Error("Seleccione un horario");
      return api.post("/appointments", {
        patientId,
        practitionerId: selectedSlot.practitionerId,
        startAt: selectedSlot.startAt,
        endAt: selectedSlot.endAt,
        notes: notes || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["availability"] });
      onOpenChange(false);
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : "No se pudo crear la reserva");
    },
  });

  const patientOptions = [
    { value: "", label: "Seleccionar paciente…" },
    ...(patients?.items.map((p) => ({
      value: p.id,
      label: formatPersonName(p.givenName, p.familyName),
    })) ?? []),
  ];

  const practitionerOptions = [
    { value: "", label: "Seleccionar médico…" },
    ...(practitioners?.items.map((p) => ({
      value: p.id,
      label: formatPersonName(p.givenName, p.familyName),
    })) ?? []),
  ];

  return (
    <AppDrawer
      isOpen
      onOpenChange={onOpenChange}
      title="Crear reservación"
      description="Seleccione paciente, médico y horario disponible."
      footer={
        <FormDialogFooter
          onCancel={() => onOpenChange(false)}
          submitLabel="Confirmar reserva"
          loading={createMutation.isPending}
          submitDisabled={!patientId || !selectedSlot}
          onSubmit={() => {
            setError("");
            createMutation.mutate();
          }}
        />
      }
    >
      <div className="grid gap-4">
        <Select
          label="Paciente"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          options={patientOptions}
        />
        <Select
          label="Médico"
          value={practitionerId}
          onChange={(e) => {
            setPractitionerId(e.target.value);
            setSelectedSlot(null);
          }}
          options={practitionerOptions}
        />
        {practitionerId && (
          <div>
            <p className="mb-2 text-sm font-medium text-text">Horario disponible</p>
            {loadingSlots ? (
              <p className="text-sm text-text-muted" role="status">
                Buscando horarios…
              </p>
            ) : (
              <div className="grid max-h-48 gap-2 overflow-y-auto sm:grid-cols-2">
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
          </div>
        )}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <label htmlFor="reservation-notes" className="text-sm font-medium text-text">
              Notas (opcional)
            </label>
            <FieldHint content={TOOLTIPS.secretary.reservationNotes} />
          </div>
          <Input
            id="reservation-notes"
            label="Notas (opcional)"
            hideLabel
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    </AppDrawer>
  );
}

export function CreateReservationDialog({
  isOpen,
  onOpenChange,
  preset,
}: CreateReservationDialogProps) {
  if (!isOpen) return null;

  return (
    <CreateReservationDialogActive
      key={presetKey(preset)}
      preset={preset}
      onOpenChange={onOpenChange}
    />
  );
}
