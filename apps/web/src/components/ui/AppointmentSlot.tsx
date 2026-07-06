import type { SlotStatus } from "@smoothflow/shared";
import { SLOT_STATUS_LABELS } from "@smoothflow/shared";

const styles: Record<SlotStatus, string> = {
  disponible: "bg-slot-available border-slot-available-border text-green-900",
  reservado: "bg-slot-reserved border-slot-reserved-border text-brand",
  bloqueado: "bg-slot-blocked border-slot-blocked-border text-red-900",
};

interface AppointmentSlotProps {
  status: SlotStatus;
  label: string;
  time: string;
  onClick?: () => void;
  selected?: boolean;
}

export function AppointmentSlot({ status, label, time, onClick, selected }: AppointmentSlotProps) {
  const statusLabel = SLOT_STATUS_LABELS[status];
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${time}, ${label}, ${statusLabel}`}
      aria-pressed={selected}
      className={`w-full rounded border px-2 py-2 text-left text-xs transition-colors ${styles[status]} ${selected ? "ring-2 ring-brand" : ""}`}
    >
      <span className="block font-semibold">{time}</span>
      <span className="block truncate">{label}</span>
      <span className="block text-[10px] opacity-80">{statusLabel}</span>
    </button>
  );
}
