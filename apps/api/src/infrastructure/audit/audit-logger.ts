import { db } from "../db/client.js";
import { auditLogs } from "../db/schema.js";
import type { AuditLogger, AuditParams } from "../../domain/ports/audit-logger.port.js";

export type { AuditParams };

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

export const auditLogger: AuditLogger = {
  write: writeAuditLog,
};
