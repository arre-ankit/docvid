import "server-only";

import { and, desc, eq, isNull } from "drizzle-orm";
import { nanoid } from "nanoid";

import { getDb, lessons } from "@/src/db";

const ANON_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function isoNow() {
  return new Date().toISOString();
}

function expiresAtFromNow() {
  return new Date(Date.now() + ANON_TTL_MS).toISOString();
}

export async function createAnonymousLesson(lessonId: string, ownerUserId?: string) {
  const db = await getDb();
  const claimToken = nanoid(32);
  const now = isoNow();

  await db.insert(lessons).values({
    id: lessonId,
    status: "running",
    claimToken,
    createdAt: now,
    expiresAt: expiresAtFromNow(),
    // If the creator is already signed in, own the lesson immediately so it
    // shows up in their library without needing the post-auth claim step.
    ...(ownerUserId ? { userId: ownerUserId, claimedAt: now } : {}),
  });

  return { claimToken };
}

export async function markLessonComplete(lessonId: string, title?: string) {
  const db = await getDb();
  await db
    .update(lessons)
    .set({
      status: "complete",
      ...(title ? { title } : {}),
    })
    .where(eq(lessons.id, lessonId));
}

export async function markLessonError(lessonId: string) {
  const db = await getDb();
  await db.update(lessons).set({ status: "error" }).where(eq(lessons.id, lessonId));
}

export async function claimLesson(params: {
  lessonId: string;
  claimToken: string;
  userId: string;
}) {
  const db = await getDb();
  const [row] = await db
    .select()
    .from(lessons)
    .where(
      and(
        eq(lessons.id, params.lessonId),
        eq(lessons.claimToken, params.claimToken),
        isNull(lessons.userId),
      ),
    )
    .limit(1);

  if (!row) {
    return { claimed: false as const, reason: "not_found_or_already_claimed" as const };
  }

  const claimedAt = isoNow();
  await db
    .update(lessons)
    .set({ userId: params.userId, claimedAt })
    .where(eq(lessons.id, params.lessonId));

  return { claimed: true as const, lessonId: params.lessonId, claimedAt };
}

export async function listLessonsForUser(userId: string, limit = 50) {
  const db = await getDb();
  return db
    .select()
    .from(lessons)
    .where(eq(lessons.userId, userId))
    .orderBy(desc(lessons.createdAt))
    .limit(limit);
}

export async function getLessonForUser(lessonId: string, userId: string) {
  const db = await getDb();
  const [row] = await db
    .select()
    .from(lessons)
    .where(and(eq(lessons.id, lessonId), eq(lessons.userId, userId)))
    .limit(1);
  return row ?? null;
}
