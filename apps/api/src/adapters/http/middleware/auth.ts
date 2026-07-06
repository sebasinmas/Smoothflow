import type { Request, Response, NextFunction } from "express";
import type { Role, SessionUser } from "@smoothflow/shared";
import { AppError } from "../../../domain/errors.js";
import { getUserById } from "../../../use-cases/auth.js";

export interface AuthenticatedRequest extends Request {
  user: SessionUser;
}

export async function loadSessionUser(req: Request): Promise<SessionUser | null> {
  if (!req.session.userId) return null;
  return getUserById(req.session.userId);
}

export function requireAuth(roles?: Role[]) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const user = await loadSessionUser(req);
      if (!user) {
        throw new AppError("No autenticado", 401, "UNAUTHORIZED");
      }
      if (roles && !roles.includes(user.role)) {
        throw new AppError("Acceso denegado", 403, "FORBIDDEN");
      }
      (req as AuthenticatedRequest).user = user;
      next();
    } catch (err) {
      next(err);
    }
  };
}

export function getClientIp(req: Request): string {
  return (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ?? req.ip ?? "";
}
