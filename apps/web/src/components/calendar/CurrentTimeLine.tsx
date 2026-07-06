import { useEffect, useState } from "react";
import {
  MINUTES_PER_ROW,
  ROW_HEIGHT,
  minutesSinceMidnight,
} from "@/components/calendar/calendar-utils";

interface CurrentTimeLineProps {
  dayStartMinutes: number;
  dayEndMinutes: number;
}

export function CurrentTimeLine({ dayStartMinutes, dayEndMinutes }: CurrentTimeLineProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const nowMinutes = minutesSinceMidnight(now);
  if (nowMinutes < dayStartMinutes || nowMinutes > dayEndMinutes) return null;

  const top = ((nowMinutes - dayStartMinutes) / MINUTES_PER_ROW) * ROW_HEIGHT;

  return (
    <div
      className="pointer-events-none absolute inset-x-0 z-20 flex items-center"
      style={{ top }}
      aria-hidden="true"
    >
      <span className="relative -ml-1.5 size-2.5 shrink-0 rounded-full bg-red-500 shadow-sm" />
      <span className="h-0.5 flex-1 bg-red-500 transition-[top] duration-1000 ease-linear" />
    </div>
  );
}
