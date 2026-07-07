import { Router } from "express";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth.js";
import { requireClinic } from "../require-clinic.js";
import { listAuditLogs } from "../../../composition/container.js";

const router = Router();

router.get("/", requireAuth(["dueno"]), async (req, res, next) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const items = await listAuditLogs(requireClinic(user));
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

export default router;
