import { useEffect, useRef, useState } from "react";
import type { AppointmentStatus, SlotStatus } from "@smoothflow/shared";
import { SLOT_STATUS_LABELS } from "@smoothflow/shared";
import { CurrentTimeIndicator } from "@/components/calendar/CurrentTimeLine";
import { AppTooltip } from "@/components/ui/Tooltip";
import {
  ROW_HEIGHT,
  MINUTES_PER_ROW,
  type CalendarEventItem,
  type EventLayout,
  buildEventTooltip,
  computeDayEventLayouts,
  computeTimeRange,
  dayKey,
  eventDayKey,
  eventHeight,
  eventTop,
  formatEventTime,
  formatHourLabel,
  isSameDay,
  minutesSinceMidnight,
  minutesToTop,
  practitionerInitials,
} from "@/components/calendar/calendar-utils";
import { TOOLTIPS } from "@/lib/tooltips";

const TIME_COL_WIDTH = "4.5rem";
const EVENT_GAP_PX = 2;

const eventStyles: Record<SlotStatus, string> = {
  disponible: "bg-slot-available border-l-slot-available-border text-green-900",
  reservado: "bg-slot-reserved border-l-slot-reserved-border text-brand",
  bloqueado: "bg-slot-blocked border-l-slot-blocked-border text-red-900",
};

// Sub-estados de cita que matizan el estilo base "reservado".
const appointmentStatusStyles: Partial<Record<AppointmentStatus, string>> = {
  reservado: "[border-left-style:dashed] opacity-95",
  confirmado: "ring-1 ring-inset ring-slot-reserved-border/30",
  reagendado: "[border-left-style:dashed]",
  atendido: "bg-emerald-100 border-l-emerald-600 text-emerald-900",
  no_asistio: "bg-amber-100 border-l-amber-500 text-amber-900",
  cancelacion_pendiente: "bg-orange-50 border-l-orange-500 text-orange-900 [border-left-style:dashed]",
};

const appointmentStatusBadges: Partial<Record<AppointmentStatus, string>> = {
  reservado: "Por confirmar",
  reagendado: "Reagendada",
  atendido: "Atendido",
  no_asistio: "No asistió",
  cancelacion_pendiente: "Cancelación pendiente",
};

const legendStyles: Record<SlotStatus, string> = {
  disponible: "bg-slot-available border border-slot-available-border/60",
  reservado: "bg-slot-reserved border border-slot-reserved-border/60",
  bloqueado: "bg-slot-blocked border border-slot-blocked-border/60",
};

const extraLegendItems: Array<{ label: string; className: string; tooltip: string }> = [
  { label: "Atendido", className: "bg-emerald-100 border border-emerald-600/60", tooltip: TOOLTIPS.calendar.appointmentStatus.atendido },
  { label: "No asistió", className: "bg-amber-100 border border-amber-500/60", tooltip: TOOLTIPS.calendar.appointmentStatus.no_asistio },
  { label: "Cancelación pendiente", className: "bg-orange-50 border border-dashed border-orange-500/70", tooltip: TOOLTIPS.calendar.appointmentStatus.cancelacion_pendiente },
];

interface ScheduleCalendarProps {
  days: Date[];
  events: CalendarEventItem[];
  onEventClick?: (event: CalendarEventItem) => void;
  onDayClick?: (day: Date) => void;
  showPractitionerBadge?: boolean;
  isRefreshing?: boolean;
}

