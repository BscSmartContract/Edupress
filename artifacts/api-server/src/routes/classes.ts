import { Router } from "express";
import { db } from "@workspace/db";
import { classesTable, contentTable, seriesTable } from "@workspace/db";
import { eq, count, asc } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.get("/classes/:classId", async (req, res) => {
  const classId = parseInt(req.params.classId);
  try {
    const [cls] = await db
      .select({
        id: classesTable.id,
        seriesId: classesTable.seriesId,
        classLevel: classesTable.classLevel,
        label: classesTable.label,
        sortOrder: classesTable.sortOrder,
        createdAt: classesTable.createdAt,
        contentCount: count(contentTable.id),
        seriesName: seriesTable.name,
      })
      .from(classesTable)
      .leftJoin(contentTable, eq(contentTable.classId, classesTable.id))
      .leftJoin(seriesTable, eq(seriesTable.id, classesTable.seriesId))
      .where(eq(classesTable.id, classId))
      .groupBy(classesTable.id, seriesTable.name);

    if (!cls) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    const content = await db
      .select()
      .from(contentTable)
      .where(eq(contentTable.classId, classId))
      .orderBy(asc(contentTable.sortOrder));

    res.json({ ...cls, content: content.map(c => ({ ...c, questionCount: 0 })) });
  } catch (err) {
    req.log.error(err, "Get class error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/classes/:classId", requireAuth, async (req, res) => {
  const classId = parseInt(req.params.classId);
  const { classLevel, label, sortOrder } = req.body as { classLevel?: string; label?: string; sortOrder?: number };
  try {
    const updates: Record<string, unknown> = {};
    if (classLevel !== undefined) updates.classLevel = classLevel;
    if (label !== undefined) updates.label = label;
    if (sortOrder !== undefined) updates.sortOrder = sortOrder;

    const [updated] = await db
      .update(classesTable)
      .set(updates)
      .where(eq(classesTable.id, classId))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json({ ...updated, contentCount: 0 });
  } catch (err) {
    req.log.error(err, "Update class error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/classes/:classId", requireAuth, async (req, res) => {
  const classId = parseInt(req.params.classId);
  try {
    const [deleted] = await db.delete(classesTable).where(eq(classesTable.id, classId)).returning();
    if (!deleted) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    req.log.error(err, "Delete class error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/classes/:classId/content", async (req, res) => {
  const classId = parseInt(req.params.classId);
  const type = req.query.type as string | undefined;
  try {
    const query = db
      .select()
      .from(contentTable)
      .where(eq(contentTable.classId, classId))
      .orderBy(asc(contentTable.sortOrder));

    const items = await query;
    const filtered = type ? items.filter(i => i.type === type) : items;
    res.json(filtered.map(i => ({ ...i, questionCount: 0 })));
  } catch (err) {
    req.log.error(err, "List content error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/classes/:classId/content", requireAuth, async (req, res) => {
  const classId = parseInt(req.params.classId);
  const { type, title, description, fileUrl, thumbnailUrl, duration, sortOrder } = req.body as {
    type: string; title: string; description?: string; fileUrl?: string;
    thumbnailUrl?: string; duration?: string; sortOrder?: number;
  };
  if (!type || !title) {
    res.status(400).json({ error: "type and title required" });
    return;
  }
  try {
    const [item] = await db
      .insert(contentTable)
      .values({ classId, type: type as "video" | "pdf" | "worksheet" | "answer_key", title, description, fileUrl, thumbnailUrl, duration, sortOrder: sortOrder ?? 0 })
      .returning();
    res.status(201).json({ ...item, questionCount: 0 });
  } catch (err) {
    req.log.error(err, "Create content error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
