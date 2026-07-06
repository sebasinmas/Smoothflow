import { eq, and, gte, lte, ne, inArray } from "drizzle-orm";
import type {
  CreateAppointmentInput,
  UpdateAppointmentInput,
  CreateBlockInput,
  AvailabilityQuery,
  SessionUser,
  AppointmentDto,
  AvailabilitySlotDto,
} from "@smoothflow/shared";
import { db } from "../infrastructure/db/client.js";
import {
  appointments,
  appointmentEvents,
  practitioners,
  specialties,
  patients,
  scheduleTemplates,
} from "../infrastructure/db/schema.js";
import { AppError } from "../domain/errors.js";
import { writeAuditLog } from "../infrastructure/audit/audit-logger.js";
import { sendAppointmentConfirmation } from "../infrastructure/email/email-service.js";
import { broadcastAgendaUpdate } from "../adapters/ws/agenda-sync.js";

function toAppointmentDto(
  row: typeof appointments.$inferSelect,
  extras?: Partial<AppointmentDto>,
): AppointmentDto {
  return {
    id: row.id,
    clinicId: row.clinicId,
    patientId: row.patientId,
    practitionerId: row.practitionerId,
    status: row.status,
    startAt: row.startAt.toISOString(),
    endAt: row.endAt.toISOString(),
    notes: row.notes,
    pendingReschedule: row.pendingReschedule,
    createdByUserId: row.createdByUserId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    ...extras,
  };
}

async function assertNoConflict(
  clinicId: string,
  practitionerId: string,
  startAt: Date,
  endAt: Date,
  excludeId?: string,
) {
  if (startAt.getTime() < Date.now()) {
    throw new AppError("No se puede agendar ni solicitar citas en el pasado.", 400);
  }

  const conditions = [
    eq(appointments.clinicId, clinicId),
    eq(appointments.practitionerId, practitionerId),
    ne(appointments.status, "cancelado"),
    lte(appointments.startAt, endAt),
    gte(appointments.endAt, startAt),
  ];
  const rows = await db
    .select()
    .from(appointments)
    .where(and(...conditions));
  const conflict = rows.find((r) => r.id !== excludeId && r.status !== "disponible");
  if (conflict) {
    throw new AppError("El horario ya está ocupado o bloqueado", 409, "DOUBLE_BOOKING");
  }
}

