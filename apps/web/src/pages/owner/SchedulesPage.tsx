import { useQuery } from "@tanstack/react-query";
import type { PractitionerDto, ScheduleTemplateDto } from "@smoothflow/shared";
import { AppShell } from "@/components/layout/AppShell";
import { PractitionerScheduleGrid } from "@/components/owner/PractitionerScheduleGrid";
import { LoadingState } from "@/components/ui/LoadingState";
import { api } from "@/lib/api";
import { OWNER_NAV, OWNER_BOTTOM_NAV } from "@/lib/navigation";

export default function OwnerSchedulesPage() {
  const { data: practitioners, isLoading: loadingPractitioners } = useQuery({
    queryKey: ["practitioners"],
    queryFn: () => api.get<{ items: PractitionerDto[] }>("/owner/practitioners"),
  });

  const { data: schedules, isLoading: loadingSchedules } = useQuery({
    queryKey: ["schedules"],
    queryFn: () => api.get<{ items: ScheduleTemplateDto[] }>("/owner/schedules"),
  });

  const isLoading = loadingPractitioners || loadingSchedules;

  return (
    <AppShell
      userRole="dueno"
      navItems={OWNER_NAV}
      bottomNavItems={OWNER_BOTTOM_NAV}
      title="Horarios de atención"
      fillContent
    >
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <p className="shrink-0 text-sm text-text-muted">
          Configure los bloques de atención semanales para cada médico de la clínica.
        </p>

        {isLoading ? (
          <LoadingState message="Cargando horarios…" />
        ) : (
          <PractitionerScheduleGrid
            practitioners={practitioners?.items ?? []}
            schedules={schedules?.items ?? []}
          />
        )}
      </div>
    </AppShell>
  );
}
