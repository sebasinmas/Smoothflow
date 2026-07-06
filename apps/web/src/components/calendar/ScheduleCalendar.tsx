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

const eventStyles: Record<SlotStatus, string> = {
  disponible: "bg-slot-available border-l-slot-available-border text-green-900",
  reservado: "bg-slot-reserved border-l-slot-reserved-border text-brand",
  bloqueado: "bg-slot-blocked border-l-slot-blocked-border text-red-900",
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

  return (
    <button
      type="button"
      onClick={onClick}
      className={`absolute inset-x-1 z-10 overflow-hidden rounded-md border-l-[3px] px-2 py-1 text-left shadow-sm transition-shadow hover:shadow-md ${eventStyles[event.status]}`}
      style={{ top, height: Math.max(height - 2, 20) }}
      aria-label={`${formatEventTime(event.startAt)}, ${event.label}, ${statusLabel}`}
    >
      <span className="block truncate text-[10px] font-semibold leading-tight">
        {formatEventTime(event.startAt)}
      </span>
      <span className="block truncate text-xs font-medium leading-tight">{event.label}</span>
      {event.sublabel && (
        <span className="block truncate text-[10px] opacity-75">{event.sublabel}</span>
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

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-white shadow-card">
      <div className="flex shrink-0 border-b border-border">
        <div className="w-16 shrink-0 border-r border-border bg-surface-muted/50" />
        {days.map((day) => {
          const isToday = isSameDay(day, today);
          return (
            <div
              key={dayKey(day)}
              className={`min-w-0 flex-1 border-r border-border px-2 py-3 text-center last:border-r-0 ${
                isToday ? "bg-brand/5" : "bg-surface-muted/30"
              }`}
            >
              <p className="text-[10px] font-medium uppercase tracking-wide text-text-muted">
                {day.toLocaleDateString("es-CL", { weekday: "short" })}
              </p>
              <p
                className={`mt-0.5 text-lg font-semibold ${
                  isToday
                    ? "inline-flex size-8 items-center justify-center rounded-full bg-brand text-white"
                    : "text-text"
                }`}
              >
                {day.getDate()}
              </p>
              <p className="text-[10px] text-text-muted">
                {day.toLocaleDateString("es-CL", { month: "short" })}
              </p>
            </div>
          );
        })}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex" style={{ minHeight: gridHeight }}>
          <div className="sticky left-0 z-10 w-16 shrink-0 border-r border-border bg-white">
            {hourLabels.map((minutes) => (
              <div
                key={minutes}
                className="flex items-start justify-end border-b border-border/50 pr-2 pt-1 text-[10px] text-text-muted"
                style={{ height: ROW_HEIGHT }}
              >
                {minutes % 60 === 0 ? formatHourLabel(minutes) : ""}
              </div>
            ))}
          </div>

          {days.map((day, dayIndex) => {
            const isToday = isSameDay(day, today);
            const dayEvents = eventsByDay[dayIndex];

            return (
              <div
                key={dayKey(day)}
                className={`relative min-w-0 flex-1 border-r border-border last:border-r-0 ${
                  isToday ? "bg-brand/[0.02]" : ""
                }`}
                style={{ height: gridHeight }}
              >
                {hourLabels.map((minutes, i) => (
                  <div
                    key={minutes}
                    className={`absolute inset-x-0 border-b border-border/40 ${
                      i % 2 === 0 ? "bg-transparent" : "bg-surface-muted/20"
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
    </div>
  );
}
