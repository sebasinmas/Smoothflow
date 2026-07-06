import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../../../domain/errors.js";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message, code: err.code });
    return;
  }
  if (err instanceof ZodError) {
    res.status(400).json({
      error: "Datos inválidos",
      code: "VALIDATION_ERROR",
      details: err.flatten(),
    });
    return;
  }
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor", code: "INTERNAL_ERROR" });
}
