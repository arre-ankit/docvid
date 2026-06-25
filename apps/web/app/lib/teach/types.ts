// Client-side lesson shapes. Leaf types come from @docvid/shared (the single
// source of truth shared with the AI worker); this module adds the client view
// of a Lesson (where the persisted fields are optional until generation finishes).

import type { Lesson as CoreLesson, StoredLesson } from "@docvid/shared";

export type {
  LessonStep,
  LessonImprovement,
  LessonSegment,
  DocsBlock,
} from "@docvid/shared";
export { LESSON_STORAGE_PREFIX } from "@docvid/shared";

/**
 * The lesson as the client holds it: the core generated lesson plus the optional
 * persisted fields (audio, timed segments, source, …) that arrive with a
 * completed lesson.
 */
export type Lesson = CoreLesson & Partial<Omit<StoredLesson, keyof CoreLesson>>;

export type LessonStatus =
  | { status: "running"; workflow?: string }
  | { status: "error"; error?: string | null }
  | { status: "not_found" }
  | { status: "complete"; lesson: Lesson; audioUrl: string | null };
