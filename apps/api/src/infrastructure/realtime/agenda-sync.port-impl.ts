import type { AgendaSyncPort } from "../../domain/ports/agenda-sync.port.js";
import { broadcastAgendaUpdate, broadcastSessionRevoked } from "./agenda-sync.js";

export const agendaSyncPort: AgendaSyncPort = {
  broadcastUpdate: broadcastAgendaUpdate,
  broadcastSessionRevoked,
};
