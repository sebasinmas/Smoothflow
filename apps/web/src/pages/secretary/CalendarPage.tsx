import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, RefreshCw, CalendarOff } from "lucide-react";
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
import { EmptyState } from "@/components/ui/EmptyState";
import { Select } from "@/components/ui/Select";
import { AppTooltip } from "@/components/ui/Tooltip";
import { api } from "@/lib/api";
import { addDays, startOfWeek } from "@/lib/utils";
import { useRealtime } from "@/contexts/RealtimeContext";
import { TOOLTIPS } from "@/lib/tooltips";

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function SecretaryCalendarPage() {
  const { lastEvent } = useRealtime();
  const [view, setView] = useState<"week" | "day">("week");
  const [anchorDate, setAnchorDate] = useState(() => startOfToday());
  const [selectedPractitioner, setSelectedPractitioner] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const [reservationPreset, setReservationPreset] = useState<ReservationPreset | undefined>();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventItem | null>(null);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const step = view === "week" ? 7 : 1;
  const rangeStart = view === "week" ? startOfWeek(anchorDate) : anchorDate;
  const rangeEnd = addDays(rangeStart, step);

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
    isFetching: fetchingAppointments,
    isError: appointmentsError,
  } = useQuery({
    queryKey: ["appointments", rangeStart.toISOString(), view, selectedPractitioner, lastEvent],
    queryFn: () => {
      const params = new URLSearchParams({
        from: rangeStart.toISOString(),
        to: rangeEnd.toISOString(),
      });
      if (selectedPractitioner) params.set("practitionerId", selectedPractitioner);
      return api.get<{ items: AppointmentDto[] }>(`/appointments?${params}`);
    },
  });

  const {
    data: availability,
    refetch: refetchAvailability,
    isLoading: loadingAvailability,
    isFetching: fetchingAvailability,
    isError: availabilityError,
  } = useQuery({
    queryKey: ["availability", rangeStart.toISOString(), view, selectedPractitioner, lastEvent],
    queryFn: () => {
      const params = new URLSearchParams({
        from: rangeStart.toISOString(),
        to: rangeEnd.toISOString(),
      });
      if (selectedPractitioner) params.set("practitionerId", selectedPractitioner);
      return api.get<{ slots: AvailabilitySlotDto[] }>(`/availability?${params}`);
    },
  });

  const days = useMemo(() => {
    const count = view === "week" ? 7 : 1;
    return Array.from({ length: count }, (_, i) => addDays(rangeStart, i));
  }, [view, rangeStart]);

  const rangeLabel = useMemo(() => {
    if (view === "day") {
      return rangeStart.toLocaleDateString("es-CL", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
    }
    const last = addDays(rangeStart, 6);
    const start = rangeStart.toLocaleDateString("es-CL", { day: "numeric", month: "short" });
    const end = last.toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" });
    return `${start} – ${end}`;
  }, [view, rangeStart]);

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

  const handleViewChange = (nextView: "week" | "day") => {
    if (nextView === "day" && view === "week") {
      const todayDate = startOfToday();
      const weekStartDate = startOfWeek(anchorDate);
      const weekEndDate = addDays(weekStartDate, 6);
      const inRange = todayDate >= weekStartDate && todayDate <= weekEndDate;
      if (inRange) setAnchorDate(todayDate);
    }
    setView(nextView);
  };

  const handleDayClick = (day: Date) => {
    const d = new Date(day);
    d.setHours(0, 0, 0, 0);
    setAnchorDate(d);
    setView("day");
  };

  const handleGoToToday = () => {
    const todayDate = startOfToday();
    setAnchorDate(view === "week" ? startOfWeek(todayDate) : todayDate);
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
  const isBackgroundFetching =
    (fetchingAppointments || fetchingAvailability) && !isLoading;
  const hasError = appointmentsError || availabilityError;

  return (
    <SecretaryShell
      title="Calendario de agenda"
      fillContent
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <CalendarToolbar>
          <div className="flex w-full flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex items-center gap-2">
              <AppTooltip content={view === "week" ? TOOLTIPS.calendar.navPrevWeek : TOOLTIPS.calendar.navPrevDay}>
                <Button
                  variant="secondary"
                  className="size-9 px-0"
                  onClick={() => setAnchorDate(addDays(anchorDate, -step))}
                  aria-label={view === "week" ? "Semana anterior" : "Día anterior"}
                >
                  <ChevronLeft className="size-[18px] shrink-0" aria-hidden="true" />
                </Button>
              </AppTooltip>
              <AppTooltip content={view === "week" ? TOOLTIPS.calendar.navNextWeek : TOOLTIPS.calendar.navNextDay}>
                <Button
                  variant="secondary"
                  className="size-9 px-0"
                  onClick={() => setAnchorDate(addDays(anchorDate, step))}
                  aria-label={view === "week" ? "Semana siguiente" : "Día siguiente"}
                >
                  <ChevronRight className="size-[18px] shrink-0" aria-hidden="true" />
                </Button>
              </AppTooltip>
              <AppTooltip
                content={view === "week" ? TOOLTIPS.calendar.goToWeek : TOOLTIPS.calendar.goToToday}
              >
                <Button variant="secondary" onClick={handleGoToToday}>
                  Hoy
                </Button>
              </AppTooltip>
            </div>

            <p className="min-w-40 text-sm font-semibold capitalize text-text">{rangeLabel}</p>
          </div>

          <div className="flex w-full flex-wrap items-center gap-3">
            <AppTooltip content={TOOLTIPS.calendar.filterPractitioner}>
              <div>
                <Select
                  label="Filtrar por médico"
                  hideLabel
                  value={selectedPractitioner}
                  onChange={(e) => setSelectedPractitioner(e.target.value)}
                  options={practitionerOptions}
                />
              </div>
            </AppTooltip>
            {!selectedPractitioner && (
              <AppTooltip content={TOOLTIPS.calendar.overlapBadge}>
                <span className="cursor-help rounded-full bg-surface-muted px-2.5 py-1 text-[11px] text-text-muted">
                  Mostrando todos los médicos — los horarios pueden superponerse
                </span>
              </AppTooltip>
            )}
            <div className="ml-auto flex flex-wrap items-center gap-3">
              <AppTooltip content={TOOLTIPS.calendar.createReservation}>
                <Button onClick={() => openCreateDialog()}>Crear reservación</Button>
              </AppTooltip>
              <AppTooltip content={view === "week" ? TOOLTIPS.calendar.viewWeek : TOOLTIPS.calendar.viewDay}>
                <div>
                  <SegmentedControl
                    value={view}
                    options={[
                      { value: "week", label: "Semanal" },
                      { value: "day", label: "Diaria" },
                    ]}
                    onChange={(v) => handleViewChange(v as "week" | "day")}
                  />
                </div>
              </AppTooltip>
              <AppTooltip content={TOOLTIPS.calendar.blockAgenda}>
                <Button variant="secondary" onClick={() => setBlockOpen(true)}>
                  Bloquear agenda
                </Button>
              </AppTooltip>
              <AppTooltip content={TOOLTIPS.calendar.refreshAgenda}>
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
          </div>
        </CalendarToolbar>

        {isLoading ? (
          <LoadingState message="Cargando agenda…" />
        ) : hasError ? (
          <p className="text-sm text-red-600" role="alert">
            No se pudo cargar la agenda. Intente actualizar la página.
          </p>
        ) : events.length === 0 ? (
          <EmptyState
            icon={CalendarOff}
            message="No hay horarios en el rango seleccionado."
            action={
              <Button variant="secondary" onClick={() => openCreateDialog()}>
                Crear una reservación
              </Button>
            }
          />
        ) : (
          <ScheduleCalendar
            days={days}
            events={events}
            onEventClick={handleEventClick}
            onDayClick={handleDayClick}
            showPractitionerBadge={!selectedPractitioner}
            isRefreshing={isBackgroundFetching || isRefreshing}
          />
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
