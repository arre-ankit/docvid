// Shared lesson shape — the single source of truth for both the web app and the
// AI worker. (Previously duplicated across the Next app and the worker.)

/** A single code step in the progressive build of the concept. */
export type LessonStep = {
  /** Complete, valid code snippet that builds on the previous step. */
  code: string;
  /** Short on-screen explanation of what changed in this step. */
  explanation: string;
  /** Plain prose (no code) used for text-to-speech narration. */
  narration: string;
};

/** A code block from the source docs, summarized for the docs "gist" view. */
export type DocsBlock = {
  /** Highlight language id (e.g. "ts", "bash"). */
  lang: string;
  /** The code, verbatim from the docs. */
  code: string;
  /** A few-word title for the block. */
  title: string;
  /** One short sentence describing what the block does. */
  summary: string;
};

/** An "improve it with examples" variation shown after the core steps. */
export type LessonImprovement = {
  title: string;
  code: string;
  narration: string;
};

/** The core generated lesson, before audio/persistence. */
export type Lesson = {
  title: string;
  /** Shiki/highlight language id, e.g. "tsx", "python". */
  language: string;
  /** Intro narration: the crux + what the learner is about to learn (spoken over the intro card). */
  hook: string;
  steps: LessonStep[];
  improvements: LessonImprovement[];
};

/** What the AI step must return before audio/persistence. */
export type LessonDraft = Lesson;

/** A timed slice of the narration track, aligned with what's on screen. */
export type LessonSegment = {
  /** "intro" plays over the title card; "step" aligns with code step `index`. */
  kind: "intro" | "step";
  /** Index into the flattened code steps (steps then improvements); -1 for intro. */
  index: number;
  /** Spoken text (also shown as the on-screen caption). */
  text: string;
  startMs: number;
  durationMs: number;
};

/** Stored in KV/D1 under the workflow instance id. */
export type StoredLesson = Lesson & {
  /** R2 object key for the narration WAV, or null if audio was skipped/failed. */
  audioKey: string | null;
  /** Timed caption/animation segments (intro + one per code step). */
  segments: LessonSegment[];
  /** Total narration duration in ms (sum of segment durations). */
  totalMs: number;
  /** TTS speaker used for the current narration track. */
  voice?: string;
  /** Original source page rendered to Markdown (when generated from a URL). */
  sourceMarkdown?: string;
  /** The source URL the lesson was built from, if any. */
  sourceUrl?: string;
  /** Summarized code blocks from the source docs (the "gist" view). */
  docsBlocks?: DocsBlock[];
  createdAt: string;
};

/** Status payload returned to the client while/after a lesson is generated. */
export type LessonStatus =
  | { status: "running"; workflow?: string }
  | { status: "error"; error?: string | null }
  | { status: "not_found" }
  | { status: "complete"; lesson: StoredLesson; audioUrl: string | null };

/** Parameters for the teach workflow. */
export type WorkflowParams = {
  prompt: string;
  language?: string;
  /** Optional source URL (docs/article) — fetched as Markdown and used as lesson source. */
  url?: string;
  /** TTS speaker override; falls back to the worker's default speaker. */
  voice?: string;
  /**
   * When set, the workflow skips planning and re-synthesizes the narration of
   * an existing lesson (this id) with `voice`, updating its audio + segment
   * timing in place.
   */
  revoiceOf?: string;
};

/** KV/D1 key prefix for stored lessons. */
export const LESSON_STORAGE_PREFIX = "docvid-lesson:";
