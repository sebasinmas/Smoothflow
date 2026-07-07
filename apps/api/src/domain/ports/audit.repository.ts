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

export interface AuditReadRepository {
  list(clinicId: string, limit: number): Promise<AuditLogDto[]>;
}
