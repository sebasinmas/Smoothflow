import type { AppointmentStatus, SlotStatus } from "@smoothflow/shared";

export const TOOLTIPS = {
  layout: {
    collapseMenu: "Contraer menú lateral",
    expandMenu: "Expandir menú lateral",
    logout: "Cerrar sesión y salir del sistema",
    logo: (role: string) => `Smooth Flow — ${role}`,
    notifications: "Ver notificaciones de la agenda",
    unreadNotifications: (count: number) =>
      `${count} notificación${count === 1 ? "" : "es"} sin leer`,
    realtimeConnected: "Sincronización en tiempo real activa",
    realtimeReconnecting: "Reconectando… los cambios pueden demorar en reflejarse",
    realtimeOffline: "Sin conexión — los cambios pueden no reflejarse al instante",
    userAvatar: (name: string, role: string) => `${name} — ${role}`,
    closeDrawer: "Cerrar sin guardar",
    patientPortalLink:
      "Acceso exclusivo para pacientes. Si es personal de la clínica, use el formulario de arriba.",
  },
  calendar: {
    slotStatus: {
      disponible: "Cupos libres para agendar",
      reservado: "Cita asignada a un paciente",
      bloqueado: "Horario no disponible (bloqueado)",
    } satisfies Record<SlotStatus, string>,
    appointmentStatus: {
      atendido: "Paciente ya fue atendido",
      no_asistio: "Paciente no se presentó a la cita",
      cancelacion_pendiente:
        "El médico solicitó cancelar; requiere aprobación de la secretaría",
    },
    practitionerBadge: (name: string) => `Dr. ${name}`,
    refreshing: "Sincronizando cambios de la agenda…",
    currentTime: "Hora actual en la clínica",
    dayHeader: (dateLabel: string) => `Ver detalle del ${dateLabel}`,
    scheduleBlock: (start: string, end: string) =>
      `Bloque de ${start} a ${end}. Clic para editar o eliminar.`,
    emptyCell: "Clic para crear un bloque de atención",
    dayName: {
      1: "Lunes",
      2: "Martes",
      3: "Miércoles",
      4: "Jueves",
      5: "Viernes",
    } as Record<number, string>,
    legendBlock: "Bloque configurado con citas de duración fija",
    legendEmpty: "Celda disponible para crear un bloque de atención",
    presetMorning: "Aplicar horario típico de mañana (09:00–13:00)",
    presetAfternoon: "Aplicar horario típico de tarde (14:00–18:00)",
    presetFullDay: "Aplicar jornada completa (09:00–18:00)",
    slotDuration: "Duración de cada cupo de atención dentro del bloque",
    slotPreview: "Cantidad estimada de cupos según el rango y duración seleccionados",
    navPrevWeek: "Semana anterior",
    navNextWeek: "Semana siguiente",
    navPrevDay: "Día anterior",
    navNextDay: "Día siguiente",
    goToWeek: "Ir a la semana actual",
    goToToday: "Ir al día de hoy",
    viewWeek: "Vista semanal",
    viewDay: "Vista diaria",
    blockAgenda: "Bloquear horarios de un médico",
    refreshAgenda: "Actualizar datos de la agenda",
    filterPractitioner: "Filtrar la agenda por un médico específico",
    overlapBadge:
      "Al ver todos los médicos, los horarios de distintos profesionales pueden coincidir visualmente",
    createReservation: "Agendar una cita para un paciente en un horario disponible",
    availableSlot: "Seleccionar este horario para su cita",
    bookingSteps:
      "Complete cada paso en orden: especialidad → médico → horario → confirmación",
    bookingWindow: "Solo se muestran cupos disponibles en los siguientes 14 días",
    selectPractitioner: "Seleccionar a este profesional para ver horarios disponibles",
  },
  owner: {
    inactiveFilter: "Empleados desvinculados que ya no tienen acceso al sistema",
    statusActive: "Cuenta activa con acceso al sistema",
    statusInactive: "Cuenta inactiva o desvinculada",
    badgeActive: "Puede iniciar sesión",
    badgeInactive: "Sin acceso; revincule desde Configuración",
    unlinkStaff: "Revocar acceso inmediato y cerrar sesiones activas",
    editSpecialty: "Editar nombre y descripción de la especialidad",
    deleteSpecialty: "Eliminar especialidad. No se puede deshacer.",
    relinkStaff: "Restaurar acceso con las credenciales anteriores",
    hardDeleteStaff: "Eliminar registro del empleado de forma irreversible",
    newSpecialty:
      "Las especialidades agrupan médicos y filtran la reserva de pacientes",
    occupationColumn: "Porcentaje de cupos reservados sobre el total disponible ese día",
    occupationBar: (pct: number, reserved: number, total: number) =>
      `Ocupación: ${pct}% — ${reserved} de ${total} cupos reservados`,
    staffRole: "Rol y permisos en el sistema",
  },
  secretary: {
    kpiToday: "Total de citas y bloqueos programados para hoy",
    kpiConfirmed: "Citas con estado confirmado o reservado activo",
    kpiBlocked: "Horarios bloqueados por el médico o la secretaría",
    pendingRequests: (count: number) =>
      `${count} solicitud${count === 1 ? "" : "es"} de cancelación del médico pendiente${count === 1 ? "" : "s"} de revisión`,
    pendingRequestRow: "Clic para revisar y aprobar o rechazar la cancelación",
    portalAccess: "El paciente creó cuenta y puede gestionar sus citas en línea",
    noPortalAccess:
      "Ficha clínica sin cuenta de portal; la secretaría agenda en su nombre",
    portalColumn: "Indica si el paciente tiene cuenta activa en el portal web",
    registeredColumn: "Fecha en que se creó la ficha del paciente en la clínica",
    originalSchedule: "Fecha y hora actuales de la cita",
    newSchedule: "Horario propuesto por el paciente, pendiente de aprobación",
    approveReschedule: "Confirmar el reagendamiento al nuevo horario",
    rejectReschedule: "Mantener la cita en el horario original",
    approveCancellation: "Cancelar la cita definitivamente",
    rejectCancellation: "Rechazar la solicitud y mantener la cita",
    liftBlock: "Liberar el horario bloqueado para nuevas reservas",
    reviewReason: "Obligatorio para documentar su decisión (mín. 5 caracteres)",
    blockReason: "Ej.: reunión, vacaciones, emergencia. Visible en la agenda.",
    reservationNotes: "Información interna para la secretaría o el médico",
  },
  doctor: {
    historyScope: "Muestra citas de los últimos 30 días",
    status: {
      reservado: "Cita reservada, pendiente de confirmación",
      confirmado: "Cita confirmada por la clínica",
      reagendado: "Cita reagendada a un nuevo horario",
      atendido: "Paciente atendido",
      no_asistio: "Paciente no se presentó",
      cancelado: "Cita cancelada",
      cancelacion_pendiente: "Cancelación solicitada, pendiente de aprobación",
    } satisfies Partial<Record<AppointmentStatus, string>>,
    markAttended: "Registrar que el paciente fue atendido",
    markNoShow: "Marcar inasistencia del paciente",
    requestCancel: "Solicitar cancelación; la secretaría debe aprobarla",
    actionWindow: "Disponible desde 15 minutos antes del inicio de la cita",
    reservedSlot: "Clic para ver detalle y registrar asistencia",
    availableSlot: "Horario libre sin cita asignada",
  },
  patient: {
    rutOptional:
      "Documento de identidad chileno. Opcional, pero facilita la identificación en la clínica.",
    phoneOptional: "Para contactarlo sobre cambios o recordatorios de su cita",
    appointmentStatus: {
      reservado: "Su cita está reservada, pendiente de confirmación por la clínica",
      confirmado: "Su cita está confirmada y activa",
      reagendado: "Su cita fue reagendada a un nuevo horario",
      atendido: "Cita completada",
      no_asistio: "Registrada como inasistencia",
      cancelado: "Cita cancelada",
      cancelacion_pendiente: "Cancelación en proceso de aprobación",
    } satisfies Partial<Record<AppointmentStatus, string>>,
    pendingReschedule:
      "Su solicitud de nuevo horario está siendo revisada por la secretaría",
    rescheduleDisabled:
      "No puede reagendar en línea con menos de 24 horas de anticipación",
    cancelDisabled:
      "Para cancelar con menos de 24 horas, contacte directamente a la clínica",
    rescheduleRequest:
      "La secretaría debe aprobar el cambio antes de que quede confirmado",
  },
} as const;
