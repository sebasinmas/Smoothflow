export interface SessionRevoker {
  revokeUserSessions(userId: string): Promise<void>;
}
