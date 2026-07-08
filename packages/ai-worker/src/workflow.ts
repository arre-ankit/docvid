import { WorkflowEntrypoint, type WorkflowEvent, type WorkflowStep } from "cloudflare:workers";

import type { Lesson, LessonSegment, StoredLesson, WorkflowParams } from "@docvid/shared";

import { buildNarrationSegments, generateDocsBlocks, generateLessonDraft } from "./ai";
import { fetchPageMarkdown } from "./browser";
import type { Env } from "./env";
import { synthesizeSegmentsInworld } from "./inworld";
import { getLesson, putLesson } from "./lessonStore";
import { synthesizeSegmentsMelo } from "./melotts";

/** Rough spoken duration (ms) for text when no real audio is available (~165 wpm, min 1.4s). */
function estimateDurationMs(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1400, Math.round((words / 165) * 60_000));
}

/** Assemble timed segments from per-segment text + durations (cumulative startMs). */
function buildSegments(
  texts: { kind: "intro" | "step"; index: number; text: string }[],
  durations: number[],
): { segments: LessonSegment[]; totalMs: number } {
  let startMs = 0;
  const segments = texts.map((t, i) => {
    const durationMs = durations[i] && durations[i]! > 0 ? durations[i]! : estimateDurationMs(t.text);
    const seg: LessonSegment = { ...t, startMs, durationMs };
    startMs += durationMs;
    return seg;
  });
  return { segments, totalMs: startMs };
}

/**
 * Durable, retryable lesson generation:
 *   plan (Workers AI) -> validate -> narrate (TTS -> R2) -> persist (KV)
 *
 * Each step.do(...) persists its result, so a failure in narration won't re-run
 * the (expensive) AI generation — the workflow resumes from the last good step.
 */
export class TeachWorkflow extends WorkflowEntrypoint<Env, WorkflowParams> {
  async run(event: WorkflowEvent<WorkflowParams>, step: WorkflowStep) {
    const { prompt, language, voice, revoiceOf, url } = event.payload;
    const instanceId = event.instanceId;

    // Re-voice path: re-synthesize an existing lesson's narration with a new
    // speaker, updating its audio + segment timing in place (no LLM re-run).
    if (revoiceOf) {
      return this.revoice(step, revoiceOf, voice);
    }

    // 0. If a source URL was given, fetch the page as Markdown (toMarkdown) so
    //    the lesson can be generated from real documentation.
    const source = url
      ? await step.do(
          "fetch-source",
          { retries: { limit: 2, delay: "3 seconds", backoff: "exponential" }, timeout: "1 minute" },
          async (): Promise<string | null> => {
            return fetchPageMarkdown({ AI: this.env.AI }, url);
          },
        )
      : null;

    // 1. Generate + validate the lesson (code steps + narration).
    const lesson = await step.do(
      "plan",
      { retries: { limit: 2, delay: "2 seconds", backoff: "constant" }, timeout: "1 minute" },
      async (): Promise<Lesson> => {
        // Ensure a usable prompt even for a URL-only request whose page content
        // couldn't be fetched (toMarkdown off / extraction empty).
        const planPrompt = prompt || (url ? `Create a tutorial based on: ${url}` : prompt);
        return generateLessonDraft(
          { AI: this.env.AI, AI_MODEL: this.env.AI_MODEL },
          { prompt: planPrompt, language, source: source ?? undefined, sourceUrl: url },
        );
      },
    );

    // 1b. Docs "gist" — summarize the source's code blocks (title + 1-line each).
    //     A SEPARATE model call from narration; never affects audio generation.
    const docsBlocks = source
      ? await step.do(
          "docs",
          { retries: { limit: 1, delay: "2 seconds", backoff: "constant" }, timeout: "1 minute" },
          async () =>
            generateDocsBlocks({ AI: this.env.AI, AI_MODEL: this.env.AI_MODEL }, source),
        )
      : null;

    // 2. Synthesize per-segment narration (intro + each step) and store the
    //    merged audio track in R2. Returns the audio key plus per-segment
    //    durations so the code animation can be timed to the voice.
    const narration = await step.do(
      "narrate",
      // Generous timeout so a full synthesis run completes in one go: if it times
      // out, the workflow retries while the original TTS calls are still running,
      // which doubles up work and recomputes the audio 2-3x. One retry only.
      { retries: { limit: 1, delay: "5 seconds", backoff: "constant" }, timeout: "10 minutes" },
      async (): Promise<{ audioKey: string | null; durations: number[] }> => {
        const texts = buildNarrationSegments(lesson);
        const { audio, durations, contentType } = await this.synthesize(
          texts.map((t) => t.text),
          voice,
        );
        if (audio.byteLength === 0) return { audioKey: null, durations: texts.map(() => 0) };

        const key = `audio/${instanceId}`;
        await this.env.LESSON_AUDIO.put(key, audio, { httpMetadata: { contentType } });
        return { audioKey: key, durations };
      },
    );

    // 3. Persist the final lesson (+ timed segments) for the status endpoint to serve.
    await step.do("persist", async () => {
      const texts = buildNarrationSegments(lesson);
      const { segments, totalMs } = buildSegments(texts, narration.durations);
      const stored: StoredLesson = {
        ...lesson,
        audioKey: narration.audioKey,
        segments,
        totalMs,
        voice: voice || this.env.DEFAULT_VOICE,
        sourceMarkdown: source ?? undefined,
        sourceUrl: url || undefined,
        docsBlocks: docsBlocks ?? undefined,
        createdAt: new Date().toISOString(),
      };
      // Durable in R2 (source of truth, no expiry) + KV cache for fast reads.
      await putLesson(this.env, instanceId, stored);
    });

    return { ok: true, audioKey: narration.audioKey };
  }

