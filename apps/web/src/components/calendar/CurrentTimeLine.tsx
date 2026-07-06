import { useEffect, useState } from "react";
import { minutesSinceMidnight, minutesToTop } from "@/components/calendar/calendar-utils";

interface CurrentTimeIndicatorProps {
  dayStartMinutes: number;
  dayEndMinutes: number;
  gutterWidth: string;
}

function formatCurrentTime(date: Date): string {
  return date.toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function CurrentTimeIndicator({
  dayStartMinutes,
  dayEndMinutes,
  gutterWidth,
}: CurrentTimeIndicatorProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const nowMinutes = minutesSinceMidnight(now);
  if (nowMinutes < dayStartMinutes || nowMinutes > dayEndMinutes) return null;

  const top = minutesToTop(nowMinutes, dayStartMinutes);
  const timeLabel = formatCurrentTime(now);

  return (
    <div
      className="pointer-events-none absolute inset-x-0 z-[2] h-0"
      style={{ top }}
      role="status"
      aria-live="polite"
      aria-label={`Hora actual: ${timeLabel}`}
    >
      <div
        className="absolute right-0 flex -translate-y-1/2 items-center justify-end pr-1"
        style={{ left: 0, width: gutterWidth }}
      >
        <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-white shadow-sm">
          {timeLabel}
        </span>
        <span className="ml-0.5 size-2 shrink-0 rounded-full bg-red-500" />
      </div>
      <span
        className="absolute right-0 h-0.5 -translate-y-1/2 bg-red-500"
        style={{ left: gutterWidth }}
      />
    </div>
  );
}
