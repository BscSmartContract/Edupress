import { Router } from "express";
import { db } from "@workspace/db";
import { seriesTable, classesTable } from "@workspace/db";
import { eq, count, asc, ilike } from "drizzle-orm";
import { CreateSeriesBody, UpdateSeriesBody } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.get("/series", async (req, res) => {
  try {
    const search = req.query.search as string | undefined;
    const query = db
      .select({
        id: seriesTable.id,
        name: seriesTable.name,
        slug: seriesTable.slug,
        description: seriesTable.description,
        coverImageUrl: seriesTable.coverImageUrl,
        color: seriesTable.color,
        createdAt: seriesTable.createdAt,
        classCount: count(classesTable.id),
      })
      .from(seriesTable)
      .leftJoin(classesTable, eq(classesTable.seriesId, seriesTable.id))
      .groupBy(seriesTable.id)
      .orderBy(asc(seriesTable.name));

    const results = search
      ? await query.where(ilike(seriesTable.name, `%${search}%`))
      : await query;

    res.json(results);
  } catch (err) {
    req.log.error(err, "List series error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/series", requireAuth, async (req, res) => {
  const parsed = CreateSeriesBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation error", message: parsed.error.message });
    return;
  }
  try {
    const [series] = await db.insert(seriesTable).values(parsed.data).returning();
    res.status(201).json({ ...series, classCount: 0 });
  } catch (err) {
    req.log.error(err, "Create series error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/series/:seriesId", async (req, res) => {
  const seriesId = parseInt(req.params.seriesId);
  try {
    const [series] = await db
      .select({
        id: seriesTable.id,
        name: seriesTable.name,
        slug: seriesTable.slug,
        description: seriesTable.description,
        coverImageUrl: seriesTable.coverImageUrl,
        color: seriesTable.color,
        createdAt: seriesTable.createdAt,
        classCount: count(classesTable.id),
      })
      .from(seriesTable)
      .leftJoin(classesTable, eq(classesTable.seriesId, seriesTable.id))
      .where(eq(seriesTable.id, seriesId))
      .groupBy(seriesTable.id);

    if (!series) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    const classes = await db
      .select()
      .from(classesTable)
      .where(eq(classesTable.seriesId, seriesId))
      .orderBy(asc(classesTable.sortOrder));

    res.json({ ...series, classes: classes.map(c => ({ ...c, contentCount: 0 })) });
  } catch (err) {
    req.log.error(err, "Get series error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/series/:seriesId", requireAuth, async (req, res) => {
  const seriesId = parseInt(req.params.seriesId);
  const parsed = UpdateSeriesBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation error" });
    return;
  }
  try {
    const [updated] = await db
      .update(seriesTable)
      .set(parsed.data)
      .where(eq(seriesTable.id, seriesId))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json({ ...updated, classCount: 0 });
  } catch (err) {
    req.log.error(err, "Update series error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/series/:seriesId", requireAuth, async (req, res) => {
  const seriesId = parseInt(req.params.seriesId);
  try {
    const [deleted] = await db.delete(seriesTable).where(eq(seriesTable.id, seriesId)).returning();
    if (!deleted) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    req.log.error(err, "Delete series error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/series/:seriesId/classes", async (req, res) => {
  const seriesId = parseInt(req.params.seriesId);
  try {
    const classes = await db
      .select()
      .from(classesTable)
      .where(eq(classesTable.seriesId, seriesId))
      .orderBy(asc(classesTable.sortOrder));
    res.json(classes.map(c => ({ ...c, contentCount: 0 })));
  } catch (err) {
    req.log.error(err, "List classes error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/series/:seriesId/classes", requireAuth, async (req, res) => {
  const seriesId = parseInt(req.params.seriesId);
  const { classLevel, label, sortOrder } = req.body as { classLevel: string; label: string; sortOrder?: number };
  if (!classLevel || !label) {
    res.status(400).json({ error: "classLevel and label required" });
    return;
  }
  try {
    const [cls] = await db
      .insert(classesTable)
      .values({ seriesId, classLevel, label, sortOrder: sortOrder ?? 0 })
      .returning();
    res.status(201).json({ ...cls, contentCount: 0 });
  } catch (err) {
    req.log.error(err, "Create class error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