export async function listAppointments(
  user: SessionUser,
  filters: { from?: string; to?: string; practitionerId?: string },
): Promise<AppointmentDto[]> {
  if (!user.clinicId && user.role !== "paciente") {
    throw new AppError("Clínica no asignada", 400);
  }

  const conditions = [];
  if (user.role === "medico") {
    const [practitioner] = await db
      .select()
      .from(practitioners)
      .where(eq(practitioners.userId, user.id))
      .limit(1);
    if (!practitioner) return [];
    conditions.push(eq(appointments.practitionerId, practitioner.id));
  } else if (user.role === "paciente") {
    const [patient] = await db
      .select()
      .from(patients)
      .where(eq(patients.userId, user.id))
      .limit(1);
    if (!patient) return [];
    conditions.push(eq(appointments.patientId, patient.id));
  } else if (user.clinicId) {
    conditions.push(eq(appointments.clinicId, user.clinicId));
  }

  if (filters.practitionerId) {
    conditions.push(eq(appointments.practitionerId, filters.practitionerId));
  }
  if (filters.from) conditions.push(gte(appointments.startAt, new Date(filters.from)));
  if (filters.to) conditions.push(lte(appointments.startAt, new Date(filters.to)));

  const rows = await db
    .select({
      appointment: appointments,
      patientGiven: patients.givenName,
      patientFamily: patients.familyName,
      practitionerGiven: practitioners.givenName,
      practitionerFamily: practitioners.familyName,
      specialtyName: specialties.name,
    })
    .from(appointments)
    .leftJoin(patients, eq(appointments.patientId, patients.id))
    .innerJoin(practitioners, eq(appointments.practitionerId, practitioners.id))
    .innerJoin(specialties, eq(practitioners.specialtyId, specialties.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(appointments.startAt);

  return rows.map((r) =>
    toAppointmentDto(r.appointment, {
      patientName: r.patientGiven ? `${r.patientGiven} ${r.patientFamily}` : undefined,
      practitionerName: `${r.practitionerGiven} ${r.practitionerFamily}`,
      specialtyName: r.specialtyName,
    }),
  );
}

export async function createAppointment(
  user: SessionUser,
  input: CreateAppointmentInput,
  ip: string,
): Promise<AppointmentDto> {
  if (user.role === "paciente") {
    const [patient] = await db
      .select()
      .from(patients)
      .where(eq(patients.userId, user.id))
      .limit(1);
    if (!patient) throw new AppError("Paciente no encontrado", 404);
    return createAppointmentForClinic(patient.clinicId, user, input, ip, patient.id);
  }
  const clinicId = user.clinicId;
  if (!clinicId) throw new AppError("Clínica no asignada", 400);
  if (!input.patientId) throw new AppError("patientId requerido", 400);
  return createAppointmentForClinic(clinicId, user, input, ip, input.patientId);
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

  const [created] = await db
    .insert(appointments)
    .values({
      clinicId,
      patientId,
      practitionerId: input.practitionerId,
      status: "confirmado",
      startAt,
      endAt,
      notes: input.notes ?? null,
      createdByUserId: user.id,
    })
    .returning();

  await db.insert(appointmentEvents).values({
    appointmentId: created.id,
    userId: user.id,
    newStatus: "confirmado",
  });

  await writeAuditLog({
    clinicId,
    userId: user.id,
    action: "CREATE",
    resource: "appointment",
    resourceId: created.id,
    ipAddress: ip,
  });

  const [patient] = await db.select().from(patients).where(eq(patients.id, patientId)).limit(1);
  if (patient?.email) {
    await sendAppointmentConfirmation(patient.email, "reserva", created.startAt.toISOString());
  }

  const dto = toAppointmentDto(created);
  broadcastAgendaUpdate(clinicId, { type: "appointment:created", appointment: dto });
  return dto;
}

export async function updateAppointment(
  user: SessionUser,
  id: string,
  input: UpdateAppointmentInput,
  ip: string,
): Promise<AppointmentDto> {
  const [existing] = await db.select().from(appointments).where(eq(appointments.id, id)).limit(1);
  if (!existing) throw new AppError("Cita no encontrada", 404);
  if (user.clinicId && existing.clinicId !== user.clinicId && user.role !== "paciente") {
    throw new AppError("Acceso denegado", 403);
  }

  if (user.role === "paciente") {
    const hoursUntilAppointment = (existing.startAt.getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursUntilAppointment < 24) {
      throw new AppError("No puedes modificar o cancelar una cita con menos de 24 horas de anticipación. Por favor, contacta a la clínica.", 403);
    }
  }

  let startAt = input.startAt ? new Date(input.startAt) : existing.startAt;
  let endAt = input.endAt ? new Date(input.endAt) : existing.endAt;
  let newStatus = input.status ?? existing.status;
  let pendingReschedule = input.pendingReschedule !== undefined ? input.pendingReschedule : existing.pendingReschedule;

  if (user.role === "paciente" && input.startAt && input.endAt && input.status === "reagendado") {
    // El paciente solicita reagendar: interceptamos la fecha y no modificamos la cita original
    pendingReschedule = { startAt: input.startAt, endAt: input.endAt };
    startAt = existing.startAt;
    endAt = existing.endAt;
    newStatus = existing.status;
  }

  if (pendingReschedule) {
    await assertNoConflict(existing.clinicId, existing.practitionerId, new Date(pendingReschedule.startAt), new Date(pendingReschedule.endAt), id);
  } else if (startAt !== existing.startAt || endAt !== existing.endAt) {
    await assertNoConflict(existing.clinicId, existing.practitionerId, startAt, endAt, id);
  }

  const [updated] = await db
    .update(appointments)
    .set({
      startAt,
      endAt,
      status: newStatus,
      notes: input.notes ?? existing.notes,
      pendingReschedule,
      updatedAt: new Date(),
    })
    .where(eq(appointments.id, id))
    .returning();

  await db.insert(appointmentEvents).values({
    appointmentId: id,
    userId: user.id,
    previousStatus: existing.status,
    newStatus,
  });

  await writeAuditLog({
    clinicId: existing.clinicId,
    userId: user.id,
    action: "UPDATE",
    resource: "appointment",
    resourceId: id,
    ipAddress: ip,
    metadata: { status: newStatus },
  });

  if (existing.patientId) {
    const [patient] = await db
      .select()
      .from(patients)
      .where(eq(patients.id, existing.patientId))
      .limit(1);
    if (patient?.email) {
      const action =
        newStatus === "cancelado"
          ? "cancelación"
          : input.startAt
            ? "reagendamiento"
            : "reserva";
      await sendAppointmentConfirmation(patient.email, action, updated.startAt.toISOString());
    }
  }

  const dto = toAppointmentDto(updated);
  broadcastAgendaUpdate(existing.clinicId, { type: "appointment:updated", appointment: dto });
  return dto;
}

async function assertNoConfirmedAppointmentsInBlockRange(
  clinicId: string,
  practitionerId: string,
  startAt: Date,
  endAt: Date,
): Promise<void> {
  const rows = await db
    .select()
    .from(appointments)
    .where(
      and(
        eq(appointments.clinicId, clinicId),
        eq(appointments.practitionerId, practitionerId),
        inArray(appointments.status, ["confirmado", "reservado", "reagendado"]),
        lte(appointments.startAt, endAt),
        gte(appointments.endAt, startAt),
      ),
    );

  if (rows.length > 0) {
    throw new AppError(
      "Existen citas confirmadas en el rango seleccionado. Gestiónelas antes de bloquear.",
      409,
      "BLOCK_CONFLICT",
    );
  }
}

export async function createBlock(
  user: SessionUser,
  input: CreateBlockInput,
  ip: string,
): Promise<AppointmentDto> {
  if (!user.clinicId) throw new AppError("Clínica no asignada", 400);
  const startAt = new Date(input.startAt);
  const endAt = new Date(input.endAt);

  await assertNoConfirmedAppointmentsInBlockRange(
    user.clinicId,
    input.practitionerId,
    startAt,
    endAt,
  );

  const [created] = await db
    .insert(appointments)
    .values({
      clinicId: user.clinicId,
      practitionerId: input.practitionerId,
      status: "bloqueado",
      startAt,
      endAt,
      notes: input.reason ?? "Bloqueo de agenda",
      createdByUserId: user.id,
    })
    .returning();

  await writeAuditLog({
    clinicId: user.clinicId,
    userId: user.id,
    action: "BLOCK",
    resource: "appointment",
    resourceId: created.id,
    ipAddress: ip,
  });

  const dto = toAppointmentDto(created);
  broadcastAgendaUpdate(user.clinicId, { type: "appointment:blocked", appointment: dto });
  return dto;
}

type BookedAppointment = typeof appointments.$inferSelect & {
  patientName?: string;
};

function generateSlotsFromTemplate(
  template: typeof scheduleTemplates.$inferSelect,
  from: Date,
  to: Date,
  practitioner: typeof practitioners.$inferSelect & { specialtyName: string },
  booked: BookedAppointment[],
): AvailabilitySlotDto[] {
  const slots: AvailabilitySlotDto[] = [];
  const cursor = new Date(from);
  while (cursor <= to) {
    if (cursor.getDay() === template.dayOfWeek) {
      const [sh, sm] = template.startTime.split(":").map(Number);
      const [eh, em] = template.endTime.split(":").map(Number);
      let slotStart = new Date(cursor);
      slotStart.setHours(sh, sm, 0, 0);
      const dayEnd = new Date(cursor);
      dayEnd.setHours(eh, em, 0, 0);
      while (slotStart < dayEnd) {
        const slotEnd = new Date(slotStart.getTime() + template.slotDurationMinutes * 60000);
        if (slotEnd <= dayEnd && slotStart >= from && slotStart <= to) {
          const overlap = booked.find(
            (b) =>
              b.status !== "cancelado" &&
              b.startAt < slotEnd &&
              b.endAt > slotStart,
          );
          let status: AvailabilitySlotDto["status"] = "disponible";
          if (overlap) {
            status = overlap.status === "bloqueado" ? "bloqueado" : "reservado";
          }
          slots.push({
            startAt: slotStart.toISOString(),
            endAt: slotEnd.toISOString(),
            status,
            appointmentId: overlap?.id,
            practitionerId: practitioner.id,
            practitionerName: `${practitioner.givenName} ${practitioner.familyName}`,
            specialtyId: practitioner.specialtyId,
            specialtyName: practitioner.specialtyName,
            patientName: overlap?.patientName,
            blockReason:
              overlap?.status === "bloqueado" ? (overlap.notes ?? undefined) : undefined,
          });
        }
        slotStart = slotEnd;
      }
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return slots;
}

export async function getAvailability(
  clinicId: string,
  query: AvailabilityQuery,
): Promise<AvailabilitySlotDto[]> {
  const from = new Date(query.from);
  const to = new Date(query.to);

  const practitionerConditions = [eq(practitioners.clinicId, clinicId)];
  if (query.practitionerId) {
    practitionerConditions.push(eq(practitioners.id, query.practitionerId));
  }
  if (query.specialtyId) {
    practitionerConditions.push(eq(practitioners.specialtyId, query.specialtyId));
  }

  const practitionerRows = await db
    .select({
      practitioner: practitioners,
      specialtyName: specialties.name,
    })
    .from(practitioners)
    .innerJoin(specialties, eq(practitioners.specialtyId, specialties.id))
    .where(and(...practitionerConditions));

  const practitionerIds = practitionerRows.map((p) => p.practitioner.id);
  if (practitionerIds.length === 0) return [];

  const bookedRows = await db
    .select({
      appointment: appointments,
      patientGiven: patients.givenName,
      patientFamily: patients.familyName,
    })
    .from(appointments)
    .leftJoin(patients, eq(appointments.patientId, patients.id))
    .where(
      and(
        eq(appointments.clinicId, clinicId),
        inArray(appointments.practitionerId, practitionerIds),
        lte(appointments.startAt, to),
        gte(appointments.endAt, from),
        ne(appointments.status, "cancelado"),
      ),
    );

  const booked: BookedAppointment[] = bookedRows.map((r) => ({
    ...r.appointment,
    patientName: r.patientGiven ? `${r.patientGiven} ${r.patientFamily}` : undefined,
  }));

  const templates = await db
    .select()
    .from(scheduleTemplates)
    .where(inArray(scheduleTemplates.practitionerId, practitionerIds));

  const allSlots: AvailabilitySlotDto[] = [];
  for (const row of practitionerRows) {
    const pTemplates = templates.filter((t) => t.practitionerId === row.practitioner.id);
    const pBooked = booked.filter((b) => b.practitionerId === row.practitioner.id);
    for (const template of pTemplates) {
      allSlots.push(
        ...generateSlotsFromTemplate(
          template,
          from,
          to,
          { ...row.practitioner, specialtyName: row.specialtyName },
          pBooked,
        ),
      );
    }
  }

  const now = Date.now();
  const validSlots = allSlots.filter((s) => new Date(s.startAt).getTime() > now);

  return validSlots.sort((a, b) => a.startAt.localeCompare(b.startAt));
}
