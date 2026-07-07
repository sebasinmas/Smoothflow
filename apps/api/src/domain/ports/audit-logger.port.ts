export interface AuditParams {
  clinicId?: string | null;
  userId?: string | null;
  action: string;
  resource: string;
  resourceId?: string | null;
  ipAddress?: string | null;
  metadata?: Record<string, unknown>;
}

export interface AuditLogger {
  write(params: AuditParams): Promise<void>;
}