function CalendarEventBlock({
  event,
  dayStartMinutes,
  layout,
  onClick,
  compact,
  showPractitionerBadge,
}: {
  event: CalendarEventItem;
  dayStartMinutes: number;
  layout?: EventLayout;
  onClick?: () => void;
  compact?: boolean;
  showPractitionerBadge?: boolean;
}) {
  const top = eventTop(event.startAt, dayStartMinutes);
  const height = eventHeight(event.startAt, event.endAt);
  const statusLabel = SLOT_STATUS_LABELS[event.status];
  const subStatusStyle =
    (event.appointmentStatus && appointmentStatusStyles[event.appointmentStatus]) ?? "";
  const subStatusBadge =
    event.appointmentStatus && event.appointmentStatus !== "reservado"
      ? appointmentStatusBadges[event.appointmentStatus]
      : undefined;
  const interactive = Boolean(onClick);
  const columnIndex = layout?.columnIndex ?? 0;
  const columnCount = layout?.columnCount ?? 1;
  const widthPercent = 100 / columnCount;
  const leftPercent = columnIndex * widthPercent;

  const block = (
    <button
      type="button"
      onClick={onClick}
      disabled={!interactive}
      className={`group absolute z-1 flex flex-col overflow-hidden rounded-lg border-l-[3px] px-2 py-1 text-left shadow-sm transition-all duration-150 ${compact ? "text-[9px]" : ""} ${eventStyles[event.status]} ${subStatusStyle} ${
        interactive
          ? "cursor-pointer hover:-translate-y-px hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand"
          : "cursor-default"
      }`}
      style={{
        top,
        height: Math.max(height - 2, 22),
        left: `calc(${leftPercent}% + ${EVENT_GAP_PX}px)`,
        width: `calc(${widthPercent}% - ${EVENT_GAP_PX * 2}px)`,
      }}
      aria-label={`${formatEventTime(event.startAt)}, ${event.label}, ${statusLabel}`}
    >
      {showPractitionerBadge && event.practitionerName && (
        <span
          className="absolute right-1 top-1 rounded bg-white/80 px-1 py-0.5 text-[8px] font-bold leading-none text-text-muted shadow-sm"
          aria-label={TOOLTIPS.calendar.practitionerBadge(event.practitionerName)}
        >
          {practitionerInitials(event.practitionerName)}
        </span>
      )}
      <span
        className={`block truncate font-semibold tracking-wide leading-tight opacity-80 ${
          compact ? "text-[9px]" : "text-[10px]"
        }`}
      >
        {formatEventTime(event.startAt)}
      </span>
      <span
        className={`block truncate font-semibold leading-tight ${compact ? "text-[9px]" : "text-xs"}`}
      >
        {event.label}
      </span>
      {subStatusBadge && height >= 36 ? (
        <span className="block truncate text-[10px] font-medium leading-tight opacity-90">
          {subStatusBadge}
        </span>
      ) : (
        event.sublabel &&
        height >= 36 && (
          <span className="block truncate text-[10px] leading-tight opacity-75">
            {event.sublabel}
          </span>
        )
      )}
    </button>
  );

  return <AppTooltip content={buildEventTooltip(event)}>{block}</AppTooltip>;
}

