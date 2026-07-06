import { Router } from "express";
import { toFhirPatient, toFhirAppointment, toFhirPractitioner } from "@smoothflow/shared/fhir";
import { listPatients } from "../../../use-cases/patients.js";
import { listAppointments } from "../../../use-cases/appointments.js";
import { listPractitioners } from "../../../use-cases/owner.js";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();

router.get("/Patient", requireAuth(["dueno"]), async (req, res, next) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const patients = await listPatients(user.clinicId!);
    res.json({
      resourceType: "Bundle",
      type: "searchset",
      entry: patients.map((p) => ({ resource: toFhirPatient(p) })),
    });
  } catch (err) {
    next(err);
  }
});

router.get("/Practitioner", requireAuth(["dueno", "secretaria"]), async (req, res, next) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const practitioners = await listPractitioners(user.clinicId!);
    res.json({
      resourceType: "Bundle",
      type: "searchset",
      entry: practitioners.map((p) => ({ resource: toFhirPractitioner(p) })),
    });
  } catch (err) {
    next(err);
  }
});

router.get("/Appointment", requireAuth(["dueno", "secretaria", "medico"]), async (req, res, next) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const items = await listAppointments(user, {});
    res.json({
      resourceType: "Bundle",
      type: "searchset",
      entry: items.map((a) => ({ resource: toFhirAppointment(a) })),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
