import { useEffect, useState } from "react";
import {
  MINUTES_PER_ROW,
  ROW_HEIGHT,
  minutesSinceMidnight,
} from "@/components/calendar/calendar-utils";

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
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const nowMinutes = minutesSinceMidnight(now);
  if (nowMinutes < dayStartMinutes || nowMinutes > dayEndMinutes) return null;

  const top = ((nowMinutes - dayStartMinutes) / MINUTES_PER_ROW) * ROW_HEIGHT;
  const timeLabel = formatCurrentTime(now);

  return (
    <div
      className="pointer-events-none absolute inset-x-0 z-[2] flex items-center"
      style={{ top }}
      aria-hidden="true"
    >
      <div className="flex shrink-0 items-center justify-end pr-1" style={{ width: gutterWidth }}>
        <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-white shadow-sm">
          {timeLabel}
        </span>
        <span className="ml-0.5 size-2 shrink-0 rounded-full bg-red-500" />
      </div>
      <span className="h-0.5 min-w-0 flex-1 bg-red-500" />
    </div>
  );
}
