import { Router } from "express";
import { desc } from "drizzle-orm";
import { db } from "../../../infrastructure/db/client.js";
import { auditLogs } from "../../../infrastructure/db/schema.js";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth.js";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/", requireAuth(["dueno"]), async (req, res, next) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const rows = await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.clinicId, user.clinicId!))
      .orderBy(desc(auditLogs.createdAt))
      .limit(100);
    res.json({
      items: rows.map((r) => ({
        id: r.id,
        userId: r.userId,
        action: r.action,
        resource: r.resource,
        resourceId: r.resourceId,
        ipAddress: r.ipAddress,
        metadata: r.metadata as Record<string, unknown> | null,
        createdAt: r.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
