import * as Y from "yjs";
import type { AgendaEvent } from "../../domain/ports/agenda-sync.port.js";

const clinicDocs = new Map<string, Y.Doc>();
const revokedListeners = new Map<string, Set<(userId: string) => void>>();

export function getClinicDoc(clinicId: string): Y.Doc {
  let doc = clinicDocs.get(clinicId);
  if (!doc) {
    doc = new Y.Doc();
    clinicDocs.set(clinicId, doc);
  }
  return doc;
}

export function broadcastAgendaUpdate(clinicId: string, event: AgendaEvent): void {
  const doc = getClinicDoc(clinicId);
  const events = doc.getArray<AgendaEvent>("events");
  doc.transact(() => {
    events.push([event]);
    if (events.length > 100) {
      events.delete(0, events.length - 100);
    }
  });
}

export function broadcastSessionRevoked(userId: string): void {
  for (const listeners of revokedListeners.values()) {
    for (const cb of listeners) cb(userId);
  }
}

export function onSessionRevoked(listener: (userId: string) => void): () => void {
  let set = revokedListeners.get("global");
  if (!set) {
    set = new Set();
    revokedListeners.set("global", set);
  }
  set.add(listener);
  return () => set?.delete(listener);
}

export function getClinicDocs(): Map<string, Y.Doc> {
  return clinicDocs;
}
