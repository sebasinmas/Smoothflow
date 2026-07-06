import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { ScheduleTemplateDto } from "@smoothflow/shared";
import { toast } from "sonner";
import { ScheduleBlockPreview } from "@/components/owner/ScheduleBlockPreview";
import { FormDialogFooter } from "@/components/secretary/FormDialogFooter";
import { AppDrawer } from "@/components/ui/AppDrawer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { ApiError, api } from "@/lib/api";

const DAYS = [
  { value: "1", label: "Lun" },
  { value: "2", label: "Mar" },
  { value: "3", label: "Mié" },
  { value: "4", label: "Jue" },
  { value: "5", label: "Vie" },
];

const SLOT_DURATIONS = [
  { value: "15", label: "15 min" },
  { value: "30", label: "30 min" },
  { value: "45", label: "45 min" },
  { value: "60", label: "60 min" },
];

const TIME_PRESETS = [
  { label: "Mañana", startTime: "09:00", endTime: "13:00" },
  { label: "Tarde", startTime: "14:00", endTime: "18:00" },
  { label: "Jornada", startTime: "09:00", endTime: "17:00" },
] as const;

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

function addHours(time: string, hours: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = Math.min(h * 60 + m + hours * 60, 23 * 60 + 59);
  const nh = Math.floor(total / 60);
  const nm = total % 60;
  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
}

function getInitialState(
  schedule: ScheduleTemplateDto | null,
  preset?: ScheduleDrawerPreset,
) {
  return {
    dayOfWeek: String(schedule?.dayOfWeek ?? preset?.dayOfWeek ?? 1),
    startTime: schedule?.startTime ?? preset?.startTime ?? "09:00",
    endTime:
      schedule?.endTime ??
      preset?.endTime ??
      (preset?.startTime ? addHours(preset.startTime, 2) : "17:00"),
    slotDurationMinutes: String(schedule?.slotDurationMinutes ?? 30),
  };
}

export function EditScheduleDrawer({
  practitionerId,
  schedule,
  preset,
  isOpen,
  onOpenChange,
}: EditScheduleDrawerProps) {
  const queryClient = useQueryClient();
  const isEdit = schedule !== null;

  const [dayOfWeek, setDayOfWeek] = useState(() => getInitialState(schedule, preset).dayOfWeek);
  const [startTime, setStartTime] = useState(() => getInitialState(schedule, preset).startTime);
  const [endTime, setEndTime] = useState(() => getInitialState(schedule, preset).endTime);
  const [slotDurationMinutes, setSlotDurationMinutes] = useState(
    () => getInitialState(schedule, preset).slotDurationMinutes,
  );
  const [formError, setFormError] = useState("");

  const formKey = schedule?.id ?? `new-${preset?.dayOfWeek}-${preset?.startTime}`;

  useEffect(() => {
    if (!isOpen) return;
    const initial = getInitialState(schedule, preset);
    setDayOfWeek(initial.dayOfWeek);
    setStartTime(initial.startTime);
    setEndTime(initial.endTime);
    setSlotDurationMinutes(initial.slotDurationMinutes);
    setFormError("");
  }, [isOpen, formKey, schedule, preset]);

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

  const applyPreset = (start: string, end: string) => {
    setStartTime(start);
    setEndTime(end);
  };

  return (
    <AppDrawer
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={isEdit ? "Editar bloque" : "Nuevo bloque"}
      description="Configure el bloque de atención para el día seleccionado."
      footer={
        isOpen ? (
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
            <div className={isEdit ? "ml-auto" : "flex w-full justify-end"}>
              <FormDialogFooter
                onCancel={() => onOpenChange(false)}
                submitLabel={isEdit ? "Guardar cambios" : "Crear bloque"}
                submitType="submit"
                form="edit-schedule-form"
                loading={saveMutation.isPending}
              />
            </div>
          </div>
        ) : undefined
      }
    >
      {isOpen ? (
        <form id="edit-schedule-form" className="grid gap-5" onSubmit={handleSubmit}>
          <ScheduleBlockPreview
            dayOfWeek={Number(dayOfWeek)}
            startTime={startTime}
            endTime={endTime}
            slotDurationMinutes={Number(slotDurationMinutes)}
          />

          <div className="grid gap-2">
            <span className="text-sm font-medium text-text">Día de la semana</span>
            <SegmentedControl value={dayOfWeek} options={DAYS} onChange={setDayOfWeek} />
          </div>

          <div className="grid gap-2">
            <span className="text-sm font-medium text-text">Plantillas rápidas</span>
            <div className="flex flex-wrap gap-2">
              {TIME_PRESETS.map((p) => (
                <Button
                  key={p.label}
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => applyPreset(p.startTime, p.endTime)}
                >
                  {p.label} ({p.startTime}–{p.endTime})
                </Button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-surface-muted/40 p-4">
            <span className="mb-3 block text-sm font-medium text-text">Rango horario</span>
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
          </div>

          <div className="grid gap-2">
            <span className="text-sm font-medium text-text">Duración de cada cita</span>
            <SegmentedControl
              value={slotDurationMinutes}
              options={SLOT_DURATIONS}
              onChange={setSlotDurationMinutes}
            />
          </div>

          {formError && (
            <p className="text-sm text-red-600" role="alert">
              {formError}
            </p>
          )}
        </form>
      ) : null}
    </AppDrawer>
  );
}
