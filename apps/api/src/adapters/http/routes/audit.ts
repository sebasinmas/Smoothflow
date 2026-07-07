import { Router } from "express";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth.js";
import { listAuditLogs } from "../../../composition/container.js";

const router = Router();

router.get("/", requireAuth(["dueno"]), async (req, res, next) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const items = await listAuditLogs(user.clinicId!);
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

export default router;
