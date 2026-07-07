import type {
  CreateStaffInput,
  UpdateStaffInput,
  CreateSpecialtyInput,
  UpdateSpecialtyInput,
  CreatePractitionerInput,
  CreateScheduleTemplateInput,
  UpdateScheduleTemplateInput,
  SessionUser,
  UserDto,
  SpecialtyDto,
  PractitionerDto,
  ScheduleTemplateDto,
  OccupancyReportDto,
} from "@smoothflow/shared";
import { NotFoundError, ConflictError, ValidationError } from "../domain/errors.js";
import { requireClinic } from "../domain/access/require-clinic.js";
import { canUnlinkStaff, canRelinkStaff, canDeleteStaff, isRevokedStaff } from "../domain/staff-rules.js";
import {
  findOverlappingSchedule,
  isValidScheduleRange,
} from "../domain/scheduling/schedule-overlap.js";
import { computeDayOccupancy } from "../domain/scheduling/occupancy.js";
import { buildWeekDayRanges, toIsoDate } from "../domain/scheduling/week-range.js";
import { userToDto } from "../domain/mappers/user.js";
import { specialtyToDto } from "../domain/mappers/specialty.js";
import type { PasswordHasher } from "../domain/ports/password-hasher.port.js";
import type { AuditLogger } from "../domain/ports/audit-logger.port.js";
import type { AgendaSyncPort } from "../domain/ports/agenda-sync.port.js";
import type { SessionRevoker } from "../domain/ports/session-revoker.port.js";
import type { UserRepository } from "../domain/ports/user.repository.js";
import type { PractitionerRepository } from "../domain/ports/practitioner.repository.js";
import type { SpecialtyRepository } from "../domain/ports/specialty.repository.js";
import type { ScheduleRepository } from "../domain/ports/schedule.repository.js";
import type { AppointmentRepository } from "../domain/ports/appointment.repository.js";

export interface OwnerUseCasesDeps {
  users: UserRepository;
  practitioners: PractitionerRepository;
  specialties: SpecialtyRepository;
  schedules: ScheduleRepository;
  appointments: AppointmentRepository;
  passwordHasher: PasswordHasher;
  auditLogger: AuditLogger;
  agendaSync: AgendaSyncPort;
  sessionRevoker: SessionRevoker;
}

