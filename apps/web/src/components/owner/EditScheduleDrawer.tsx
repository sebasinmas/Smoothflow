import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { ScheduleTemplateDto } from "@smoothflow/shared";
import { toast } from "sonner";
import { FormDialogFooter } from "@/components/secretary/FormDialogFooter";
import { AppDrawer } from "@/components/ui/AppDrawer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ApiError, api } from "@/lib/api";

const DAYS = [
  { value: "1", label: "Lunes" },
  { value: "2", label: "Martes" },
  { value: "3", label: "Miércoles" },
  { value: "4", label: "Jueves" },
  { value: "5", label: "Viernes" },
];

export interface ScheduleDrawerPreset {
  dayOfWeek: number;
  startTime: string;
  endTime?: string;
}

interface EditScheduleDrawerProps {
  practitionerId: string;
  schedule: ScheduleTemplateDto | null;
  preset?: ScheduleDrawerPreset;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

function EditScheduleDrawerActive({
  practitionerId,
  schedule,
  preset,
  onOpenChange,
}: {
  practitionerId: string;
  schedule: ScheduleTemplateDto | null;
  preset?: ScheduleDrawerPreset;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const isEdit = schedule !== null;

  const [dayOfWeek, setDayOfWeek] = useState(
    String(schedule?.dayOfWeek ?? preset?.dayOfWeek ?? 1),
  );
  const [startTime, setStartTime] = useState(schedule?.startTime ?? preset?.startTime ?? "09:00");
  const [endTime, setEndTime] = useState(
    schedule?.endTime ??
      preset?.endTime ??
      (preset?.startTime ? addHours(preset.startTime, 2) : "17:00"),
  );
  const [slotDurationMinutes, setSlotDurationMinutes] = useState(
    String(schedule?.slotDurationMinutes ?? 30),
  );
  const [formError, setFormError] = useState("");

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["schedules"] });
    queryClient.invalidateQueries({ queryKey: ["availability"] });
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const body = {
        dayOfWeek: Number(dayOfWeek),
        startTime,
        endTime,
        slotDurationMinutes: Number(slotDurationMinutes),
      };
      if (isEdit && schedule) {
        return api.patch<{ schedule: ScheduleTemplateDto }>(
          `/owner/schedules/${schedule.id}`,
          body,
        );
      }
      return api.post<{ schedule: ScheduleTemplateDto }>("/owner/schedules", {
        practitionerId,
        ...body,
      });
    },
    onSuccess: () => {
      invalidate();
      toast.success(isEdit ? "Horario actualizado" : "Horario creado");
      onOpenChange(false);
    },
    onError: (err) => {
      const message = err instanceof ApiError ? err.message : "No se pudo guardar el horario";
      setFormError(message);
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/owner/schedules/${schedule!.id}`),
    onSuccess: () => {
      invalidate();
      toast.success("Horario eliminado");
      onOpenChange(false);
    },
    onError: (err) => {
      const message = err instanceof ApiError ? err.message : "No se pudo eliminar el horario";
      toast.error(message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    saveMutation.mutate();
  };

  return (
    <AppDrawer
      isOpen
      onOpenChange={onOpenChange}
      title={isEdit ? "Editar horario" : "Nuevo horario"}
      description="Defina el bloque de atención para el día seleccionado."
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3">
          {isEdit && (
            <Button
              type="button"
              variant="danger"
              onClick={() => deleteMutation.mutate()}
              loading={deleteMutation.isPending}
              disabled={saveMutation.isPending}
            >
              Eliminar
            </Button>
          )}
          <div className={isEdit ? "ml-auto" : "w-full flex justify-end"}>
            <FormDialogFooter
              onCancel={() => onOpenChange(false)}
              submitLabel={isEdit ? "Guardar cambios" : "Crear horario"}
              submitType="submit"
              form="edit-schedule-form"
              loading={saveMutation.isPending}
            />
          </div>
        </div>
      }
    >
      <form id="edit-schedule-form" className="grid gap-4" onSubmit={handleSubmit}>
        <Select
          label="Día"
          value={dayOfWeek}
          onChange={(e) => setDayOfWeek(e.target.value)}
          options={DAYS}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Inicio"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
          <Input
            label="Fin"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </div>
        <Select
          label="Duración de cada cita (min)"
          value={slotDurationMinutes}
          onChange={(e) => setSlotDurationMinutes(e.target.value)}
          options={[
            { value: "15", label: "15 minutos" },
            { value: "30", label: "30 minutos" },
            { value: "45", label: "45 minutos" },
            { value: "60", label: "60 minutos" },
          ]}
        />
        {formError && (
          <p className="text-sm text-red-600" role="alert">
            {formError}
          </p>
        )}
      </form>
    </AppDrawer>
  );
}

function addHours(time: string, hours: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = Math.min(h * 60 + m + hours * 60, 23 * 60 + 59);
  const nh = Math.floor(total / 60);
  const nm = total % 60;
  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
}

export function EditScheduleDrawer({
  practitionerId,
  schedule,
  preset,
  isOpen,
  onOpenChange,
}: EditScheduleDrawerProps) {
  if (!isOpen) return null;

  const key = schedule?.id ?? `new-${preset?.dayOfWeek}-${preset?.startTime}`;

  return (
    <EditScheduleDrawerActive
      key={key}
      practitionerId={practitionerId}
      schedule={schedule}
      preset={preset}
      onOpenChange={onOpenChange}
    />
  );
}
