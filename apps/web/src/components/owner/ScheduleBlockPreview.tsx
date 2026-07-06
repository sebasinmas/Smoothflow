const DAY_LABELS: Record<number, string> = {
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
};

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function estimateSlotCount(startTime: string, endTime: string, slotDurationMinutes: number): number {
  const duration = timeToMinutes(endTime) - timeToMinutes(startTime);
  if (duration <= 0 || slotDurationMinutes <= 0) return 0;
  return Math.floor(duration / slotDurationMinutes);
}

interface ScheduleBlockPreviewProps {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
}

export function ScheduleBlockPreview({
  dayOfWeek,
  startTime,
  endTime,
  slotDurationMinutes,
}: ScheduleBlockPreviewProps) {
  const dayLabel = DAY_LABELS[dayOfWeek] ?? "—";
  const slotCount = estimateSlotCount(startTime, endTime, slotDurationMinutes);
  const valid = timeToMinutes(endTime) > timeToMinutes(startTime);

  return (
    <div className="rounded-lg border border-brand/20 border-l-4 border-l-slot-reserved-border bg-slot-reserved/60 px-4 py-3">
      <p className="text-sm font-semibold text-brand">
        {dayLabel} · {startTime} a {endTime}
      </p>
      <p className="mt-1 text-xs text-text-muted">
        {valid
          ? `~${slotCount} cita${slotCount !== 1 ? "s" : ""} de ${slotDurationMinutes} min`
          : "La hora de fin debe ser posterior al inicio"}
      </p>
    </div>
  );
}
