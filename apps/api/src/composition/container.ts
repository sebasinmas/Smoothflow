import { agendaSyncPort } from "../infrastructure/realtime/agenda-sync.port-impl.js";
import { auditLogger } from "../infrastructure/audit/audit-logger.js";
import { appointmentNotifier } from "../infrastructure/email/email-service.js";
import { fieldCrypto } from "../infrastructure/crypto/encryption.js";
import { passwordHasher } from "../infrastructure/auth/password.js";
import { sessionRevoker } from "../infrastructure/session/session-revoker.js";
import { createPatientUseCases } from "../use-cases/patients.js";
import { createAuthUseCases } from "../use-cases/auth.js";
import { createAppointmentUseCases } from "../use-cases/appointments.js";
import { createOwnerUseCases } from "../use-cases/owner.js";
import { createAuditUseCases } from "../use-cases/audit.js";

/**
 * Composition root: instancia las implementaciones de infraestructura y las
 * inyecta en las factories de casos de uso. Es la unica capa autorizada a
 * conocer implementaciones concretas y ensamblarlas.
 */
const patientUseCases = createPatientUseCases({ fieldCrypto, auditLogger });

const authUseCases = createAuthUseCases({
  passwordHasher,
  fieldCrypto,
  auditLogger,
  findPatientForPortalLink: patientUseCases.findPatientForPortalLink,
});

const appointmentUseCases = createAppointmentUseCases({
  auditLogger,
  notifier: appointmentNotifier,
  agendaSync: agendaSyncPort,
});

const ownerUseCases = createOwnerUseCases({
  passwordHasher,
  auditLogger,
  agendaSync: agendaSyncPort,
  sessionRevoker,
});

const auditUseCases = createAuditUseCases();

export const container = {
  patientUseCases,
  authUseCases,
  appointmentUseCases,
  ownerUseCases,
  auditUseCases,
};

// Funciones ligadas reexportadas con los nombres actuales para los adaptadores.
export const { loginUser, registerPatient, getUserById } = authUseCases;
export const { listPatients, createPatient, getPatient, findPatientForPortalLink } =
  patientUseCases;
export const {
  listAppointments,
  createAppointment,
  updateAppointment,
  applyDoctorAction,
  reviewCancellationRequest,
  createBlock,
  getAvailability,
} = appointmentUseCases;
export const {
  listStaff,
  createStaff,
  updateStaff,
  unlinkStaff,
  relinkStaff,
  deleteStaffPermanently,
  listSpecialties,
  createSpecialty,
  updateSpecialty,
  deleteSpecialty,
  listPractitioners,
  createPractitioner,
  listSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getOccupancyReport,
} = ownerUseCases;
export const { listAuditLogs } = auditUseCases;
