import { eq, and, gte, lte, sql } from "drizzle-orm";
import type {
  CreateStaffInput,
  UpdateStaffInput,
  CreateSpecialtyInput,
  UpdateSpecialtyInput,
  CreatePractitionerInput,
  CreateScheduleTemplateInput,
  SessionUser,
  UserDto,
  SpecialtyDto,
  PractitionerDto,
  ScheduleTemplateDto,
  OccupancyReportDto,
} from "@smoothflow/shared";
import { db } from "../infrastructure/db/client.js";
import {
  users,
  specialties,
  practitioners,
  scheduleTemplates,
  appointments,
} from "../infrastructure/db/schema.js";
import { AppError } from "../domain/errors.js";
import { canUnlinkStaff } from "../domain/staff-rules.js";
import { hashPassword, unlinkUser } from "../infrastructure/auth/password.js";
import { writeAuditLog } from "../infrastructure/audit/audit-logger.js";
import { agendaSyncPort } from "../infrastructure/realtime/agenda-sync.port-impl.js";

function requireClinic(user: SessionUser): string {
  if (!user.clinicId) throw new AppError("Clínica no asignada", 400);
  return user.clinicId;
}

export async function listStaff(clinicId: string): Promise<UserDto[]> {
  const rows = await db
    .select()
    .from(users)
    .where(and(eq(users.clinicId, clinicId), sql`${users.role} != 'paciente'`));
  return rows.map((r) => ({
    id: r.id,
    clinicId: r.clinicId,
    email: r.email,
    role: r.role,
    givenName: r.givenName,
    familyName: r.familyName,
    active: r.active,
    revokedAt: r.revokedAt?.toISOString() ?? null,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function createStaff(
  user: SessionUser,
  input: CreateStaffInput,
  ip: string,
): Promise<UserDto> {
  const clinicId = requireClinic(user);
  const passwordHash = await hashPassword(input.password);
  const [created] = await db
    .insert(users)
    .values({
      clinicId,
      email: input.email.toLowerCase(),
      passwordHash,
      role: input.role,
      givenName: input.givenName,
      familyName: input.familyName,
    })
    .returning();

  if (input.role === "medico") {
    const specialtyId = input.specialtyId;
    if (!specialtyId) throw new AppError("Especialidad requerida para médicos", 400);
    await db.insert(practitioners).values({
      clinicId,
      userId: created.id,
      specialtyId,
      givenName: input.givenName,
      familyName: input.familyName,
      email: input.email.toLowerCase(),
    });
  }

  await writeAuditLog({
    clinicId,
    userId: user.id,
    action: "CREATE",
    resource: "staff",
    resourceId: created.id,
    ipAddress: ip,
  });

  return {
    id: created.id,
    clinicId: created.clinicId,
    email: created.email,
    role: created.role,
    givenName: created.givenName,
    familyName: created.familyName,
    active: created.active,
    revokedAt: null,
    createdAt: created.createdAt.toISOString(),
  };
}

export async function updateStaff(
  user: SessionUser,
  staffId: string,
  input: UpdateStaffInput,
  ip: string,
): Promise<UserDto> {
  const clinicId = requireClinic(user);
  const [existing] = await db.select().from(users).where(eq(users.id, staffId)).limit(1);
  if (!existing || existing.clinicId !== clinicId) throw new AppError("Usuario no encontrado", 404);

  const [updated] = await db
    .update(users)
    .set({
      givenName: input.givenName ?? existing.givenName,
      familyName: input.familyName ?? existing.familyName,
      role: input.role ?? existing.role,
      active: input.active ?? existing.active,
      updatedAt: new Date(),
    })
    .where(eq(users.id, staffId))
    .returning();

  await writeAuditLog({
    clinicId,
    userId: user.id,
    action: "UPDATE",
    resource: "staff",
    resourceId: staffId,
    ipAddress: ip,
  });

  return {
    id: updated.id,
    clinicId: updated.clinicId,
    email: updated.email,
    role: updated.role,
    givenName: updated.givenName,
    familyName: updated.familyName,
    active: updated.active,
    revokedAt: updated.revokedAt?.toISOString() ?? null,
    createdAt: updated.createdAt.toISOString(),
  };
}

export async function unlinkStaff(user: SessionUser, staffId: string, ip: string): Promise<void> {
  const clinicId = requireClinic(user);
  const [existing] = await db.select().from(users).where(eq(users.id, staffId)).limit(1);
  if (!existing || existing.clinicId !== clinicId) throw new AppError("Usuario no encontrado", 404);
  if (!canUnlinkStaff(existing.role)) throw new AppError("No se puede desvincular al dueño", 400);

  await unlinkUser(staffId);
  agendaSyncPort.broadcastSessionRevoked(staffId);

  await writeAuditLog({
    clinicId,
    userId: user.id,
    action: "UNLINK",
    resource: "staff",
    resourceId: staffId,
    ipAddress: ip,
  });
}

export async function listSpecialties(clinicId: string): Promise<SpecialtyDto[]> {
  const rows = await db.select().from(specialties).where(eq(specialties.clinicId, clinicId));
  return rows.map((r) => ({
    id: r.id,
    clinicId: r.clinicId,
    name: r.name,
    description: r.description,
  }));
}

export async function createSpecialty(
  user: SessionUser,
  input: CreateSpecialtyInput,
  ip: string,
): Promise<SpecialtyDto> {
  const clinicId = requireClinic(user);
  const [created] = await db
    .insert(specialties)
    .values({ clinicId, name: input.name, description: input.description ?? null })
    .returning();
  await writeAuditLog({
    clinicId,
    userId: user.id,
    action: "CREATE",
    resource: "specialty",
    resourceId: created.id,
    ipAddress: ip,
  });
  return {
    id: created.id,
    clinicId: created.clinicId,
    name: created.name,
    description: created.description,
  };
}

async function getSpecialtyForClinic(
  clinicId: string,
  specialtyId: string,
): Promise<typeof specialties.$inferSelect> {
  const [row] = await db
    .select()
    .from(specialties)
    .where(and(eq(specialties.id, specialtyId), eq(specialties.clinicId, clinicId)));
  if (!row) throw new AppError("Especialidad no encontrada", 404);
  return row;
}

export async function updateSpecialty(
  user: SessionUser,
  specialtyId: string,
  input: UpdateSpecialtyInput,
  ip: string,
): Promise<SpecialtyDto> {
  const clinicId = requireClinic(user);
  await getSpecialtyForClinic(clinicId, specialtyId);

  const updates: Partial<{ name: string; description: string | null }> = {};
  if (input.name !== undefined) updates.name = input.name;
  if (input.description !== undefined) updates.description = input.description;

  const [updated] = await db
    .update(specialties)
    .set(updates)
    .where(and(eq(specialties.id, specialtyId), eq(specialties.clinicId, clinicId)))
    .returning();

  await writeAuditLog({
    clinicId,
    userId: user.id,
    action: "UPDATE",
    resource: "specialty",
    resourceId: specialtyId,
    ipAddress: ip,
  });

  return {
    id: updated.id,
    clinicId: updated.clinicId,
    name: updated.name,
    description: updated.description,
  };
}

export async function deleteSpecialty(
  user: SessionUser,
  specialtyId: string,
  ip: string,
): Promise<void> {
  const clinicId = requireClinic(user);
  await getSpecialtyForClinic(clinicId, specialtyId);

  const linked = await db
    .select({ id: practitioners.id })
    .from(practitioners)
    .where(eq(practitioners.specialtyId, specialtyId))
    .limit(1);

  if (linked.length > 0) {
    throw new AppError("No se puede eliminar: hay médicos asignados a esta especialidad", 409);
  }

  await db
    .delete(specialties)
    .where(and(eq(specialties.id, specialtyId), eq(specialties.clinicId, clinicId)));

  await writeAuditLog({
    clinicId,
    userId: user.id,
    action: "DELETE",
    resource: "specialty",
    resourceId: specialtyId,
    ipAddress: ip,
  });
}

export async function listPractitioners(clinicId: string): Promise<PractitionerDto[]> {
  const rows = await db
    .select({ practitioner: practitioners, specialtyName: specialties.name })
    .from(practitioners)
    .innerJoin(specialties, eq(practitioners.specialtyId, specialties.id))
    .where(eq(practitioners.clinicId, clinicId));
  return rows.map((r) => ({
    id: r.practitioner.id,
    clinicId: r.practitioner.clinicId,
    userId: r.practitioner.userId,
    specialtyId: r.practitioner.specialtyId,
    givenName: r.practitioner.givenName,
    familyName: r.practitioner.familyName,
    email: r.practitioner.email,
    specialtyName: r.specialtyName,
  }));
}

export async function createPractitioner(
  user: SessionUser,
  input: CreatePractitionerInput,
  ip: string,
): Promise<PractitionerDto> {
  const clinicId = requireClinic(user);
  const [created] = await db
    .insert(practitioners)
    .values({
      clinicId,
      userId: input.userId ?? null,
      specialtyId: input.specialtyId,
      givenName: input.givenName,
      familyName: input.familyName,
      email: input.email ?? null,
    })
    .returning();
  const [spec] = await db
    .select()
    .from(specialties)
    .where(eq(specialties.id, input.specialtyId))
    .limit(1);
  await writeAuditLog({
    clinicId,
    userId: user.id,
    action: "CREATE",
    resource: "practitioner",
    resourceId: created.id,
    ipAddress: ip,
  });
  return {
    id: created.id,
    clinicId: created.clinicId,
    userId: created.userId,
    specialtyId: created.specialtyId,
    givenName: created.givenName,
    familyName: created.familyName,
    email: created.email,
    specialtyName: spec?.name,
  };
}

export async function listSchedules(clinicId: string): Promise<ScheduleTemplateDto[]> {
  const rows = await db
    .select({ template: scheduleTemplates, clinicId: practitioners.clinicId })
    .from(scheduleTemplates)
    .innerJoin(practitioners, eq(scheduleTemplates.practitionerId, practitioners.id))
    .where(eq(practitioners.clinicId, clinicId));
  return rows.map((r) => ({
    id: r.template.id,
    practitionerId: r.template.practitionerId,
    dayOfWeek: r.template.dayOfWeek,
    startTime: r.template.startTime,
    endTime: r.template.endTime,
    slotDurationMinutes: r.template.slotDurationMinutes,
  }));
}

export async function createSchedule(
  user: SessionUser,
  input: CreateScheduleTemplateInput,
  ip: string,
): Promise<ScheduleTemplateDto> {
  const clinicId = requireClinic(user);
  const [practitioner] = await db
    .select()
    .from(practitioners)
    .where(eq(practitioners.id, input.practitionerId))
    .limit(1);
  if (!practitioner || practitioner.clinicId !== clinicId) {
    throw new AppError("Profesional no encontrado", 404);
  }
  const [created] = await db.insert(scheduleTemplates).values(input).returning();
  await writeAuditLog({
    clinicId,
    userId: user.id,
    action: "CREATE",
    resource: "schedule_template",
    resourceId: created.id,
    ipAddress: ip,
  });
  return {
    id: created.id,
    practitionerId: created.practitionerId,
    dayOfWeek: created.dayOfWeek,
    startTime: created.startTime,
    endTime: created.endTime,
    slotDurationMinutes: created.slotDurationMinutes,
  };
}

export async function getOccupancyReport(
  clinicId: string,
  weekStart: string,
): Promise<OccupancyReportDto> {
  const start = new Date(weekStart);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const dayStart = new Date(start);
    dayStart.setDate(start.getDate() + i);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    const dayAppointments = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.clinicId, clinicId),
          gte(appointments.startAt, dayStart),
          lte(appointments.startAt, dayEnd),
        ),
      );

    const booked = dayAppointments.filter(
      (a) => a.status !== "cancelado" && a.status !== "bloqueado" && a.status !== "disponible",
    ).length;
    const blocked = dayAppointments.filter((a) => a.status === "bloqueado").length;
    const totalSlots = booked + blocked + 20;
    days.push({
      date: dayStart.toISOString().slice(0, 10),
      totalSlots,
      bookedSlots: booked,
      occupancyRate: totalSlots > 0 ? Math.round((booked / totalSlots) * 100) : 0,
    });
  }
  return { weekStart: start.toISOString().slice(0, 10), days };
}
