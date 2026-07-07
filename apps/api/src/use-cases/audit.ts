import { desc, eq } from "drizzle-orm";
import { db } from "../infrastructure/db/client.js";
import { auditLogs } from "../infrastructure/db/schema.js";

export interface AuditLogDto {
  id: string;
  userId: string | null;
  action: string;
  resource: string;
  resourceId: string | null;
  ipAddress: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export function createAuditUseCases() {
  async function listAuditLogs(clinicId: string, limit = 100): Promise<AuditLogDto[]> {
    const rows = await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.clinicId, clinicId))
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit);

    return rows.map((r) => ({
      id: r.id,
      userId: r.userId,
      action: r.action,
      resource: r.resource,
      resourceId: r.resourceId,
      ipAddress: r.ipAddress,
      metadata: r.metadata as Record<string, unknown> | null,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  return { listAuditLogs };
}

export type AuditUseCases = ReturnType<typeof createAuditUseCases>;
