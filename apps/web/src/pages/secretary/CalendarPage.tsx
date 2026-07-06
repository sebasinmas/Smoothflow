import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import type { AppointmentDto, AvailabilitySlotDto } from "@smoothflow/shared";
import { SecretaryShell } from "@/components/layout/SecretaryShell";
import { CalendarToolbar, SegmentedControl } from "@/components/calendar/CalendarToolbar";
import { mergeCalendarEvents } from "@/components/calendar/calendar-utils";
import { ScheduleCalendar } from "@/components/calendar/ScheduleCalendar";
import type { CalendarEventItem } from "@/components/calendar/calendar-utils";
import { AppointmentActionsDialog } from "@/components/secretary/AppointmentActionsDialog";
import { BlockAgendaDialog } from "@/components/secretary/BlockAgendaDialog";
import {
  CreateReservationDialog,
  type ReservationPreset,
} from "@/components/secretary/CreateReservationDialog";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/LoadingState";
import { Select } from "@/components/ui/Select";
import { AppTooltip } from "@/components/ui/Tooltip";
import { api } from "@/lib/api";
import { addDays, startOfWeek } from "@/lib/utils";
import { useRealtime } from "@/contexts/RealtimeContext";

export default function SecretaryCalendarPage() {
  const { lastEvent } = useRealtime();
  const [view, setView] = useState<"week" | "day">("week");
  const [weekStart, setWeekStart] = useState(() => startOfWeek());
  const [selectedPractitioner, setSelectedPractitioner] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const [reservationPreset, setReservationPreset] = useState<ReservationPreset | undefined>();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventItem | null>(null);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const step = view === "week" ? 7 : 1;
  const weekEnd = addDays(weekStart, step);

  const { data: practitioners } = useQuery({
    queryKey: ["practitioners"],
    queryFn: () =>
      api.get<{ items: Array<{ id: string; givenName: string; familyName: string }> }>(
        "/owner/practitioners",
      ),
  });

  const {
    data: appointments,
    refetch: refetchAppointments,
    isLoading: loadingAppointments,
    isError: appointmentsError,
  } = useQuery({
    queryKey: ["appointments", weekStart.toISOString(), selectedPractitioner, lastEvent],
    queryFn: () => {
      const params = new URLSearchParams({
        from: weekStart.toISOString(),
        to: weekEnd.toISOString(),
      });
      if (selectedPractitioner) params.set("practitionerId", selectedPractitioner);
      return api.get<{ items: AppointmentDto[] }>(`/appointments?${params}`);
    },
  });

  const {
    data: availability,
    refetch: refetchAvailability,
    isLoading: loadingAvailability,
    isError: availabilityError,
  } = useQuery({
    queryKey: ["availability", weekStart.toISOString(), selectedPractitioner, lastEvent],
    queryFn: () => {
      const params = new URLSearchParams({
        from: weekStart.toISOString(),
        to: weekEnd.toISOString(),
      });
      if (selectedPractitioner) params.set("practitionerId", selectedPractitioner);
      return api.get<{ slots: AvailabilitySlotDto[] }>(`/availability?${params}`);
    },
  });

  const days = useMemo(() => {
    const count = view === "week" ? 7 : 1;
    return Array.from({ length: count }, (_, i) => addDays(weekStart, i));
  }, [view, weekStart]);

  const rangeLabel = useMemo(() => {
    if (view === "day") {
      return weekStart.toLocaleDateString("es-CL", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
    }
    const last = addDays(weekStart, 6);
    const start = weekStart.toLocaleDateString("es-CL", { day: "numeric", month: "short" });
    const end = last.toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" });
    return `${start} – ${end}`;
  }, [view, weekStart]);

  const events = useMemo(
    () =>
      mergeCalendarEvents(
        availability?.slots ?? [],
        appointments?.items ?? [],
      ),
    [availability?.slots, appointments?.items],
  );

  const practitionerOptions = [
    { value: "", label: "Todos los médicos" },
    ...(practitioners?.items.map((p) => ({
      value: p.id,
      label: `${p.givenName} ${p.familyName}`,
    })) ?? []),
  ];

  const openCreateDialog = (preset?: ReservationPreset) => {
    setReservationPreset(preset);
    setCreateOpen(true);
  };

  const handleEventClick = (event: CalendarEventItem) => {
    if (event.status === "disponible") {
      openCreateDialog({
        practitionerId: event.practitionerId,
        startAt: event.startAt,
        endAt: event.endAt,
      });
      return;
    }
    setSelectedEvent(event);
    setActionsOpen(true);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const results = await Promise.all([refetchAppointments(), refetchAvailability()]);
      const hasError = results.some((r) => r.isError);
      if (hasError) {
        toast.error("No se pudo actualizar la agenda");
      } else {
        toast.success("Agenda actualizada");
      }
    } catch {
      toast.error("No se pudo actualizar la agenda");
    } finally {
      setIsRefreshing(false);
    }
  };

  const isLoading = loadingAppointments || loadingAvailability;
  const hasError = appointmentsError || availabilityError;

  return (
    <SecretaryShell
      title="Calendario de agenda"
      fillContent
      primaryAction={{
        label: "Crear una reservación",
        onClick: () => openCreateDialog(),
      }}
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <CalendarToolbar>
          <div className="flex items-center gap-2">
            <AppTooltip content={view === "week" ? "Semana anterior" : "Día anterior"}>
              <Button
                variant="secondary"
                className="size-9 px-0"
                onClick={() => setWeekStart(addDays(weekStart, -step))}
                aria-label={view === "week" ? "Semana anterior" : "Día anterior"}
              >
                <ChevronLeft className="size-[18px] shrink-0" aria-hidden="true" />
              </Button>
            </AppTooltip>
            <AppTooltip content={view === "week" ? "Semana siguiente" : "Día siguiente"}>
              <Button
                variant="secondary"
                className="size-9 px-0"
                onClick={() => setWeekStart(addDays(weekStart, step))}
                aria-label={view === "week" ? "Semana siguiente" : "Día siguiente"}
              >
                <ChevronRight className="size-[18px] shrink-0" aria-hidden="true" />
              </Button>
            </AppTooltip>
            <AppTooltip content="Ir al día de hoy">
              <Button variant="secondary" onClick={() => setWeekStart(startOfWeek())}>
                Hoy
              </Button>
            </AppTooltip>
          </div>

          <p className="min-w-40 text-sm font-semibold capitalize text-text">{rangeLabel}</p>

          <div className="ml-auto flex flex-wrap items-end gap-3">
            <Select
              label="Médico"
              value={selectedPractitioner}
              onChange={(e) => setSelectedPractitioner(e.target.value)}
              options={practitionerOptions}
            />
            <AppTooltip content={view === "week" ? "Vista semanal" : "Vista diaria"}>
              <div>
                <SegmentedControl
                  value={view}
                  options={[
                    { value: "week", label: "Semanal" },
                    { value: "day", label: "Diaria" },
                  ]}
                  onChange={(v) => setView(v as "week" | "day")}
                />
              </div>
            </AppTooltip>
            <AppTooltip content="Bloquear horarios de un médico">
              <Button variant="secondary" onClick={() => setBlockOpen(true)}>
                Bloquear agenda
              </Button>
            </AppTooltip>
            <AppTooltip content="Actualizar datos de la agenda">
              <Button
                variant="secondary"
                className="size-9 px-0"
                onClick={() => void handleRefresh()}
                disabled={isRefreshing}
                aria-label="Actualizar agenda"
              >
                <RefreshCw
                  className={`size-[18px] shrink-0 ${isRefreshing ? "animate-spin" : ""}`}
                  aria-hidden="true"
                />
              </Button>
            </AppTooltip>
          </div>
        </CalendarToolbar>

        {isLoading ? (
          <LoadingState message="Cargando agenda…" />
        ) : hasError ? (
          <p className="text-sm text-red-600" role="alert">
            No se pudo cargar la agenda. Intente actualizar la página.
          </p>
        ) : (
          <ScheduleCalendar days={days} events={events} onEventClick={handleEventClick} />
        )}
      </div>

      <CreateReservationDialog
        isOpen={createOpen}
        onOpenChange={setCreateOpen}
        preset={reservationPreset}
      />
      <BlockAgendaDialog
        isOpen={blockOpen}
        onOpenChange={setBlockOpen}
        initialPractitionerId={selectedPractitioner || undefined}
      />
      <AppointmentActionsDialog
        isOpen={actionsOpen}
        onOpenChange={setActionsOpen}
        event={selectedEvent}
      />
    </SecretaryShell>
  );
}
