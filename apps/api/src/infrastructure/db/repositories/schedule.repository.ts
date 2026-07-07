import { eq, and } from "drizzle-orm";
import type {
  ScheduleTemplateDto,
  CreateScheduleTemplateInput,
} from "@smoothflow/shared";
import { db } from "../client.js";
import { scheduleTemplates, practitioners } from "../schema.js";
import { buildScheduleTemplateRows } from "../../../domain/scheduling/default-schedule.js";
import type {
  ScheduleRepository,
  ScheduleChanges,
} from "../../../domain/ports/schedule.repository.js";

type ScheduleRow = typeof scheduleTemplates.$inferSelect;

function toDto(row: ScheduleRow): ScheduleTemplateDto {
  return {
    id: row.id,
    practitionerId: row.practitionerId,
    dayOfWeek: row.dayOfWeek,
    startTime: row.startTime,
    endTime: row.endTime,
    slotDurationMinutes: row.slotDurationMinutes,
  };
}

export const scheduleRepository: ScheduleRepository = {
  async createDefaults(practitionerId: string): Promise<void> {
    await db.insert(scheduleTemplates).values(buildScheduleTemplateRows(practitionerId));
  },

  async listForPractitioner(practitionerId: string): Promise<ScheduleTemplateDto[]> {
    const rows = await db
      .select()
      .from(scheduleTemplates)
      .where(eq(scheduleTemplates.practitionerId, practitionerId));
    return rows.map(toDto);
  },

  async listForClinic(clinicId: string): Promise<ScheduleTemplateDto[]> {
    const rows = await db
      .select({ template: scheduleTemplates })
      .from(scheduleTemplates)
      .innerJoin(practitioners, eq(scheduleTemplates.practitionerId, practitioners.id))
      .where(eq(practitioners.clinicId, clinicId));
    return rows.map((r) => toDto(r.template));
  },

  async findForClinic(clinicId: string, scheduleId: string): Promise<ScheduleTemplateDto | null> {
    const rows = await db
      .select({ template: scheduleTemplates })
      .from(scheduleTemplates)
      .innerJoin(practitioners, eq(scheduleTemplates.practitionerId, practitioners.id))
      .where(and(eq(scheduleTemplates.id, scheduleId), eq(practitioners.clinicId, clinicId)))
      .limit(1);
    return rows[0] ? toDto(rows[0].template) : null;
  },

  async create(input: CreateScheduleTemplateInput): Promise<ScheduleTemplateDto> {
    const [created] = await db.insert(scheduleTemplates).values(input).returning();
    return toDto(created);
  },

  async update(scheduleId: string, changes: ScheduleChanges): Promise<ScheduleTemplateDto> {
    const [updated] = await db
      .update(scheduleTemplates)
      .set(changes)
      .where(eq(scheduleTemplates.id, scheduleId))
      .returning();
    return toDto(updated);
  },

  async delete(scheduleId: string): Promise<void> {
    await db.delete(scheduleTemplates).where(eq(scheduleTemplates.id, scheduleId));
  },
};
