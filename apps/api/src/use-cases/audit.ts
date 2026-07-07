import type { AuditReadRepository, AuditLogDto } from "../domain/ports/audit.repository.js";

export type { AuditLogDto };

export interface AuditUseCasesDeps {
  auditRead: AuditReadRepository;
}

export function createAuditUseCases(deps: AuditUseCasesDeps) {
  const { auditRead } = deps;

  async function listAuditLogs(clinicId: string, limit = 100): Promise<AuditLogDto[]> {
    return auditRead.list(clinicId, limit);
  }

  return { listAuditLogs };
}

export type AuditUseCases = ReturnType<typeof createAuditUseCases>;
