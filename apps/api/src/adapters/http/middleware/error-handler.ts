import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import {
  DomainError, NotFoundError, ConflictError,
  ValidationError, AuthError, ForbiddenError, UnavailableError,
} from "../../../domain/errors.js";

const STATUS_BY_ERROR: Array<[abstract new (...a: never[]) => DomainError, number]> = [
  [NotFoundError, 404],
  [ConflictError, 409],
  [ValidationError, 400],
  [AuthError, 401],
  [ForbiddenError, 403],
  [UnavailableError, 503],
];

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof DomainError) {
    const status = STATUS_BY_ERROR.find(([E]) => err instanceof E)?.[1] ?? 500;
    res.status(status).json({ error: err.message, code: err.code });
    return;
  }
  if (err instanceof ZodError) {
    res.status(400).json({ error: "Datos inválidos", code: "VALIDATION_ERROR", details: err.flatten() });
    return;
  }
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor", code: "INTERNAL_ERROR" });
}
