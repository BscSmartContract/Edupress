import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.SESSION_SECRET || "fallback-secret";

export interface AuthRequest extends Request {
  adminId?: number;
  adminEmail?: string;
  adminName?: string;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string; name: string };
    req.adminId = decoded.id;
    req.adminEmail = decoded.email;
    req.adminName = decoded.name;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
