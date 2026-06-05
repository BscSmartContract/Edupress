import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "@workspace/db";
import { adminsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { AdminLoginBody } from "@workspace/api-zod";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router = Router();
const JWT_SECRET = process.env.SESSION_SECRET || "fallback-secret";

router.post("/auth/login", async (req, res) => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  try {
    const admin = await db.query.adminsTable.findFirst({
      where: eq(adminsTable.email, parsed.data.email),
    });
    if (!admin) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const valid = await bcrypt.compare(parsed.data.password, admin.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const token = jwt.sign(
      { id: admin.id, email: admin.email, name: admin.name },
      JWT_SECRET,
      { expiresIn: "30d" }
    );
    res.json({ admin: { id: admin.id, email: admin.email, name: admin.name }, token });
  } catch (err) {
    req.log.error(err, "Login error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/logout", (_req, res) => {
  res.json({ success: true, message: "Logged out" });
});

router.get("/auth/me", requireAuth, async (req: AuthRequest, res) => {
  try {
    const admin = await db.query.adminsTable.findFirst({
      where: eq(adminsTable.id, req.adminId!),
    });
    if (!admin) {
      res.status(401).json({ error: "Not found" });
      return;
    }
    res.json({ id: admin.id, email: admin.email, name: admin.name });
  } catch (err) {
    req.log.error(err, "Get me error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
