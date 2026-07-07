import { agendaSyncPort } from "../infrastructure/realtime/agenda-sync.port-impl.js";
import { auditLogger } from "../infrastructure/audit/audit-logger.js";
import { appointmentNotifier } from "../infrastructure/email/email-service.js";
import { fieldCrypto } from "../infrastructure/crypto/encryption.js";
import { passwordHasher } from "../infrastructure/auth/password.js";
import { sessionRevoker } from "../infrastructure/session/session-revoker.js";
import { db } from "../infrastructure/db/client.js";
import { appointmentRepository } from "../infrastructure/db/repositories/appointment.repository.js";
import { createUserRepository } from "../infrastructure/db/repositories/user.repository.js";
import { createPatientRepository } from "../infrastructure/db/repositories/patient.repository.js";
import { practitionerRepository } from "../infrastructure/db/repositories/practitioner.repository.js";
import { createSpecialtyRepository } from "../infrastructure/db/repositories/specialty.repository.js";
import { scheduleRepository } from "../infrastructure/db/repositories/schedule.repository.js";
import { clinicRepository } from "../infrastructure/db/repositories/clinic.repository.js";
import { auditReadRepository } from "../infrastructure/db/repositories/audit.repository.js";
import { createPatientUseCases } from "../use-cases/patients.js";
import { createAuthUseCases } from "../use-cases/auth.js";
import { createAppointmentUseCases } from "../use-cases/appointments.js";
import { createOwnerUseCases } from "../use-cases/owner.js";
import { createAuditUseCases } from "../use-cases/audit.js";

/**
 * Composition root: instancia las implementaciones de infraestructura
 * (repositorios y servicios) y las inyecta en las factories de casos de uso.
 * Es la unica capa autorizada a conocer implementaciones concretas.
 */
const patientRepository = createPatientRepository(fieldCrypto);
const userRepository = createUserRepository(db);
const specialtyRepository = createSpecialtyRepository(db);

const patientUseCases = createPatientUseCases({
  patients: patientRepository,
  auditLogger,
});

const authUseCases = createAuthUseCases({
  users: userRepository,
  patients: patientRepository,
  clinics: clinicRepository,
  passwordHasher,
  auditLogger,
});

const appointmentUseCases = createAppointmentUseCases({
  appointments: appointmentRepository,
  patients: patientRepository,
  practitioners: practitionerRepository,
  auditLogger,
  notifier: appointmentNotifier,
  agendaSync: agendaSyncPort,
});

const ownerUseCases = createOwnerUseCases({
  users: userRepository,
  practitioners: practitionerRepository,
  specialties: specialtyRepository,
  schedules: scheduleRepository,
  appointments: appointmentRepository,
  passwordHasher,
  auditLogger,
  agendaSync: agendaSyncPort,
  sessionRevoker,
});

const auditUseCases = createAuditUseCases({ auditRead: auditReadRepository });

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
