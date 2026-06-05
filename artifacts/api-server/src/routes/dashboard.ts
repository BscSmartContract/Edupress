import { Router } from "express";
import { db } from "@workspace/db";
import { seriesTable, classesTable, contentTable, questionsTable } from "@workspace/db";
import { eq, count, asc, and } from "drizzle-orm";

const router = Router();

router.get("/dashboard/stats", async (req, res) => {
  try {
    const [{ totalSeries }] = await db.select({ totalSeries: count() }).from(seriesTable);
    const [{ totalClasses }] = await db.select({ totalClasses: count() }).from(classesTable);
    const [{ totalVideos }] = await db.select({ totalVideos: count() }).from(contentTable).where(eq(contentTable.type, "video"));
    const [{ totalPdfs }] = await db.select({ totalPdfs: count() }).from(contentTable).where(eq(contentTable.type, "pdf"));
    const [{ totalWorksheets }] = await db.select({ totalWorksheets: count() }).from(contentTable).where(eq(contentTable.type, "worksheet"));
    const [{ totalAnswerKeys }] = await db.select({ totalAnswerKeys: count() }).from(contentTable).where(eq(contentTable.type, "answer_key"));
    const [{ totalQuestions }] = await db.select({ totalQuestions: count() }).from(questionsTable);

    const recentSeries = await db
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
      .orderBy(asc(seriesTable.name))
      .limit(5);

    res.json({
      totalSeries, totalClasses, totalVideos, totalPdfs,
      totalWorksheets, totalAnswerKeys, totalQuestions,
      recentSeries,
    });
  } catch (err) {
    req.log.error(err, "Dashboard stats error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
