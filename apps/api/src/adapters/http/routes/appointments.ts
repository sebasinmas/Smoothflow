import { Router } from "express";
import {
  createAppointmentSchema,
  updateAppointmentSchema,
  createBlockSchema,
  doctorActionSchema,
  reviewCancellationSchema,
} from "@smoothflow/shared";
import {
  listAppointments,
  createAppointment,
  updateAppointment,
  createBlock,
  applyDoctorAction,
  reviewCancellationRequest,
} from "../../../composition/container.js";
import { requireAuth, getClientIp, type AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth(), async (req, res, next) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const items = await listAppointments(user, {
      from: req.query.from as string | undefined,
      to: req.query.to as string | undefined,
      practitionerId: req.query.practitionerId as string | undefined,
    });
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

router.post("/", requireAuth(["secretaria", "dueno", "paciente"]), async (req, res, next) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const input = createAppointmentSchema.parse(req.body);
    const appointment = await createAppointment(user, input, getClientIp(req));
    res.status(201).json({ appointment });
  } catch (err) {
    next(err);
  }
});

router.post("/blocks", requireAuth(["secretaria", "dueno"]), async (req, res, next) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const input = createBlockSchema.parse(req.body);
    const appointment = await createBlock(user, input, getClientIp(req));
    res.status(201).json({ appointment });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", requireAuth(["secretaria", "dueno", "paciente", "medico"]), async (req, res, next) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const input = updateAppointmentSchema.parse(req.body);
    const appointment = await updateAppointment(user, String(req.params.id), input, getClientIp(req));
    res.json({ appointment });
  } catch (err) {
    next(err);
  }
});

router.post("/:id/doctor-actions", requireAuth(["medico"]), async (req, res, next) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const input = doctorActionSchema.parse(req.body);
    const appointment = await applyDoctorAction(user, String(req.params.id), input, getClientIp(req));
    res.json({ appointment });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id/review-request", requireAuth(["secretaria", "dueno"]), async (req, res, next) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const input = reviewCancellationSchema.parse(req.body);
    const appointment = await reviewCancellationRequest(
      user,
      String(req.params.id),
      input,
      getClientIp(req),
    );
    res.json({ appointment });
  } catch (err) {
    next(err);
  }
});

export default router;
