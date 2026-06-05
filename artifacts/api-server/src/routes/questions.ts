import { Router } from "express";
import { db } from "@workspace/db";
import { questionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.put("/questions/:questionId", requireAuth, async (req, res) => {
  const questionId = parseInt(req.params.questionId);
  const { questionType, questionText, options, correctAnswer, explanation, sortOrder } = req.body as {
    questionType?: string; questionText?: string; options?: string[];
    correctAnswer?: string; explanation?: string; sortOrder?: number;
  };
  try {
    const updates: Record<string, unknown> = {};
    if (questionType !== undefined) updates.questionType = questionType;
    if (questionText !== undefined) updates.questionText = questionText;
    if (options !== undefined) updates.options = options;
    if (correctAnswer !== undefined) updates.correctAnswer = correctAnswer;
    if (explanation !== undefined) updates.explanation = explanation;
    if (sortOrder !== undefined) updates.sortOrder = sortOrder;

    const [updated] = await db
      .update(questionsTable)
      .set(updates)
      .where(eq(questionsTable.id, questionId))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(updated);
  } catch (err) {
    req.log.error(err, "Update question error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/questions/:questionId", requireAuth, async (req, res) => {
  const questionId = parseInt(req.params.questionId);
  try {
    const [deleted] = await db.delete(questionsTable).where(eq(questionsTable.id, questionId)).returning();
    if (!deleted) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    req.log.error(err, "Delete question error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
