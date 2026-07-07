import { eq, and, sql } from "drizzle-orm";
import type { Database } from "../client.js";
import {
  users,
  practitioners,
  appointments,
  appointmentEvents,
  auditLogs,
} from "../schema.js";
import type { UserEntity } from "../../../domain/entities.js";
import type {
  UserRepository,
  NewUser,
  UserChanges,
} from "../../../domain/ports/user.repository.js";

type UserRow = typeof users.$inferSelect;

function toEntity(row: UserRow): UserEntity {
  return {
    id: row.id,
    clinicId: row.clinicId,
    email: row.email,
    passwordHash: row.passwordHash,
    role: row.role,
    givenName: row.givenName,
    familyName: row.familyName,
    active: row.active,
    revokedAt: row.revokedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function createUserRepository(db: Database): UserRepository {
  return {
    async findByEmail(email: string): Promise<UserEntity | null> {
      const [row] = await db.select().from(users).where(eq(users.email, email)).limit(1);
      return row ? toEntity(row) : null;
    },

    async findById(id: string): Promise<UserEntity | null> {
      const [row] = await db.select().from(users).where(eq(users.id, id)).limit(1);
      return row ? toEntity(row) : null;
    },

    async listStaff(clinicId: string): Promise<UserEntity[]> {
      const rows = await db
        .select()
        .from(users)
        .where(and(eq(users.clinicId, clinicId), sql`${users.role} != 'paciente'`));
      return rows.map(toEntity);
    },

    async create(data: NewUser): Promise<UserEntity> {
      const [created] = await db
        .insert(users)
        .values({
          clinicId: data.clinicId ?? null,
          email: data.email,
          passwordHash: data.passwordHash,
          role: data.role,
          givenName: data.givenName,
          familyName: data.familyName,
        })
        .returning();
      return toEntity(created);
    },

    async update(id: string, changes: UserChanges): Promise<UserEntity> {
      const [updated] = await db
        .update(users)
        .set({ ...changes, updatedAt: new Date() })
        .where(eq(users.id, id))
        .returning();
      return toEntity(updated);
    },

    async markRevoked(id: string): Promise<void> {
      await db
        .update(users)
        .set({ active: false, revokedAt: new Date(), updatedAt: new Date() })
        .where(eq(users.id, id));
    },

    async deleteWithReferences(id: string): Promise<void> {
      await db.update(practitioners).set({ userId: null }).where(eq(practitioners.userId, id));
      await db
        .update(appointments)
        .set({ createdByUserId: null })
        .where(eq(appointments.createdByUserId, id));
      await db
        .update(appointments)
        .set({ requestedByUserId: null })
        .where(eq(appointments.requestedByUserId, id));
      await db
        .update(appointments)
        .set({ reviewedByUserId: null })
        .where(eq(appointments.reviewedByUserId, id));
      await db
        .update(appointmentEvents)
        .set({ userId: null })
        .where(eq(appointmentEvents.userId, id));
      await db.update(auditLogs).set({ userId: null }).where(eq(auditLogs.userId, id));
      await db.delete(users).where(eq(users.id, id));
    },
  };
}
