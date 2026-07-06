import type { UserDto } from "@smoothflow/shared";
import { ROLE_LABELS } from "@smoothflow/shared";
import { Button } from "@/components/ui/Button";
import { formatPersonName } from "@/lib/utils";

interface StaffCardProps {
  staff: UserDto;
  specialtyName?: string;
  onManage?: () => void;
  onUnlink?: () => void;
}

export function StaffCard({ staff, specialtyName, onManage, onUnlink }: StaffCardProps) {
  const initials = `${staff.givenName[0]}${staff.familyName[0]}`.toUpperCase();
  return (
    <article className="rounded-lg border border-border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="relative flex h-16 w-16 items-center justify-center rounded-full border border-border bg-surface-muted text-lg font-bold text-brand"
            aria-hidden="true"
          >
            {initials}
            <span
              className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${staff.active ? "bg-success" : "bg-gray-400"}`}
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text">
              {formatPersonName(staff.givenName, staff.familyName)}
            </h3>
            <p className="text-sm text-text-muted">
              {specialtyName ?? ROLE_LABELS[staff.role]}
            </p>
          </div>
        </div>
        <span
          className={`rounded px-2 py-0.5 text-xs font-medium ${staff.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}
        >
          {staff.active ? "Activo" : "Inactivo"}
        </span>
      </div>
      <div className="mt-4 flex gap-2 border-t border-border pt-3">
        <Button variant="secondary" className="flex-1" onClick={onManage}>
          Gestionar
        </Button>
        {onUnlink && staff.role !== "dueno" && (
          <Button variant="ghost" onClick={onUnlink} aria-label="Desvincular usuario">
            ⋯
          </Button>
        )}
      </div>
    </article>
  );
}
