import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import type { PractitionerDto, ScheduleTemplateDto } from "@smoothflow/shared";
import {
  ROW_HEIGHT,
  MINUTES_PER_ROW,
  formatHourLabel,
  minutesToTop,
} from "@/components/calendar/calendar-utils";
import { EditScheduleDrawer, type ScheduleDrawerPreset } from "@/components/owner/EditScheduleDrawer";
import { Select } from "@/components/ui/Select";

const WEEKDAYS = [
  { dayOfWeek: 1, label: "Lun" },
  { dayOfWeek: 2, label: "Mar" },
  { dayOfWeek: 3, label: "Mié" },
  { dayOfWeek: 4, label: "Jue" },
  { dayOfWeek: 5, label: "Vie" },
];

const DAY_START_MINUTES = 7 * 60;
const DAY_END_MINUTES = 20 * 60;
const TIME_COL_WIDTH = "3.5rem";
const MIN_BLOCK_HEIGHT = 36;
const GRID_TEMPLATE_COLUMNS = `${TIME_COL_WIDTH} repeat(5, minmax(8rem, 1fr))`;

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTimeString(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function blockHeight(startTime: string, endTime: string): number {
  const duration = Math.max(timeToMinutes(endTime) - timeToMinutes(startTime), MINUTES_PER_ROW);
  return Math.max((duration / MINUTES_PER_ROW) * ROW_HEIGHT, MIN_BLOCK_HEIGHT);
}

interface PractitionerScheduleGridProps {
  practitioners: PractitionerDto[];
  schedules: ScheduleTemplateDto[];
}

export function PractitionerScheduleGrid({
  practitioners,
  schedules,
}: PractitionerScheduleGridProps) {
  const [practitionerId, setPractitionerId] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editSchedule, setEditSchedule] = useState<ScheduleTemplateDto | null>(null);
  const [preset, setPreset] = useState<ScheduleDrawerPreset | undefined>();
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  useEffect(() => {
    if (!practitionerId && practitioners.length > 0) {
      setPractitionerId(practitioners[0].id);
    }
  }, [practitionerId, practitioners]);

  const practitionerOptions = practitioners.map((p) => ({
    value: p.id,
    label: `${p.givenName} ${p.familyName}`,
  }));

  const practitionerSchedules = useMemo(
    () => schedules.filter((s) => s.practitionerId === practitionerId),
    [schedules, practitionerId],
  );

  const hourLabels = useMemo(() => {
    const labels: number[] = [];
    for (let m = DAY_START_MINUTES; m <= DAY_END_MINUTES; m += MINUTES_PER_ROW) {
      if (m % 60 === 0) labels.push(m);
    }
    return labels;
  }, []);

  const gridHeight =
    ((DAY_END_MINUTES - DAY_START_MINUTES) / MINUTES_PER_ROW) * ROW_HEIGHT;

  const openCreate = (dayOfWeek: number, startMinutes: number) => {
    const startTime = minutesToTimeString(startMinutes);
    const endMinutes = Math.min(startMinutes + 120, DAY_END_MINUTES);
    setEditSchedule(null);
    setPreset({ dayOfWeek, startTime, endTime: minutesToTimeString(endMinutes) });
    setDrawerOpen(true);
  };

  const openEdit = (schedule: ScheduleTemplateDto) => {
    setEditSchedule(schedule);
    setPreset(undefined);
    setDrawerOpen(true);
  };

  const handleColumnClick = (dayOfWeek: number, event: React.MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("[data-schedule-block]")) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const y = event.clientY - rect.top;
    const rawMinutes = DAY_START_MINUTES + (y / ROW_HEIGHT) * MINUTES_PER_ROW;
    const snapped = Math.floor(rawMinutes / MINUTES_PER_ROW) * MINUTES_PER_ROW;
    const clamped = Math.max(DAY_START_MINUTES, Math.min(snapped, DAY_END_MINUTES - MINUTES_PER_ROW));
    openCreate(dayOfWeek, clamped);
  };

  if (practitioners.length === 0) {
    return (
      <p className="text-sm text-text-muted">
        Registre médicos en Personal para configurar sus horarios de atención.
      </p>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex shrink-0 flex-wrap items-end justify-between gap-3">
        <Select
          label="Médico"
          value={practitionerId}
          onChange={(e) => setPractitionerId(e.target.value)}
          options={practitionerOptions}
          className="max-w-xs"
        />

        <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
          <span>Haga clic en un bloque para editarlo o en una celda vacía para agregar uno.</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="inline-block size-3 rounded border border-brand/30 bg-slot-reserved" />
              Bloque de atención
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block size-3 rounded border border-dashed border-border bg-surface" />
              Celda disponible
            </span>
          </div>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-card">
        <div
          className="min-h-0 flex-1 overflow-auto"
          style={{ scrollbarGutter: "stable" }}
        >
          <div className="min-w-[36rem]">
            <div
              className="sticky top-0 z-sticky-in-content grid border-b border-border bg-white/95 backdrop-blur-sm"
              style={{ gridTemplateColumns: GRID_TEMPLATE_COLUMNS }}
            >
              <div className="sticky left-0 z-[1] border-r border-border bg-surface-muted/40" />
              {WEEKDAYS.map(({ dayOfWeek, label }) => (
                <div
                  key={dayOfWeek}
                  className="flex h-10 items-center justify-center border-r border-border text-xs font-semibold text-text last:border-r-0"
                >
                  {label}
                </div>
              ))}
            </div>

            <div
              className="relative grid"
              style={{ gridTemplateColumns: GRID_TEMPLATE_COLUMNS, minHeight: gridHeight }}
            >
              <div
                className="sticky left-0 z-[1] border-r border-border bg-white"
                style={{ height: gridHeight }}
              >
                {hourLabels.map((minutes) => (
                  <span
                    key={minutes}
                    className="absolute right-2 -translate-y-1/2 text-[10px] text-text-muted"
                    style={{ top: minutesToTop(minutes, DAY_START_MINUTES) }}
                  >
                    {formatHourLabel(minutes)}
                  </span>
                ))}
              </div>

              {WEEKDAYS.map(({ dayOfWeek, label }) => {
                const dayBlocks = practitionerSchedules.filter((s) => s.dayOfWeek === dayOfWeek);
                const isHovered = hoveredDay === dayOfWeek;

                return (
                  <div
                    key={dayOfWeek}
                    className="relative min-w-0 border-r border-border last:border-r-0"
                    style={{ height: gridHeight }}
                  >
                    <div
                      className="group/column relative h-full cursor-pointer bg-surface/30 transition-colors hover:bg-surface-muted/50"
                      onClick={(e) => handleColumnClick(dayOfWeek, e)}
                      onMouseEnter={() => setHoveredDay(dayOfWeek)}
                      onMouseLeave={() => setHoveredDay(null)}
                      role="button"
                      tabIndex={0}
                      aria-label={`Agregar horario el ${label}`}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          openCreate(dayOfWeek, 9 * 60);
                        }
                      }}
                    >
                      {hourLabels.map((minutes) => (
                        <div
                          key={minutes}
                          className="pointer-events-none absolute inset-x-0 border-t border-border/40"
                          style={{ top: minutesToTop(minutes, DAY_START_MINUTES) }}
                        />
                      ))}

                      {isHovered && dayBlocks.length === 0 && (
                        <div className="pointer-events-none absolute inset-2 flex items-center justify-center rounded-lg border border-dashed border-brand/30 bg-brand/5">
                          <span className="flex items-center gap-1 text-xs font-medium text-brand">
                            <Plus className="size-3.5" aria-hidden="true" />
                            Agregar bloque
                          </span>
                        </div>
                      )}

                      {dayBlocks.map((block) => (
                        <button
                          key={block.id}
                          type="button"
                          data-schedule-block
                          className="absolute inset-x-1 z-[1] flex min-h-[36px] cursor-pointer flex-col justify-center rounded-md border border-brand/25 border-l-4 border-l-slot-reserved-border bg-slot-reserved px-2 py-1.5 text-left text-xs leading-snug text-brand shadow-sm transition-all hover:z-[2] hover:shadow-md hover:ring-2 hover:ring-brand/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                          style={{
                            top: minutesToTop(timeToMinutes(block.startTime), DAY_START_MINUTES),
                            height: blockHeight(block.startTime, block.endTime),
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            openEdit(block);
                          }}
                        >
                          <span className="font-semibold">
                            {block.startTime} – {block.endTime}
                          </span>
                          <span className="text-[11px] opacity-80">
                            Citas de {block.slotDurationMinutes} min
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {practitionerSchedules.length === 0 && (
        <p className="shrink-0 text-sm text-text-muted">
          Este médico aún no tiene horarios. Haga clic en la grilla para agregar el primero.
        </p>
      )}

      {practitionerId && (
        <EditScheduleDrawer
          practitionerId={practitionerId}
          schedule={editSchedule}
          preset={preset}
          isOpen={drawerOpen}
          onOpenChange={(open) => {
            setDrawerOpen(open);
            if (!open) {
              setEditSchedule(null);
              setPreset(undefined);
            }
          }}
        />
      )}
    </div>
  );
}
