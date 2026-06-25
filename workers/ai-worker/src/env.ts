// Cloudflare bindings + vars for the DocVid AI worker.

export type Env = {
  /** Workers AI binding: lesson generation + narration TTS + toMarkdown. */
  AI: Ai;
  /** Workers AI model id for the lesson generation step. */
  AI_MODEL: string;
  /** Lesson JSON keyed by workflow instance id. */
  LESSONS: KVNamespace;
  /** Generated narration audio (WAV/MP3) keyed as `audio/<id>`. */
  LESSON_AUDIO: R2Bucket;
  /** Durable lesson-generation workflow. */
  TEACH_WORKFLOW: Workflow;
  /** Default Inworld TTS 2 voice id (e.g. "Dennis"). */
  DEFAULT_VOICE: string;
  /** Comma-separated list of allowed CORS origins. */
  ALLOWED_ORIGINS: string;
};
