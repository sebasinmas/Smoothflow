import { UserX } from "lucide-react";
import type { UserDto } from "@smoothflow/shared";
import { ROLE_LABELS } from "@smoothflow/shared";
import { Button } from "@/components/ui/Button";
import { AppTooltip } from "@/components/ui/Tooltip";
import { TOOLTIPS } from "@/lib/tooltips";
import { formatPersonName } from "@/lib/utils";

interface StaffCardProps {
  staff: UserDto;
  specialtyName?: string;
  onManage?: () => void;
  onUnlink?: () => void;
}

export function StaffCard({ staff, specialtyName, onManage, onUnlink }: StaffCardProps) {
  const initials = `${staff.givenName[0]}${staff.familyName[0]}`.toUpperCase();
  const statusTooltip = staff.active ? TOOLTIPS.owner.statusActive : TOOLTIPS.owner.statusInactive;
  const badgeTooltip = staff.active ? TOOLTIPS.owner.badgeActive : TOOLTIPS.owner.badgeInactive;

  return (
    <article className="card card-hover rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="relative flex h-16 w-16 items-center justify-center rounded-full border border-border bg-surface-muted text-lg font-bold text-brand"
            aria-hidden="true"
          >
            {initials}
            <AppTooltip content={statusTooltip} placement="right">
              <span
                className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${staff.active ? "bg-success" : "bg-gray-400"}`}
                aria-label={statusTooltip}
                role="img"
              />
            </AppTooltip>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text">
              {formatPersonName(staff.givenName, staff.familyName)}
            </h3>
            <AppTooltip content={TOOLTIPS.owner.staffRole}>
              <p className="text-sm text-text-muted">
                {specialtyName ?? ROLE_LABELS[staff.role]}
              </p>
            </AppTooltip>
          </div>
        </div>
        <AppTooltip content={badgeTooltip}>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${staff.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}
          >
            {staff.active ? "Activo" : "Inactivo"}
          </span>
        </AppTooltip>
      </div>
      <div className="mt-4 flex gap-2 border-t border-border pt-3">
        {onManage && (
          <Button variant="secondary" className="flex-1" onClick={onManage}>
            Gestionar
          </Button>
        )}
        {onUnlink && staff.role !== "dueno" && (
          <AppTooltip content={TOOLTIPS.owner.unlinkStaff}>
            <Button
              variant="ghost"
              onClick={onUnlink}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
              aria-label={`Desvincular a ${formatPersonName(staff.givenName, staff.familyName)}`}
            >
              <UserX className="size-4" aria-hidden="true" />
              Desvincular
            </Button>
          </AppTooltip>
        )}
      </div>
    </article>
  );
}
