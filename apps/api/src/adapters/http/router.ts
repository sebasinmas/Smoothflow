import { Router } from "express";
import authRoutes from "./routes/auth.js";
import appointmentRoutes from "./routes/appointments.js";
import patientRoutes from "./routes/patients.js";
import ownerRoutes from "./routes/owner.js";
import auditRoutes from "./routes/audit.js";
import fhirRoutes from "./routes/fhir.js";
import { requireAuth, loadSessionUser } from "./middleware/auth.js";
import { availabilityQuerySchema } from "@smoothflow/shared";
import { getAvailability, getAvailabilityForUser, listSpecialties } from "../../composition/container.js";
import { ValidationError } from "../../domain/errors.js";
import type { AuthenticatedRequest } from "./middleware/auth.js";

const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

apiRouter.use("/auth", authRoutes);

apiRouter.get("/availability", async (req, res, next) => {
  try {
    const query = availabilityQuerySchema.parse(req.query);
    const user = req.session.userId ? await loadSessionUser(req) : null;
    if (user && user.clinicId) {
      const slots = await getAvailabilityForUser(user, query);
      res.json({ slots });
      return;
    }
    let clinicId = req.query.clinicId as string | undefined;
    clinicId = clinicId || process.env.DEFAULT_CLINIC_ID;
    if (!clinicId) throw new ValidationError("clinicId requerido");
    const slots = await getAvailability(clinicId, query);
    res.json({ slots });
  } catch (err) {
    next(err);
  }
});

apiRouter.get("/specialties", requireAuth(["dueno", "secretaria", "paciente"]), async (req, res, next) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const clinicId = user.clinicId ?? (req.query.clinicId as string);
    if (!clinicId) {
      res.json({ items: [] });
      return;
    }
    const items = await listSpecialties(clinicId);
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

apiRouter.use("/appointments", appointmentRoutes);
apiRouter.use("/patients", patientRoutes);
apiRouter.use("/owner", ownerRoutes);
apiRouter.use("/audit", auditRoutes);
apiRouter.use("/fhir", fhirRoutes);

export default apiRouter;
