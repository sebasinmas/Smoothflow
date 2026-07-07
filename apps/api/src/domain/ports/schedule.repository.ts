import type {
  ScheduleTemplateDto,
  CreateScheduleTemplateInput,
} from "@smoothflow/shared";

export interface ScheduleChanges {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
}

export interface ScheduleRepository {
  createDefaults(practitionerId: string): Promise<void>;
  listForPractitioner(practitionerId: string): Promise<ScheduleTemplateDto[]>;
  listForClinic(clinicId: string): Promise<ScheduleTemplateDto[]>;
  findForClinic(clinicId: string, scheduleId: string): Promise<ScheduleTemplateDto | null>;
  create(input: CreateScheduleTemplateInput): Promise<ScheduleTemplateDto>;
  update(scheduleId: string, changes: ScheduleChanges): Promise<ScheduleTemplateDto>;
  delete(scheduleId: string): Promise<void>;
}
