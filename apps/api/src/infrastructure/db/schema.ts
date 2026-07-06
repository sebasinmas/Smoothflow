import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  pgEnum,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const roleEnum = pgEnum("role", ["paciente", "secretaria", "medico", "dueno"]);

export const appointmentStatusEnum = pgEnum("appointment_status", [
  "disponible",
  "reservado",
  "confirmado",
  "reagendado",
  "cancelado",
  "bloqueado",
]);

export const clinics = pgTable("clinics", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  timezone: text("timezone").notNull().default("America/Santiago"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clinicId: uuid("clinic_id").references(() => clinics.id),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    role: roleEnum("role").notNull(),
    givenName: text("given_name").notNull(),
    familyName: text("family_name").notNull(),
    active: boolean("active").notNull().default(true),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("users_clinic_idx").on(t.clinicId), index("users_role_idx").on(t.role)],
);

export const specialties = pgTable("specialties", {
  id: uuid("id").primaryKey().defaultRandom(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinics.id),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const practitioners = pgTable("practitioners", {
  id: uuid("id").primaryKey().defaultRandom(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinics.id),
  userId: uuid("user_id").references(() => users.id),
  specialtyId: uuid("specialty_id")
    .notNull()
    .references(() => specialties.id),
  givenName: text("given_name").notNull(),
  familyName: text("family_name").notNull(),
  email: text("email"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const scheduleTemplates = pgTable("schedule_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  practitionerId: uuid("practitioner_id")
    .notNull()
    .references(() => practitioners.id, { onDelete: "cascade" }),
  dayOfWeek: integer("day_of_week").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  slotDurationMinutes: integer("slot_duration_minutes").notNull().default(30),
});

export const patients = pgTable(
  "patients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clinicId: uuid("clinic_id")
      .notNull()
      .references(() => clinics.id),
    userId: uuid("user_id").references(() => users.id),
    givenName: text("given_name").notNull(),
    familyName: text("family_name").notNull(),
    email: text("email"),
    phoneEncrypted: text("phone_encrypted"),
    identifierEncrypted: text("identifier_encrypted"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("patients_clinic_idx").on(t.clinicId)],
);

export const appointments = pgTable(
  "appointments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clinicId: uuid("clinic_id")
      .notNull()
      .references(() => clinics.id),
    patientId: uuid("patient_id").references(() => patients.id),
    practitionerId: uuid("practitioner_id")
      .notNull()
      .references(() => practitioners.id),
    status: appointmentStatusEnum("status").notNull().default("reservado"),
    startAt: timestamp("start_at", { withTimezone: true }).notNull(),
    endAt: timestamp("end_at", { withTimezone: true }).notNull(),
    notes: text("notes"),
    pendingReschedule: jsonb("pending_reschedule").$type<{ startAt: string; endAt: string }>(),
    createdByUserId: uuid("created_by_user_id").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("appointments_clinic_idx").on(t.clinicId),
    index("appointments_practitioner_idx").on(t.practitionerId),
    index("appointments_start_idx").on(t.startAt),
  ],
);

export const appointmentEvents = pgTable("appointment_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  appointmentId: uuid("appointment_id")
    .notNull()
    .references(() => appointments.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id),
  previousStatus: appointmentStatusEnum("previous_status"),
  newStatus: appointmentStatusEnum("new_status").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clinicId: uuid("clinic_id").references(() => clinics.id),
    userId: uuid("user_id").references(() => users.id),
    action: text("action").notNull(),
    resource: text("resource").notNull(),
    resourceId: text("resource_id"),
    ipAddress: text("ip_address"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("audit_logs_created_idx").on(t.createdAt)],
);

export const clinicsRelations = relations(clinics, ({ many }) => ({
  users: many(users),
  specialties: many(specialties),
  practitioners: many(practitioners),
  patients: many(patients),
  appointments: many(appointments),
}));

export const usersRelations = relations(users, ({ one }) => ({
  clinic: one(clinics, { fields: [users.clinicId], references: [clinics.id] }),
}));

export const practitionersRelations = relations(practitioners, ({ one, many }) => ({
  clinic: one(clinics, { fields: [practitioners.clinicId], references: [clinics.id] }),
  specialty: one(specialties, { fields: [practitioners.specialtyId], references: [specialties.id] }),
  user: one(users, { fields: [practitioners.userId], references: [users.id] }),
  scheduleTemplates: many(scheduleTemplates),
  appointments: many(appointments),
}));

export const appointmentsRelations = relations(appointments, ({ one, many }) => ({
  clinic: one(clinics, { fields: [appointments.clinicId], references: [clinics.id] }),
  patient: one(patients, { fields: [appointments.patientId], references: [patients.id] }),
  practitioner: one(practitioners, {
    fields: [appointments.practitionerId],
    references: [practitioners.id],
  }),
  events: many(appointmentEvents),
}));
