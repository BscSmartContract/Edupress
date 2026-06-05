import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { adminsTable, seriesTable, classesTable } from "@workspace/db";
import { count } from "drizzle-orm";
import { logger } from "./logger";

export async function seedIfEmpty() {
  const [row] = await db.select({ value: count() }).from(adminsTable);
  if (row.value > 0) return;

  logger.info("Seeding database with initial data...");

  const hash = await bcrypt.hash("Admin@123", 10);
  await db.insert(adminsTable).values({
    email: "admin@edupress.com",
    passwordHash: hash,
    name: "EduPress Admin",
  });

  const seriesData = [
    { name: "Science", slug: "science", description: "Comprehensive science series for Classes 1–8", color: "#2196F3" },
    { name: "Mathematics", slug: "mathematics", description: "Complete maths curriculum for Classes 1–8", color: "#4CAF50" },
    { name: "Hindi Vyakaran", slug: "hindi-vyakaran", description: "Hindi grammar series for Classes 1–8", color: "#FF9800" },
    { name: "Hindi Literature", slug: "hindi-literature", description: "Hindi literature series", color: "#9C27B0" },
    { name: "Nursery Series", slug: "nursery", description: "Pre-school learning — Nursery, LKG, UKG", color: "#F44336" },
    { name: "English", slug: "english", description: "English language series for Classes 1–8", color: "#00BCD4" },
    { name: "Social Studies", slug: "social-studies", description: "EVS and Social Studies for Classes 1–8", color: "#795548" },
  ];

  for (const s of seriesData) {
    const [series] = await db.insert(seriesTable).values(s).returning();

    if (s.slug === "nursery") {
      await db.insert(classesTable).values([
        { seriesId: series.id, classLevel: "nursery", label: "Nursery", sortOrder: 1 },
        { seriesId: series.id, classLevel: "lkg", label: "LKG", sortOrder: 2 },
        { seriesId: series.id, classLevel: "ukg", label: "UKG", sortOrder: 3 },
      ]);
    } else {
      await db.insert(classesTable).values(
        Array.from({ length: 8 }, (_, i) => ({
          seriesId: series.id,
          classLevel: `class-${i + 1}`,
          label: `Class ${i + 1}`,
          sortOrder: i + 1,
        }))
      );
    }
  }

  logger.info("✅ Database seeded. Login: admin@edupress.com / Admin@123");
}
