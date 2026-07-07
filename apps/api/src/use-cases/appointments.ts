import type {
  CreateAppointmentInput,
  UpdateAppointmentInput,
  CreateBlockInput,
  AvailabilityQuery,
  SessionUser,
  AppointmentDto,
  AvailabilitySlotDto,
  DoctorActionInput,
  ReviewCancellationInput,
  AppointmentStatus,
} from "@smoothflow/shared";
import { NotFoundError, ConflictError, ValidationError, ForbiddenError } from "../domain/errors.js";
import { requireClinic } from "../domain/access/require-clinic.js";
import {
  findBookingConflict,
  hasAppointmentsBlockingRange,
} from "../domain/scheduling/appointment-rules.js";
import { generateSlotsFromTemplate } from "../domain/scheduling/slot-generator.js";
import { appointmentToDto } from "../domain/mappers/appointment.js";
import type { AuditLogger } from "../domain/ports/audit-logger.port.js";
import type { AppointmentNotifier } from "../domain/ports/appointment-notifier.port.js";
import type { AgendaSyncPort } from "../domain/ports/agenda-sync.port.js";
import type {
  AppointmentRepository,
  AppointmentListFilters,
} from "../domain/ports/appointment.repository.js";
import type { PatientRepository } from "../domain/ports/patient.repository.js";
import type { PractitionerRepository } from "../domain/ports/practitioner.repository.js";

export interface AppointmentUseCasesDeps {
  appointments: AppointmentRepository;
  patients: PatientRepository;
  practitioners: PractitionerRepository;
  auditLogger: AuditLogger;
  notifier: AppointmentNotifier;
  agendaSync: AgendaSyncPort;
}

const DOCTOR_ACTIONABLE_STATUSES = new Set(["reservado", "confirmado", "reagendado"]);

