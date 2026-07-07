import type { AppointmentDto } from "@smoothflow/shared";

export type AgendaEvent =
  | { type: "appointment:created"; appointment: AppointmentDto }
  | { type: "appointment:updated"; appointment: AppointmentDto }
  | { type: "appointment:blocked"; appointment: AppointmentDto }
  | { type: "schedule:updated" }
  | { type: "session:revoked"; userId: string };

export interface AgendaSyncPort {
  broadcastUpdate(clinicId: string, event: AgendaEvent): void;
  broadcastSessionRevoked(userId: string): void;
}
