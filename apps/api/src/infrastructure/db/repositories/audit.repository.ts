import { desc, eq } from "drizzle-orm";
import { db } from "../client.js";
import { auditLogs } from "../schema.js";
import type {
  AuditReadRepository,
  AuditLogDto,
} from "../../../domain/ports/audit.repository.js";

export const auditReadRepository: AuditReadRepository = {
  async list(clinicId: string, limit: number): Promise<AuditLogDto[]> {
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
  },
};