  /**
   * Synthesize narration. Prefer Inworld TTS 2 (expressive, selectable voices);
   * if it's unavailable on the account (e.g. AI Gateway credentials error), fall
   * back to the first-party MeloTTS model so a lesson always gets audio.
   */
  private async synthesize(
    texts: string[],
    voice?: string,
  ): Promise<{ audio: Uint8Array; durations: number[]; contentType: string }> {
    try {
      const res = await synthesizeSegmentsInworld(this.env.AI, texts, voice);
      if (res.audio.byteLength > 0) return res;
      throw new Error("Inworld returned no audio");
    } catch (e) {
      console.log(`[narrate] Inworld unavailable, falling back to MeloTTS: ${(e as Error)?.message}`);
      return synthesizeSegmentsMelo(this.env.AI, texts);
    }
  }

  /**
   * Re-synthesize an existing lesson's narration with a different voice. Reuses
   * the stored per-segment script (no AI call), overwrites the
   * lesson's audio object, and recomputes the segment timing for the new voice.
   */
  private async revoice(step: WorkflowStep, lessonId: string, voice?: string) {
    const narration = await step.do(
      "revoice-narrate",
      { retries: { limit: 2, delay: "3 seconds", backoff: "exponential" }, timeout: "3 minutes" },
      async (): Promise<{ audioKey: string | null; durations: number[] }> => {
        const stored = await getLesson(this.env, lessonId);
        if (!stored) throw new Error(`lesson ${lessonId} not found`);
        const texts = buildNarrationSegments(stored);

        const { audio, durations, contentType } = await this.synthesize(
          texts.map((t) => t.text),
          voice,
        );
        if (audio.byteLength === 0) {
          return { audioKey: stored.audioKey, durations: texts.map(() => 0) };
        }

        // Overwrite the lesson's audio object so the existing audio URL serves it.
        const key = `audio/${lessonId}`;
        await this.env.LESSON_AUDIO.put(key, audio, { httpMetadata: { contentType } });
        return { audioKey: key, durations };
      },
    );

    await step.do("revoice-persist", async () => {
      const stored = await getLesson(this.env, lessonId);
      if (!stored) throw new Error(`lesson ${lessonId} not found`);
      const texts = buildNarrationSegments(stored);
      const { segments, totalMs } = buildSegments(texts, narration.durations);
      const updated: StoredLesson = {
        ...stored,
        audioKey: narration.audioKey,
        segments,
        totalMs,
        voice: voice || stored.voice,
      };
      await putLesson(this.env, lessonId, updated);
    });

    return { ok: true, audioKey: narration.audioKey };
  }
}
