import type { StoredLesson, WorkflowParams } from "@docvid/shared";

import type { Env } from "./env";
import { TeachWorkflow } from "./workflow";

export { TeachWorkflow };

function corsHeaders(env: Env, origin: string | null): Record<string, string> {
  const allowed = (env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const allowOrigin =
    origin && (allowed.includes(origin) || allowed.includes("*")) ? origin : allowed[0] ?? "*";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

function json(data: unknown, init: ResponseInit, cors: Record<string, string>): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { "Content-Type": "application/json", ...cors, ...(init.headers ?? {}) },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");
    const cors = corsHeaders(env, origin);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    // POST /lessons { prompt, language?, voice?, url? } -> { id }
    if (url.pathname === "/lessons" && request.method === "POST") {
      let body: WorkflowParams;
      try {
        body = (await request.json()) as WorkflowParams;
      } catch {
        return json({ error: "Invalid JSON body" }, { status: 400 }, cors);
      }
      const prompt = (body.prompt ?? "").trim();
      const sourceUrl = (body.url ?? "").trim();
      if (!prompt && !sourceUrl) {
        return json({ error: "prompt or url is required" }, { status: 400 }, cors);
      }
      if (sourceUrl && !/^https?:\/\//i.test(sourceUrl)) {
        return json({ error: "url must be http(s)" }, { status: 400 }, cors);
      }

      const instance = await env.TEACH_WORKFLOW.create({
        params: { prompt, language: body.language, voice: body.voice, url: sourceUrl || undefined },
      });
      return json({ id: instance.id }, { status: 202 }, cors);
    }

    // POST /lessons/:id/revoice { voice } -> { id } (re-synthesize narration)
    const revoiceMatch = url.pathname.match(/^\/lessons\/([\w-]+)\/revoice$/);
    if (revoiceMatch && request.method === "POST") {
      const id = revoiceMatch[1]!;
      let body: { voice?: string };
      try {
        body = (await request.json()) as { voice?: string };
      } catch {
        return json({ error: "Invalid JSON body" }, { status: 400 }, cors);
      }
      const voice = (body.voice ?? "").trim();
      if (!voice) return json({ error: "voice is required" }, { status: 400 }, cors);

      const exists = await env.LESSONS.get(id);
      if (!exists) return json({ error: "lesson not found" }, { status: 404 }, cors);

      const instance = await env.TEACH_WORKFLOW.create({
        params: { prompt: "", revoiceOf: id, voice },
      });
      return json({ id: instance.id }, { status: 202 }, cors);
    }

    // GET /lessons/:id -> { status, lesson? }
    const lessonMatch = url.pathname.match(/^\/lessons\/([\w-]+)$/);
    if (lessonMatch && request.method === "GET") {
      const id = lessonMatch[1]!;
      const stored = await env.LESSONS.get(id);
      if (stored) {
        const lesson = JSON.parse(stored) as StoredLesson;
        const audioUrl = lesson.audioKey ? `/audio/${id}` : null;
        return json({ status: "complete", lesson, audioUrl }, { status: 200 }, cors);
      }

      // Not yet persisted — report live workflow status.
      try {
        const instance = await env.TEACH_WORKFLOW.get(id);
        const status = await instance.status();
        const phase =
          status.status === "errored" || status.status === "terminated"
            ? "error"
            : status.status === "complete"
              ? "complete"
              : "running";
        return json(
          { status: phase, workflow: status.status, error: status.error ?? null },
          { status: 200 },
          cors,
        );
      } catch {
        return json({ status: "not_found" }, { status: 404 }, cors);
      }
    }

    // GET /audio/:id -> streams the narration audio from R2.
    const audioMatch = url.pathname.match(/^\/audio\/([\w-]+)$/);
    if (audioMatch && request.method === "GET") {
      const key = `audio/${audioMatch[1]}`;
      const obj = await env.LESSON_AUDIO.get(key);
      if (!obj) return new Response("Not found", { status: 404, headers: cors });
      return new Response(obj.body, {
        headers: {
          "Content-Type": obj.httpMetadata?.contentType ?? "audio/mpeg",
          "Cache-Control": "public, max-age=604800",
          ...cors,
        },
      });
    }

    if (url.pathname === "/" || url.pathname === "/health") {
      return json({ ok: true, service: "docvid-ai" }, { status: 200 }, cors);
    }

    return json({ error: "Not found" }, { status: 404 }, cors);
  },
};
