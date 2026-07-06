import { db } from "../db/client.js";
import { auditLogs } from "../db/schema.js";

export interface AuditParams {
  clinicId?: string | null;
  userId?: string | null;
  action: string;
  resource: string;
  resourceId?: string | null;
  ipAddress?: string | null;
  metadata?: Record<string, unknown>;
}

export async function writeAuditLog(params: AuditParams): Promise<void> {
  await db.insert(auditLogs).values({
    clinicId: params.clinicId ?? null,
    userId: params.userId ?? null,
    action: params.action,
    resource: params.resource,
    resourceId: params.resourceId ?? null,
    ipAddress: params.ipAddress ?? null,
    metadata: params.metadata ?? null,
  });
}