export function createOwnerUseCases(deps: OwnerUseCasesDeps) {
  const {
    users,
    practitioners,
    specialties,
    schedules,
    appointments,
    passwordHasher,
    auditLogger,
    agendaSync,
    sessionRevoker,
  } = deps;

  async function listStaff(clinicId: string): Promise<UserDto[]> {
    const staff = await users.listStaff(clinicId);
    return staff.map(userToDto);
  }

  async function createStaff(
    user: SessionUser,
    input: CreateStaffInput,
    ip: string,
  ): Promise<UserDto> {
    const clinicId = requireClinic(user);
    const passwordHash = await passwordHasher.hash(input.password);
    const created = await users.create({
      clinicId,
      email: input.email.toLowerCase(),
      passwordHash,
      role: input.role,
      givenName: input.givenName,
      familyName: input.familyName,
    });

    if (input.role === "medico") {
      const specialtyId = input.specialtyId;
      if (!specialtyId) throw new ValidationError("Especialidad requerida para médicos");
      const practitioner = await practitioners.createForStaff({
        clinicId,
        userId: created.id,
        specialtyId,
        givenName: input.givenName,
        familyName: input.familyName,
        email: input.email.toLowerCase(),
      });
      await schedules.createDefaults(practitioner.id);
    }

    await auditLogger.write({
      clinicId,
      userId: user.id,
      action: "CREATE",
      resource: "staff",
      resourceId: created.id,
      ipAddress: ip,
    });

    return userToDto(created);
  }

  async function updateStaff(
    user: SessionUser,
    staffId: string,
    input: UpdateStaffInput,
    ip: string,
  ): Promise<UserDto> {
    const clinicId = requireClinic(user);
    const existing = await users.findById(staffId);
    if (!existing || existing.clinicId !== clinicId) throw new NotFoundError("Usuario no encontrado");

    const updated = await users.update(staffId, {
      givenName: input.givenName ?? existing.givenName,
      familyName: input.familyName ?? existing.familyName,
      role: input.role ?? existing.role,
      active: input.active ?? existing.active,
    });

    await auditLogger.write({
      clinicId,
      userId: user.id,
      action: "UPDATE",
      resource: "staff",
      resourceId: staffId,
      ipAddress: ip,
    });

    return userToDto(updated);
  }

  async function unlinkStaff(user: SessionUser, staffId: string, ip: string): Promise<void> {
    const clinicId = requireClinic(user);
    const existing = await users.findById(staffId);
    if (!existing || existing.clinicId !== clinicId) throw new NotFoundError("Usuario no encontrado");
    if (!canUnlinkStaff(existing.role)) throw new ValidationError("No se puede desvincular al dueño");

    await users.markRevoked(staffId);
    await sessionRevoker.revokeUserSessions(staffId);
    agendaSync.broadcastSessionRevoked(staffId);

    await auditLogger.write({
      clinicId,
      userId: user.id,
      action: "UNLINK",
      resource: "staff",
      resourceId: staffId,
      ipAddress: ip,
    });
  }

  async function relinkStaff(
    user: SessionUser,
    staffId: string,
    ip: string,
  ): Promise<UserDto> {
    const clinicId = requireClinic(user);
    const existing = await users.findById(staffId);
    if (!existing || existing.clinicId !== clinicId) throw new NotFoundError("Usuario no encontrado");
    if (!canRelinkStaff(existing.role)) throw new ValidationError("No se puede revincular al dueño");
    if (!isRevokedStaff(existing)) {
      throw new ValidationError("Solo se puede revincular personal previamente desvinculado");
    }

    const updated = await users.update(staffId, { active: true, revokedAt: null });

    await auditLogger.write({
      clinicId,
      userId: user.id,
      action: "RELINK",
      resource: "staff",
      resourceId: staffId,
      ipAddress: ip,
    });

    return userToDto(updated);
  }

  async function deleteStaffPermanently(
    user: SessionUser,
    staffId: string,
    ip: string,
  ): Promise<void> {
    const clinicId = requireClinic(user);
    const existing = await users.findById(staffId);
    if (!existing || existing.clinicId !== clinicId) throw new NotFoundError("Usuario no encontrado");
    if (!canDeleteStaff(existing.role)) throw new ValidationError("No se puede eliminar al dueño");
    if (!isRevokedStaff(existing)) {
      throw new ValidationError("Solo se puede eliminar personal previamente desvinculado");
    }

    await auditLogger.write({
      clinicId,
      userId: user.id,
      action: "DELETE",
      resource: "staff",
      resourceId: staffId,
      ipAddress: ip,
      metadata: {
        givenName: existing.givenName,
        familyName: existing.familyName,
        email: existing.email,
        role: existing.role,
      },
    });

    await sessionRevoker.revokeUserSessions(staffId);
    await users.deleteWithReferences(staffId);
  }

  async function listSpecialties(clinicId: string): Promise<SpecialtyDto[]> {
    const items = await specialties.listForClinic(clinicId);
    return items.map(specialtyToDto);
  }

  async function createSpecialty(
    user: SessionUser,
    input: CreateSpecialtyInput,
    ip: string,
  ): Promise<SpecialtyDto> {
    const clinicId = requireClinic(user);
    const created = await specialties.create(clinicId, {
      name: input.name,
      description: input.description ?? null,
    });
    await auditLogger.write({
      clinicId,
      userId: user.id,
      action: "CREATE",
      resource: "specialty",
      resourceId: created.id,
      ipAddress: ip,
    });
    return specialtyToDto(created);
  }

  async function updateSpecialty(
    user: SessionUser,
    specialtyId: string,
    input: UpdateSpecialtyInput,
    ip: string,
  ): Promise<SpecialtyDto> {
    const clinicId = requireClinic(user);
    const found = await specialties.findForClinic(clinicId, specialtyId);
    if (!found) throw new NotFoundError("Especialidad no encontrada");

    const updated = await specialties.update(clinicId, specialtyId, {
      name: input.name,
      description: input.description,
    });

    await auditLogger.write({
      clinicId,
      userId: user.id,
      action: "UPDATE",
      resource: "specialty",
      resourceId: specialtyId,
      ipAddress: ip,
    });

    return specialtyToDto(updated);
  }

  async function deleteSpecialty(
    user: SessionUser,
    specialtyId: string,
    ip: string,
  ): Promise<void> {
    const clinicId = requireClinic(user);
    const found = await specialties.findForClinic(clinicId, specialtyId);
    if (!found) throw new NotFoundError("Especialidad no encontrada");

    if (await practitioners.existsForSpecialty(specialtyId)) {
      throw new ConflictError("No se puede eliminar: hay médicos asignados a esta especialidad");
    }

    await specialties.delete(clinicId, specialtyId);

    await auditLogger.write({
      clinicId,
      userId: user.id,
      action: "DELETE",
      resource: "specialty",
      resourceId: specialtyId,
      ipAddress: ip,
    });
  }

  async function listPractitioners(clinicId: string): Promise<PractitionerDto[]> {
    return practitioners.listForClinic(clinicId);
  }

  async function createPractitioner(
    user: SessionUser,
    input: CreatePractitionerInput,
    ip: string,
  ): Promise<PractitionerDto> {
    const clinicId = requireClinic(user);
    const created = await practitioners.create({
      clinicId,
      userId: input.userId ?? null,
      specialtyId: input.specialtyId,
      givenName: input.givenName,
      familyName: input.familyName,
      email: input.email ?? null,
    });
    await auditLogger.write({
      clinicId,
      userId: user.id,
      action: "CREATE",
      resource: "practitioner",
      resourceId: created.id,
      ipAddress: ip,
    });
    return created;
  }

  async function listSchedules(clinicId: string): Promise<ScheduleTemplateDto[]> {
    return schedules.listForClinic(clinicId);
  }

  async function createSchedule(
    user: SessionUser,
    input: CreateScheduleTemplateInput,
    ip: string,
  ): Promise<ScheduleTemplateDto> {
    const clinicId = requireClinic(user);
    const practitioner = await practitioners.findById(input.practitionerId);
    if (!practitioner || practitioner.clinicId !== clinicId) {
      throw new NotFoundError("Profesional no encontrado");
    }
    if (!isValidScheduleRange(input.startTime, input.endTime)) {
      throw new ValidationError("La hora de inicio debe ser anterior a la hora de fin");
    }

    const existing = await schedules.listForPractitioner(input.practitionerId);

    const overlap = findOverlappingSchedule(
      input,
      existing,
      undefined,
      existing.map((r) => r.id),
    );
    if (overlap) {
      throw new ConflictError("El horario se superpone con otro bloque del mismo día");
    }

    const created = await schedules.create(input);
    await auditLogger.write({
      clinicId,
      userId: user.id,
      action: "CREATE",
      resource: "schedule_template",
      resourceId: created.id,
      ipAddress: ip,
    });
    return created;
  }

  async function updateSchedule(
    user: SessionUser,
    scheduleId: string,
    input: UpdateScheduleTemplateInput,
    ip: string,
  ): Promise<ScheduleTemplateDto> {
    const clinicId = requireClinic(user);
    const existing = await schedules.findForClinic(clinicId, scheduleId);
    if (!existing) throw new NotFoundError("Horario no encontrado");

    const nextSchedule = {
      dayOfWeek: input.dayOfWeek ?? existing.dayOfWeek,
      startTime: input.startTime ?? existing.startTime,
      endTime: input.endTime ?? existing.endTime,
      slotDurationMinutes: input.slotDurationMinutes ?? existing.slotDurationMinutes,
    };

    if (!isValidScheduleRange(nextSchedule.startTime, nextSchedule.endTime)) {
      throw new ValidationError("La hora de inicio debe ser anterior a la hora de fin");
    }

    const siblings = await schedules.listForPractitioner(existing.practitionerId);

    const overlap = findOverlappingSchedule(
      {
        dayOfWeek: nextSchedule.dayOfWeek,
        startTime: nextSchedule.startTime,
        endTime: nextSchedule.endTime,
      },
      siblings,
      scheduleId,
      siblings.map((r) => r.id),
    );
    if (overlap) {
      throw new ConflictError("El horario se superpone con otro bloque del mismo día");
    }

    const updated = await schedules.update(scheduleId, nextSchedule);

    await auditLogger.write({
      clinicId,
      userId: user.id,
      action: "UPDATE",
      resource: "schedule_template",
      resourceId: scheduleId,
      ipAddress: ip,
    });

    return updated;
  }

  async function deleteSchedule(
    user: SessionUser,
    scheduleId: string,
    ip: string,
  ): Promise<void> {
    const clinicId = requireClinic(user);
    const existing = await schedules.findForClinic(clinicId, scheduleId);
    if (!existing) throw new NotFoundError("Horario no encontrado");

    await schedules.delete(scheduleId);

    await auditLogger.write({
      clinicId,
      userId: user.id,
      action: "DELETE",
      resource: "schedule_template",
      resourceId: scheduleId,
      ipAddress: ip,
    });
  }

  async function getOccupancyReport(
    clinicId: string,
    weekStart: string,
  ): Promise<OccupancyReportDto> {
    const start = new Date(weekStart);
    const days = [];
    for (const { date, start: dayStart, end: dayEnd } of buildWeekDayRanges(start)) {
      const statuses = await appointments.listStatusesForDay(clinicId, dayStart, dayEnd);

      const occupancy = computeDayOccupancy(statuses);
      days.push({
        date,
        ...occupancy,
      });
    }
    return { weekStart: toIsoDate(start), days };
  }

  return {
    listStaff,
    createStaff,
    updateStaff,
    unlinkStaff,
    relinkStaff,
    deleteStaffPermanently,
    listSpecialties,
    createSpecialty,
    updateSpecialty,
    deleteSpecialty,
    listPractitioners,
    createPractitioner,
    listSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    getOccupancyReport,
  };
}

export type OwnerUseCases = ReturnType<typeof createOwnerUseCases>;