export function ScheduleCalendar({
  days,
  events,
  onEventClick,
  onDayClick,
  showPractitionerBadge = false,
  isRefreshing = false,
}: ScheduleCalendarProps) {
  const { dayStartMinutes, dayEndMinutes } = computeTimeRange(events);
  const totalRows = (dayEndMinutes - dayStartMinutes) / MINUTES_PER_ROW;
  const gridHeight = totalRows * ROW_HEIGHT;
  const today = new Date();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const didAutoScrollRef = useRef(false);
  const [userHasScrolled, setUserHasScrolled] = useState(false);
  const compact = days.length > 3;

  const hourLabels: number[] = [];
  for (let m = dayStartMinutes; m < dayEndMinutes; m += MINUTES_PER_ROW) {
    hourLabels.push(m);
  }

  const eventsByDay = days.map((day) => {
    const key = dayKey(day);
    return events.filter((ev) => eventDayKey(ev.startAt) === key);
  });

  const layoutsByDay = eventsByDay.map((dayEvents) => computeDayEventLayouts(dayEvents));

  const dayColMin = days.length > 1 ? "8rem" : "0";
  const gridTemplateColumns = `${TIME_COL_WIDTH} repeat(${days.length}, minmax(${dayColMin}, 1fr))`;
  const todayVisible = days.some((day) => isSameDay(day, today));
  const nowMinutes = minutesSinceMidnight(today);
  const showTimeInGutter =
    todayVisible && nowMinutes >= dayStartMinutes && nowMinutes <= dayEndMinutes;

  useEffect(() => {
    if (didAutoScrollRef.current || userHasScrolled || !showTimeInGutter) return;
    const container = scrollRef.current;
    if (!container) return;
    const target = minutesToTop(minutesSinceMidnight(new Date()), dayStartMinutes);
    container.scrollTop = Math.max(0, target - container.clientHeight / 3);
    didAutoScrollRef.current = true;
  }, [showTimeInGutter, dayStartMinutes, userHasScrolled]);

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-card">
      <div
        ref={scrollRef}
        className={`min-h-0 flex-1 overflow-auto transition-opacity duration-200 ${isRefreshing ? "opacity-60" : ""}`}
        style={{ scrollbarGutter: "stable" }}
        onScroll={() => setUserHasScrolled(true)}
      >
        <div
          className="sticky top-0 z-sticky-in-content grid border-b border-border bg-white/95 backdrop-blur-sm"
          style={{ gridTemplateColumns }}
        >
          <div className="sticky left-0 z-[1] border-r border-border bg-surface-muted/40" />
          {days.map((day) => {
            const isToday = isSameDay(day, today);
            const clickable = Boolean(onDayClick) && days.length > 1;
            const content = (
              <>
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
              </>
            );
            const baseClass = `min-w-0 border-r border-border px-2 py-2.5 text-center last:border-r-0 ${
              isToday ? "bg-brand/5" : ""
            }`;
            if (clickable) {
              const dateLabel = day.toLocaleDateString("es-CL", {
                weekday: "long",
                day: "numeric",
                month: "long",
              });
              return (
                <AppTooltip key={dayKey(day)} content={TOOLTIPS.calendar.dayHeader(dateLabel)}>
                  <button
                    type="button"
                    aria-current={isToday ? "date" : undefined}
                    aria-label={`Ver día ${dateLabel}`}
                    onClick={() => onDayClick?.(day)}
                    className={`${baseClass} cursor-pointer transition-colors hover:bg-brand/10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand`}
                  >
                    {content}
                  </button>
                </AppTooltip>
              );
            }
            return (
              <div
                key={dayKey(day)}
                aria-current={isToday ? "date" : undefined}
                className={baseClass}
              >
                {content}
              </div>
            );
          })}
        </div>

        <div className="relative grid" style={{ gridTemplateColumns, minHeight: gridHeight }}>
          <div
            className="sticky left-0 z-[1] border-r border-border bg-white"
            style={{ height: gridHeight }}
          >
            {hourLabels.map((minutes, i) =>
              minutes % 60 === 0 ? (
                <span
                  key={minutes}
                  className="absolute right-2 -translate-y-1/2 text-[11px] font-medium tabular-nums text-text-muted"
                  style={{ top: i * ROW_HEIGHT }}
                >
                  {formatHourLabel(minutes)}
                </span>
              ) : null,
            )}
          </div>

          {days.map((day, dayIndex) => {
            const isToday = isSameDay(day, today);
            const dayEvents = eventsByDay[dayIndex];
            const dayLayouts = layoutsByDay[dayIndex];
            const isEmpty = dayEvents.length === 0 && days.length > 1;

            return (
              <div
                key={dayKey(day)}
                className={`relative min-w-0 border-r border-border last:border-r-0 ${
                  isToday ? "bg-brand/5" : ""
                } ${isEmpty ? "bg-surface-muted/30" : ""}`}
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

                {isEmpty && (
                  <span className="pointer-events-none absolute inset-x-0 top-6 text-center text-[11px] font-medium text-text-muted/70">
                    Sin atención
                  </span>
                )}

                {dayEvents.map((event) => (
                  <CalendarEventBlock
                    key={event.id}
                    event={event}
                    dayStartMinutes={dayStartMinutes}
                    layout={dayLayouts.get(event.id)}
                    onClick={onEventClick ? () => onEventClick(event) : undefined}
                    compact={compact}
                    showPractitionerBadge={showPractitionerBadge}
                  />
                ))}
              </div>
            );
          })}

          {showTimeInGutter && (
            <CurrentTimeIndicator
              dayStartMinutes={dayStartMinutes}
              dayEndMinutes={dayEndMinutes}
              gutterWidth={TIME_COL_WIDTH}
            />
          )}
        </div>
      </div>

      {isRefreshing && (
        <AppTooltip content={TOOLTIPS.calendar.refreshing}>
          <div
            className="pointer-events-auto absolute inset-0 z-[3] flex items-center justify-center bg-white/20"
            role="status"
            aria-label={TOOLTIPS.calendar.refreshing}
          />
        </AppTooltip>
      )}

      <div className="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-2 border-t border-border bg-surface-muted/30 px-4 py-2.5">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
          Estados
        </span>
        {(Object.keys(SLOT_STATUS_LABELS) as SlotStatus[]).map((status) => (
          <span key={status} className="flex items-center gap-2 text-xs text-text">
            <AppTooltip content={TOOLTIPS.calendar.slotStatus[status]}>
              <span
                className={`size-3 rounded-[4px] ${legendStyles[status]}`}
                aria-label={TOOLTIPS.calendar.slotStatus[status]}
                role="img"
              />
            </AppTooltip>
            {SLOT_STATUS_LABELS[status]}
          </span>
        ))}
        {extraLegendItems.map((item) => (
          <span key={item.label} className="flex items-center gap-2 text-xs text-text">
            <AppTooltip content={item.tooltip}>
              <span
                className={`size-3 rounded-[4px] ${item.className}`}
                aria-label={item.tooltip}
                role="img"
              />
            </AppTooltip>
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}
