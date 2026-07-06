import { Router } from "express";
import {
  createStaffSchema,
  updateStaffSchema,
  createSpecialtySchema,
  updateSpecialtySchema,
  createPractitionerSchema,
  createScheduleTemplateSchema,
  updateScheduleTemplateSchema,
} from "@smoothflow/shared";
import {
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
} from "../../../use-cases/owner.js";
import { requireAuth, getClientIp, type AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();
const ownerOnly = requireAuth(["dueno"]);

router.get("/staff", ownerOnly, async (req, res, next) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const items = await listStaff(user.clinicId!);
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

router.post("/staff", ownerOnly, async (req, res, next) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const input = createStaffSchema.parse(req.body);
    const staff = await createStaff(user, input, getClientIp(req));
    res.status(201).json({ staff });
  } catch (err) {
    next(err);
  }
});

router.patch("/staff/:id", ownerOnly, async (req, res, next) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const input = updateStaffSchema.parse(req.body);
    const staff = await updateStaff(user, String(req.params.id), input, getClientIp(req));
    res.json({ staff });
  } catch (err) {
    next(err);
  }
});

router.post("/staff/:id/unlink", ownerOnly, async (req, res, next) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    await unlinkStaff(user, String(req.params.id), getClientIp(req));
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.post("/staff/:id/relink", ownerOnly, async (req, res, next) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const staff = await relinkStaff(user, String(req.params.id), getClientIp(req));
    res.json({ staff });
  } catch (err) {
    next(err);
  }
});

router.delete("/staff/:id", ownerOnly, async (req, res, next) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    await deleteStaffPermanently(user, String(req.params.id), getClientIp(req));
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.get("/specialties", ownerOnly, async (req, res, next) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const items = await listSpecialties(user.clinicId!);
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

router.post("/specialties", ownerOnly, async (req, res, next) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const input = createSpecialtySchema.parse(req.body);
    const specialty = await createSpecialty(user, input, getClientIp(req));
    res.status(201).json({ specialty });
  } catch (err) {
    next(err);
  }
});

router.patch("/specialties/:id", ownerOnly, async (req, res, next) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const input = updateSpecialtySchema.parse(req.body);
    const specialty = await updateSpecialty(user, String(req.params.id), input, getClientIp(req));
    res.json({ specialty });
  } catch (err) {
    next(err);
  }
});

router.delete("/specialties/:id", ownerOnly, async (req, res, next) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    await deleteSpecialty(user, String(req.params.id), getClientIp(req));
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.get("/practitioners", requireAuth(["dueno", "secretaria", "paciente"]), async (req, res, next) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const clinicId = user.clinicId ?? (req.query.clinicId as string);
    if (!clinicId) {
      res.json({ items: [] });
      return;
    }
    const items = await listPractitioners(clinicId);
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

router.post("/practitioners", ownerOnly, async (req, res, next) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const input = createPractitionerSchema.parse(req.body);
    const practitioner = await createPractitioner(user, input, getClientIp(req));
    res.status(201).json({ practitioner });
  } catch (err) {
    next(err);
  }
});

router.get("/schedules", ownerOnly, async (req, res, next) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const items = await listSchedules(user.clinicId!);
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

router.post("/schedules", ownerOnly, async (req, res, next) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const input = createScheduleTemplateSchema.parse(req.body);
    const schedule = await createSchedule(user, input, getClientIp(req));
    res.status(201).json({ schedule });
  } catch (err) {
    next(err);
  }
});

router.patch("/schedules/:id", ownerOnly, async (req, res, next) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const input = updateScheduleTemplateSchema.parse(req.body);
    const schedule = await updateSchedule(user, String(req.params.id), input, getClientIp(req));
    res.json({ schedule });
  } catch (err) {
    next(err);
  }
});

router.delete("/schedules/:id", ownerOnly, async (req, res, next) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    await deleteSchedule(user, String(req.params.id), getClientIp(req));
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.get("/reports/occupancy", ownerOnly, async (req, res, next) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const weekStart = (req.query.weekStart as string) ?? new Date().toISOString().slice(0, 10);
    const report = await getOccupancyReport(user.clinicId!, weekStart);
    res.json({ report });
  } catch (err) {
    next(err);
  }
});

export default router;
