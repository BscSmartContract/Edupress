import { Router } from "express";
import { db } from "@workspace/db";
import { contentTable, questionsTable } from "@workspace/db";
import { eq, count, asc } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.get("/content/:contentId", async (req, res) => {
  const contentId = parseInt(req.params.contentId);
  try {
    const [item] = await db
      .select({
        id: contentTable.id,
        classId: contentTable.classId,
        type: contentTable.type,
        title: contentTable.title,
        description: contentTable.description,
        fileUrl: contentTable.fileUrl,
        thumbnailUrl: contentTable.thumbnailUrl,
        duration: contentTable.duration,
        sortOrder: contentTable.sortOrder,
        createdAt: contentTable.createdAt,
        questionCount: count(questionsTable.id),
      })
      .from(contentTable)
      .leftJoin(questionsTable, eq(questionsTable.contentId, contentTable.id))
      .where(eq(contentTable.id, contentId))
      .groupBy(contentTable.id);

    if (!item) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(item);
  } catch (err) {
    req.log.error(err, "Get content error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/content/:contentId", requireAuth, async (req, res) => {
  const contentId = parseInt(req.params.contentId);
  const { type, title, description, fileUrl, thumbnailUrl, duration, sortOrder } = req.body as {
    type?: string; title?: string; description?: string; fileUrl?: string;
    thumbnailUrl?: string; duration?: string; sortOrder?: number;
  };
  try {
    const updates: Record<string, unknown> = {};
    if (type !== undefined) updates.type = type;
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (fileUrl !== undefined) updates.fileUrl = fileUrl;
    if (thumbnailUrl !== undefined) updates.thumbnailUrl = thumbnailUrl;
    if (duration !== undefined) updates.duration = duration;
    if (sortOrder !== undefined) updates.sortOrder = sortOrder;

    const [updated] = await db
      .update(contentTable)
      .set(updates)
      .where(eq(contentTable.id, contentId))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json({ ...updated, questionCount: 0 });
  } catch (err) {
    req.log.error(err, "Update content error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/content/:contentId", requireAuth, async (req, res) => {
  const contentId = parseInt(req.params.contentId);
  try {
    const [deleted] = await db.delete(contentTable).where(eq(contentTable.id, contentId)).returning();
    if (!deleted) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    req.log.error(err, "Delete content error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/content/:contentId/questions", async (req, res) => {
  const contentId = parseInt(req.params.contentId);
  try {
    const questions = await db
      .select()
      .from(questionsTable)
      .where(eq(questionsTable.contentId, contentId))
      .orderBy(asc(questionsTable.sortOrder));
    res.json(questions);
  } catch (err) {
    req.log.error(err, "List questions error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/content/:contentId/questions", requireAuth, async (req, res) => {
  const contentId = parseInt(req.params.contentId);
  const { questionType, questionText, options, correctAnswer, explanation, sortOrder } = req.body as {
    questionType: string; questionText: string; options?: string[];
    correctAnswer: string; explanation?: string; sortOrder?: number;
  };
  if (!questionType || !questionText || !correctAnswer) {
    res.status(400).json({ error: "questionType, questionText and correctAnswer required" });
    return;
  }
  try {
    const [q] = await db
      .insert(questionsTable)
      .values({
        contentId,
        questionType: questionType as "mcq" | "fill_blank" | "true_false" | "short_answer",
        questionText, options, correctAnswer, explanation,
        sortOrder: sortOrder ?? 0,
      })
      .returning();
    res.status(201).json(q);
  } catch (err) {
    req.log.error(err, "Create question error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