export function createAppointmentUseCases(deps: AppointmentUseCasesDeps) {
  const { appointments, patients, practitioners, auditLogger, notifier, agendaSync } = deps;

  async function assertNoConflict(
    clinicId: string,
    practitionerId: string,
    startAt: Date,
    endAt: Date,
    excludeId?: string,
  ) {
    if (startAt.getTime() < Date.now()) {
      throw new ValidationError("No se puede agendar ni solicitar citas en el pasado.");
    }
    const rows = await appointments.findConflicting(clinicId, practitionerId, startAt, endAt);
    const conflict = findBookingConflict(rows, startAt, endAt, excludeId);
    if (conflict) {
      throw new ConflictError("El horario ya está ocupado o bloqueado", "DOUBLE_BOOKING");
    }
  }

  async function assertNoConfirmedAppointmentsInBlockRange(
    clinicId: string,
    practitionerId: string,
    startAt: Date,
    endAt: Date,
  ): Promise<void> {
    const rows = await appointments.findBlockingCandidates(
      clinicId,
      practitionerId,
      startAt,
      endAt,
    );
    if (hasAppointmentsBlockingRange(rows, startAt, endAt)) {
      throw new ConflictError(
        "Existen citas confirmadas en el rango seleccionado. Gestiónelas antes de bloquear.",
        "BLOCK_CONFLICT",
      );
    }
  }

  async function listAppointments(
    user: SessionUser,
    filters: { from?: string; to?: string; practitionerId?: string },
  ): Promise<AppointmentDto[]> {
    const clinicId = user.role === "paciente" ? user.clinicId : requireClinic(user);

    const query: AppointmentListFilters = {};
    if (user.role === "medico") {
      const practitioner = await practitioners.findByUserId(user.id);
      if (!practitioner) return [];
      query.practitionerId = practitioner.id;
    } else if (user.role === "paciente") {
      const patient = await patients.findByUserId(user.id);
      if (!patient) return [];
      query.patientId = patient.id;
    } else if (clinicId) {
      query.clinicId = clinicId;
    }

    if (query.practitionerId === undefined && filters.practitionerId) {
      query.practitionerId = filters.practitionerId;
    }
    if (filters.from) query.from = filters.from;
    if (filters.to) query.to = filters.to;

    return appointments.list(query);
  }

  async function createAppointmentForClinic(
    clinicId: string,
    user: SessionUser,
    input: CreateAppointmentInput,
    ip: string,
    patientId: string,
  ): Promise<AppointmentDto> {
    const startAt = new Date(input.startAt);
    const endAt = new Date(input.endAt);
    await assertNoConflict(clinicId, input.practitionerId, startAt, endAt);

    const created = await appointments.create({
      clinicId,
      patientId,
      practitionerId: input.practitionerId,
      status: "confirmado",
      startAt,
      endAt,
      notes: input.notes ?? null,
      createdByUserId: user.id,
    });

    await appointments.addEvent({
      appointmentId: created.id,
      userId: user.id,
      newStatus: "confirmado",
    });

    await auditLogger.write({
      clinicId,
      userId: user.id,
      action: "CREATE",
      resource: "appointment",
      resourceId: created.id,
      ipAddress: ip,
    });

    const patient = await patients.findById(patientId);
    if (patient?.email) {
      await notifier.sendConfirmation(patient.email, "reserva", created.startAt.toISOString());
    }

    const dto = appointmentToDto(created);
    agendaSync.broadcastUpdate(clinicId, { type: "appointment:created", appointment: dto });
    return dto;
  }

  async function createAppointment(
    user: SessionUser,
    input: CreateAppointmentInput,
    ip: string,
  ): Promise<AppointmentDto> {
    if (user.role === "paciente") {
      const patient = await patients.findByUserId(user.id);
      if (!patient) throw new NotFoundError("Paciente no encontrado");
      return createAppointmentForClinic(patient.clinicId, user, input, ip, patient.id);
    }
    const clinicId = requireClinic(user);
    if (!input.patientId) throw new ValidationError("patientId requerido");
    return createAppointmentForClinic(clinicId, user, input, ip, input.patientId);
  }

  async function updateAppointment(
    user: SessionUser,
    id: string,
    input: UpdateAppointmentInput,
    ip: string,
  ): Promise<AppointmentDto> {
    const existing = await appointments.findById(id);
    if (!existing) throw new NotFoundError("Cita no encontrada");
    if (user.clinicId && existing.clinicId !== user.clinicId && user.role !== "paciente") {
      throw new ForbiddenError("Acceso denegado");
    }

    if (user.role === "paciente") {
      const hoursUntilAppointment = (existing.startAt.getTime() - Date.now()) / (1000 * 60 * 60);
      if (hoursUntilAppointment < 24) {
        throw new ForbiddenError("No puedes modificar o cancelar una cita con menos de 24 horas de anticipación. Por favor, contacta a la clínica.");
      }
    }

    let startAt = input.startAt ? new Date(input.startAt) : existing.startAt;
    let endAt = input.endAt ? new Date(input.endAt) : existing.endAt;
    let newStatus = input.status ?? existing.status;
    let pendingReschedule: { startAt: Date; endAt: Date } | null =
      input.pendingReschedule !== undefined
        ? input.pendingReschedule
          ? {
              startAt: new Date(input.pendingReschedule.startAt),
              endAt: new Date(input.pendingReschedule.endAt),
            }
          : null
        : existing.pendingReschedule;

    if (user.role === "paciente" && input.startAt && input.endAt && input.status === "reagendado") {
      // El paciente solicita reagendar: interceptamos la fecha y no modificamos la cita original
      pendingReschedule = { startAt: new Date(input.startAt), endAt: new Date(input.endAt) };
      startAt = existing.startAt;
      endAt = existing.endAt;
      newStatus = existing.status;
    }

    if (pendingReschedule) {
      await assertNoConflict(existing.clinicId, existing.practitionerId, pendingReschedule.startAt, pendingReschedule.endAt, id);
    } else if (startAt !== existing.startAt || endAt !== existing.endAt) {
      await assertNoConflict(existing.clinicId, existing.practitionerId, startAt, endAt, id);
    }

    const updated = await appointments.update(id, {
      startAt,
      endAt,
      status: newStatus,
      notes: input.notes ?? existing.notes,
      pendingReschedule,
    });

    await appointments.addEvent({
      appointmentId: id,
      userId: user.id,
      previousStatus: existing.status,
      newStatus,
    });

    await auditLogger.write({
      clinicId: existing.clinicId,
      userId: user.id,
      action: "UPDATE",
      resource: "appointment",
      resourceId: id,
      ipAddress: ip,
      metadata: { status: newStatus },
    });

    if (existing.patientId) {
      const patient = await patients.findById(existing.patientId);
      if (patient?.email) {
        const action =
          newStatus === "cancelado"
            ? "cancelación"
            : input.startAt
              ? "reagendamiento"
              : "reserva";
        await notifier.sendConfirmation(patient.email, action, updated.startAt.toISOString());
      }
    }

    const dto = appointmentToDto(updated);
    agendaSync.broadcastUpdate(existing.clinicId, { type: "appointment:updated", appointment: dto });
    return dto;
  }

  async function applyDoctorAction(
    user: SessionUser,
    id: string,
    input: DoctorActionInput,
    ip: string,
  ): Promise<AppointmentDto> {
    const practitioner = await practitioners.findByUserId(user.id);
    if (!practitioner) throw new NotFoundError("Médico no encontrado");

    const existing = await appointments.findById(id);
    if (!existing) throw new NotFoundError("Cita no encontrada");
    if (existing.practitionerId !== practitioner.id) {
      throw new ForbiddenError("Solo puede gestionar sus propias citas");
    }
    if (!DOCTOR_ACTIONABLE_STATUSES.has(existing.status)) {
      throw new ConflictError("La cita no admite esta acción en su estado actual", "INVALID_STATUS");
    }

    const newStatus =
      input.action === "atendido"
        ? ("atendido" as const)
        : input.action === "no_asistio"
          ? ("no_asistio" as const)
          : ("cancelacion_pendiente" as const);

    const updated = await appointments.update(id, {
      status: newStatus,
      requestedByUserId:
        input.action === "solicitar_cancelacion" ? user.id : existing.requestedByUserId,
      requestReason:
        input.action === "solicitar_cancelacion"
          ? (input.reason?.trim() ?? null)
          : existing.requestReason,
    });

    await appointments.addEvent({
      appointmentId: id,
      userId: user.id,
      previousStatus: existing.status,
      newStatus,
      metadata: input.reason ? { reason: input.reason } : undefined,
    });

    await auditLogger.write({
      clinicId: existing.clinicId,
      userId: user.id,
      action: "DOCTOR_ACTION",
      resource: "appointment",
      resourceId: id,
      ipAddress: ip,
      metadata: { action: input.action, status: newStatus },
    });

    const dto = appointmentToDto(updated);
    agendaSync.broadcastUpdate(existing.clinicId, { type: "appointment:updated", appointment: dto });
    return dto;
  }

  async function reviewCancellationRequest(
    user: SessionUser,
    id: string,
    input: ReviewCancellationInput,
    ip: string,
  ): Promise<AppointmentDto> {
    const existing = await appointments.findById(id);
    if (!existing) throw new NotFoundError("Cita no encontrada");
    if (!user.clinicId || existing.clinicId !== user.clinicId) {
      throw new ForbiddenError("Acceso denegado");
    }
    if (existing.status !== "cancelacion_pendiente") {
      throw new ConflictError("La cita no tiene una solicitud de cancelación pendiente", "INVALID_STATUS");
    }

    // Al rechazar, restaurar el estado que tenía la cita antes de la solicitud.
    let restoredStatus: AppointmentStatus = "confirmado";
    if (input.decision === "rechazar") {
      const previousStatus = await appointments.findPreviousStatusOfLatestRequest(id);
      if (previousStatus) restoredStatus = previousStatus;
    }

    const newStatus = input.decision === "aprobar" ? ("cancelado" as const) : restoredStatus;

    const updated = await appointments.update(id, {
      status: newStatus,
      reviewedByUserId: user.id,
      reviewNote: input.note.trim(),
      reviewedAt: new Date(),
    });

    await appointments.addEvent({
      appointmentId: id,
      userId: user.id,
      previousStatus: existing.status,
      newStatus,
      metadata: { decision: input.decision, note: input.note },
    });

    await auditLogger.write({
      clinicId: existing.clinicId,
      userId: user.id,
      action: "REVIEW_CANCELLATION",
      resource: "appointment",
      resourceId: id,
      ipAddress: ip,
      metadata: { decision: input.decision },
    });

    if (input.decision === "aprobar" && existing.patientId) {
      const patient = await patients.findById(existing.patientId);
      if (patient?.email) {
        await notifier.sendConfirmation(patient.email, "cancelación", updated.startAt.toISOString());
      }
    }

    const dto = appointmentToDto(updated);
    agendaSync.broadcastUpdate(existing.clinicId, { type: "appointment:updated", appointment: dto });
    return dto;
  }

  async function createBlock(
    user: SessionUser,
    input: CreateBlockInput,
    ip: string,
  ): Promise<AppointmentDto> {
    const clinicId = requireClinic(user);
    const startAt = new Date(input.startAt);
    const endAt = new Date(input.endAt);

    await assertNoConfirmedAppointmentsInBlockRange(
      clinicId,
      input.practitionerId,
      startAt,
      endAt,
    );

    const created = await appointments.create({
      clinicId,
      practitionerId: input.practitionerId,
      status: "bloqueado",
      startAt,
      endAt,
      notes: input.reason ?? "Bloqueo de agenda",
      createdByUserId: user.id,
    });

    await auditLogger.write({
      clinicId,
      userId: user.id,
      action: "BLOCK",
      resource: "appointment",
      resourceId: created.id,
      ipAddress: ip,
    });

    const dto = appointmentToDto(created);
    agendaSync.broadcastUpdate(clinicId, { type: "appointment:blocked", appointment: dto });
    return dto;
  }

  async function getAvailability(
    clinicId: string,
    query: AvailabilityQuery,
  ): Promise<AvailabilitySlotDto[]> {
    const data = await appointments.getAvailabilityData(clinicId, query);
    if (data.practitioners.length === 0) return [];

    const from = new Date(query.from);
    const to = new Date(query.to);

    const allSlots: AvailabilitySlotDto[] = [];
    for (const practitioner of data.practitioners) {
      const pTemplates = data.templates.filter((t) => t.practitionerId === practitioner.id);
      const pBooked = data.booked.filter((b) => b.practitionerId === practitioner.id);
      for (const template of pTemplates) {
        allSlots.push(
          ...generateSlotsFromTemplate(template, from, to, practitioner, pBooked, data.timezone),
        );
      }
    }

    const now = Date.now();
    // Los slots libres pasados se ocultan (no se puede reservar en el pasado),
    // pero las citas reservadas/bloqueadas en curso o pasadas siguen visibles
    // para que puedan gestionarse (marcar asistencia, etc.).
    const validSlots = allSlots.filter(
      (s) => s.status !== "disponible" || new Date(s.startAt).getTime() > now,
    );

    return validSlots.sort((a, b) => a.startAt.localeCompare(b.startAt));
  }

  async function getAvailabilityForUser(
    user: SessionUser,
    query: AvailabilityQuery,
  ): Promise<AvailabilitySlotDto[]> {
    const clinicId = requireClinic(user);
    if (user.role === "medico") {
      const practitioner = await practitioners.findByUserId(user.id);
      if (!practitioner) return [];
      return getAvailability(clinicId, { ...query, practitionerId: practitioner.id });
    }
    return getAvailability(clinicId, query);
  }

  return {
    listAppointments,
    createAppointment,
    updateAppointment,
    applyDoctorAction,
    reviewCancellationRequest,
    createBlock,
    getAvailability,
    getAvailabilityForUser,
  };
}

export type AppointmentUseCases = ReturnType<typeof createAppointmentUseCases>;
