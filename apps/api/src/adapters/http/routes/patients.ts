import { Router } from "express";
import { createPatientSchema } from "@smoothflow/shared";
import { listPatients, createPatient } from "../../../use-cases/patients.js";
import { requireAuth, getClientIp, type AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth(["secretaria", "dueno"]), async (req, res, next) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const items = await listPatients(user.clinicId!);
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

router.post("/", requireAuth(["secretaria", "dueno"]), async (req, res, next) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const input = createPatientSchema.parse(req.body);
    const patient = await createPatient(user, input, getClientIp(req));
    res.status(201).json({ patient });
  } catch (err) {
    next(err);
  }
});

export default router;
