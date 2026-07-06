import type { SlotStatus } from "@smoothflow/shared";
import { SLOT_STATUS_LABELS } from "@smoothflow/shared";
import { CurrentTimeLine } from "@/components/calendar/CurrentTimeLine";
import {
  ROW_HEIGHT,
  MINUTES_PER_ROW,
  type CalendarEventItem,
  computeTimeRange,
  dayKey,
  eventHeight,
  eventTop,
  formatEventTime,
  formatHourLabel,
  isSameDay,
} from "@/components/calendar/calendar-utils";

const TIME_COL_WIDTH = "4.5rem";

const eventStyles: Record<SlotStatus, string> = {
  disponible: "bg-slot-available border-l-slot-available-border text-green-900",
  reservado: "bg-slot-reserved border-l-slot-reserved-border text-brand",
  bloqueado: "bg-slot-blocked border-l-slot-blocked-border text-red-900",
};

const legendStyles: Record<SlotStatus, string> = {
  disponible: "bg-slot-available border border-slot-available-border/60",
  reservado: "bg-slot-reserved border border-slot-reserved-border/60",
  bloqueado: "bg-slot-blocked border border-slot-blocked-border/60",
};

interface ScheduleCalendarProps {
  days: Date[];
  events: CalendarEventItem[];
  onEventClick?: (event: CalendarEventItem) => void;
}

function CalendarEventBlock({
  event,
  dayStartMinutes,
  onClick,
}: {
  event: CalendarEventItem;
  dayStartMinutes: number;
  onClick?: () => void;
}) {
  const top = eventTop(event.startAt, dayStartMinutes);
  const height = eventHeight(event.startAt, event.endAt);
  const statusLabel = SLOT_STATUS_LABELS[event.status];
  const interactive = Boolean(onClick);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!interactive}
      className={`group absolute inset-x-1 z-10 flex flex-col overflow-hidden rounded-lg border-l-[3px] px-2 py-1 text-left shadow-sm transition-all duration-150 ${eventStyles[event.status]} ${
        interactive
          ? "cursor-pointer hover:-translate-y-px hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand"
          : "cursor-default"
      }`}
      style={{ top, height: Math.max(height - 2, 22) }}
      aria-label={`${formatEventTime(event.startAt)}, ${event.label}, ${statusLabel}`}
    >
      <span className="block truncate text-[10px] font-semibold uppercase tracking-wide leading-tight opacity-80">
        {formatEventTime(event.startAt)}
      </span>
      <span className="block truncate text-xs font-semibold leading-tight">{event.label}</span>
      {event.sublabel && (
        <span className="block truncate text-[10px] leading-tight opacity-75">{event.sublabel}</span>
      )}
    </button>
  );
}

export function ScheduleCalendar({ days, events, onEventClick }: ScheduleCalendarProps) {
  const { dayStartMinutes, dayEndMinutes } = computeTimeRange(events);
  const totalRows = (dayEndMinutes - dayStartMinutes) / MINUTES_PER_ROW;
  const gridHeight = totalRows * ROW_HEIGHT;
  const today = new Date();

  const hourLabels: number[] = [];
  for (let m = dayStartMinutes; m < dayEndMinutes; m += MINUTES_PER_ROW) {
    hourLabels.push(m);
  }

  const eventsByDay = days.map((day) => {
    const key = dayKey(day);
    return events.filter((ev) => ev.startAt.startsWith(key));
  });

  const gridTemplateColumns = `${TIME_COL_WIDTH} repeat(${days.length}, minmax(0, 1fr))`;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-card">
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-gutter-stable">
        {/* Header row — shares the exact same grid template as the body so columns stay aligned */}
        <div
          className="sticky top-0 z-20 grid border-b border-border bg-white/95 backdrop-blur-sm"
          style={{ gridTemplateColumns }}
        >
          <div className="border-r border-border bg-surface-muted/40" />
          {days.map((day) => {
            const isToday = isSameDay(day, today);
            return (
              <div
                key={dayKey(day)}
                aria-current={isToday ? "date" : undefined}
                className={`min-w-0 border-r border-border px-2 py-2.5 text-center last:border-r-0 ${
                  isToday ? "bg-brand/5" : ""
                }`}
              >
                <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                  {day.toLocaleDateString("es-CL", { weekday: "short" })}
                </p>
                <p
                  className={`mx-auto mt-1 text-lg font-semibold leading-none ${
                    isToday
                      ? "inline-flex size-8 items-center justify-center rounded-full bg-brand text-white shadow-sm"
                      : "text-text"
                  }`}
                >
                  {day.getDate()}
                </p>
                <p className="mt-1 text-[10px] capitalize text-text-muted">
                  {day.toLocaleDateString("es-CL", { month: "short" })}
                </p>
              </div>
            );
          })}
        </div>

        {/* Body */}
        <div className="grid" style={{ gridTemplateColumns, minHeight: gridHeight }}>
          {/* Time gutter */}
          <div className="relative border-r border-border bg-white" style={{ height: gridHeight }}>
            {hourLabels.map((minutes, i) =>
              minutes % 60 === 0 ? (
                <span
                  key={minutes}
                  className="absolute right-2 -translate-y-1/2 text-[11px] font-medium tabular-nums text-text-muted"
                  style={{ top: i * ROW_HEIGHT }}
                >
                  {i === 0 ? "" : formatHourLabel(minutes)}
                </span>
              ) : null,
            )}
          </div>

          {/* Day columns */}
          {days.map((day, dayIndex) => {
            const isToday = isSameDay(day, today);
            const dayEvents = eventsByDay[dayIndex];

            return (
              <div
                key={dayKey(day)}
                className={`relative min-w-0 border-r border-border last:border-r-0 ${
                  isToday ? "bg-brand/2" : ""
                }`}
                style={{ height: gridHeight }}
              >
                {hourLabels.map((minutes, i) => (
                  <div
                    key={minutes}
                    className={`absolute inset-x-0 ${
                      minutes % 60 === 0 ? "border-t border-border/50" : "border-t border-border/25"
                    }`}
                    style={{ top: i * ROW_HEIGHT, height: ROW_HEIGHT }}
                  />
                ))}

                {isToday && (
                  <CurrentTimeLine
                    dayStartMinutes={dayStartMinutes}
                    dayEndMinutes={dayEndMinutes}
                  />
                )}

                {dayEvents.map((event) => (
                  <CalendarEventBlock
                    key={event.id}
                    event={event}
                    dayStartMinutes={dayStartMinutes}
                    onClick={onEventClick ? () => onEventClick(event) : undefined}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend — color coding for slot states (accessibility + intuitiveness) */}
      <div className="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-2 border-t border-border bg-surface-muted/30 px-4 py-2.5">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
          Estados
        </span>
        {(Object.keys(SLOT_STATUS_LABELS) as SlotStatus[]).map((status) => (
          <span key={status} className="flex items-center gap-2 text-xs text-text">
            <span
              className={`size-3 rounded-[4px] ${legendStyles[status]}`}
              aria-hidden="true"
            />
            {SLOT_STATUS_LABELS[status]}
          </span>
        ))}
      </div>
    </div>
  );
}
