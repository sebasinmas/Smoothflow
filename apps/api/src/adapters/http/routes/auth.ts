import { Router } from "express";
import { loginSchema, patientRegisterSchema } from "@smoothflow/shared";
import { loginUser, registerPatient, getUserById } from "../../../composition/container.js";
import { getClientIp, requireAuth, type AuthenticatedRequest } from "../middleware/auth.js";
import { closeUserConnections } from "../../ws/ws-server.js";

const router = Router();

function saveSession(req: import("express").Request): Promise<void> {
  return new Promise((resolve, reject) => {
    req.session.save((err) => (err ? reject(err) : resolve()));
  });
}

router.post("/login", async (req, res, next) => {
  try {
    const input = loginSchema.parse(req.body);
    const user = await loginUser(input, getClientIp(req));
    req.session.userId = user.id;
    await saveSession(req);
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

router.post("/patient/register", async (req, res, next) => {
  try {
    const input = patientRegisterSchema.parse(req.body);
    const user = await registerPatient(input, getClientIp(req));
    req.session.userId = user.id;
    await saveSession(req);
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
});

router.post("/patient/login", async (req, res, next) => {
  try {
    const input = loginSchema.parse(req.body);
    const user = await loginUser(input, getClientIp(req));
    if (user.role !== "paciente") {
      res.status(403).json({ error: "Use el portal de personal para este acceso" });
      return;
    }
    req.session.userId = user.id;
    await saveSession(req);
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

router.post("/logout", requireAuth(), async (req, res, next) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    closeUserConnections(user.id);
    req.session.destroy((err) => {
      if (err) next(err);
      else res.json({ ok: true });
    });
  } catch (err) {
    next(err);
  }
});

router.get("/me", async (req, res, next) => {
  try {
    if (!req.session.userId) {
      res.status(401).json({ error: "No autenticado" });
      return;
    }
    const user = await getUserById(req.session.userId);
    if (!user) {
      req.session.destroy(() => {});
      res.status(401).json({ error: "Sesión inválida" });
      return;
    }
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

export default router;
