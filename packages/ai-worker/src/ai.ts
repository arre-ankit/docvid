import type { DocsBlock, Lesson, LessonDraft } from "@docvid/shared";

const SYSTEM_PROMPT = `You are an expert programming teacher that produces SHORT narrated code lessons,
like a polished explainer video. You are given a learner's prompt (e.g. "Explain the use of
useState in React"). Produce a lesson that plays as: an intro hook, then a sequence of code STEPS
that progressively build the concept, then a couple of improvements.

The lesson is animated as a "magic move": each step's "code" must be a COMPLETE, valid,
self-contained snippet that is a small, focused evolution of the previous step's code, so
consecutive steps share most of their code and differ by one clear change.

Write the spoken parts ("hook" and each "narration") as a connected script. Teach at an unhurried,
patient pace — like a friendly instructor walking the viewer through the code as it appears:
- "hook": 2-3 sentences. Say what this concept is, why it matters, and that we'll go through it
  step by step.
- Each step "narration": 3-4 sentences (about 55-80 words). Walk through this step properly: say
  what it does overall, then explain the important line(s) or parts one by one and why they matter,
  and how it builds on the previous step. Don't be terse — give the viewer time to follow along.
- The improvements' narration: 3-4 sentences on the better approach and when to use it.

Rules:
- 3 to 5 core steps; 1 to 2 improvements (each with a short "title").
- "explanation" is one short on-screen label (a few words). "narration" is the spoken script.
- All spoken text must be natural spoken English: no code, no symbols read literally, no markdown.
- "language" must be a lowercase highlight id such as "tsx", "ts", "js", "jsx", "python", "go".

CODE RULES (critical — these keep the lesson rendering correctly, do not violate them):
- Every step's "code" MUST be REAL, complete, runnable code — NEVER a comment-only
  placeholder, a TODO, or a prose summary. A step whose "code" is only comments is invalid.
- SIZE LIMITS (hard): each step's code is AT MOST 12 lines, and EVERY line is AT MOST 60
  characters wide. Keep snippets tiny and focused — they must fit on a slide.
- Do NOT put long URLs or long string literals in code. If the real code has a long URL/string,
  shorten it (e.g. "https://.../llms.ts" -> a short path, or assign it to a short constant first).
  A long line that wraps off the slide breaks the animation.
- If the real example is long, SPLIT it across more steps (each a small evolution of the previous)
  instead of pasting a big block into one step. Prefer 4-5 small steps over 2 huge ones.
- Put explanations in "explanation"/"narration", NOT inside the code. The code shows the actual
  implementation; at most a sparse inline comment is allowed, but the code itself must be present.
- Do NOT wrap code in markdown fences.
- When documentation is provided, use the ACTUAL code from it. Keep identifiers, API calls and the
  shape of the code faithful (don't paraphrase into prose), but still obey the size limits above —
  trim or split long snippets rather than dumping them verbatim.`;

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    language: { type: "string" },
    hook: { type: "string" },
    steps: {
      type: "array",
      items: {
        type: "object",
        properties: {
          code: { type: "string" },
          explanation: { type: "string" },
          narration: { type: "string" },
        },
        required: ["code", "explanation", "narration"],
      },
    },
    improvements: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          code: { type: "string" },
          narration: { type: "string" },
        },
        required: ["title", "code", "narration"],
      },
    },
  },
  required: ["title", "language", "hook", "steps", "improvements"],
} as const;

/**
 * Strip markdown code fences so the value is always raw code. Handles ```ts,
 * ```py, ```tsx, bare ``` (and ~~~) whether they wrap the whole block or just
 * leak in as stray lines — any fence-only line is removed.
 */
function stripCodeFences(code: string): string {
  let out = code.replace(/\r\n/g, "\n").trim();
  // Drop a leading opening fence (with optional language) and trailing fence.
  out = out.replace(/^(?:```|~~~)[^\n]*\n?/, "");
  out = out.replace(/\n?(?:```|~~~)\s*$/, "");
  // Remove any remaining standalone fence lines (e.g. ```ts, ```, ~~~py).
  out = out
    .split("\n")
    .filter((line) => !/^\s*(?:```|~~~)[\w+#.-]*\s*$/.test(line))
    .join("\n");
  return out.trim();
}

// Hard safety caps so a misbehaving model can't produce a snippet so wide/tall
// that the preview canvas blows past browser size limits and renders blank.
const MAX_CODE_LINES = 30;
const MAX_LINE_CHARS = 84;
// How many code blocks (= steps) we keep from a doc. A too-tall block is never
// dropped — clampCode truncates it to MAX_CODE_LINES with a trailing ellipsis.
const MAX_BLOCK_STEPS = 8;

/**
 * Some docs render code with a line-number gutter, which the conversion captures
 * as a leading run of lines "1", "2", "3", … before the code. Strip ONLY a
 * contiguous leading run of integers that count up from 1 (a gutter signature) —
 * this never touches a real numeric line elsewhere in the code.
 */
function stripLineNumberGutter(code: string): string {
  const lines = code.split("\n");
  let k = 0;
  while (k < lines.length && lines[k]!.trim() === String(k + 1)) k++;
  // Need at least two sequential numbers, and real code must follow.
  return k >= 2 && k < lines.length ? lines.slice(k).join("\n") : code;
}

/**
 * Some pages render code so that the conversion flattens it onto a single line
 * (e.g. "import a; import b; const x = new Y({ ... }); main();"). Re-flow such a
 * collapsed line into readable, indented multi-line code by breaking after `;`,
 * around block `{ … }` / array `[ … ]`, and on commas inside them. Short
 * `{ … }` (e.g. import specifiers) and all `( … )` stay inline. Idempotent:
 * code that already has several lines is returned unchanged.
 */
function reflowCollapsedCode(code: string): string {
  const rawLines = code.split("\n");
  const longest = rawLines.reduce((m, l) => Math.max(m, l.length), 0);
  if (rawLines.length > 3 || longest <= 80) return code;

  const src = code.replace(/[\t ]+/g, " ").replace(/\n/g, " ").trim();
  // Find the index of the brace/bracket matching the opener at position `i`.
  const matchClose = (i: number): number => {
    const open = src[i];
    const close = open === "{" ? "}" : "]";
    let depth = 1;
    let str: string | null = null;
    for (let j = i + 1; j < src.length; j++) {
      const cc = src[j];
      if (str) {
        if (cc === str && src[j - 1] !== "\\") str = null;
        continue;
      }
      if (cc === '"' || cc === "'" || cc === "`") str = cc;
      else if (cc === open) depth++;
      else if (cc === close && --depth === 0) return j;
    }
    return -1;
  };

  let out = "";
  let indent = 0;
  let str: string | null = null;
  const stack: string[] = []; // "{", "[", "(", or "i" for an inline bracket
  const nl = () => {
    out = out.replace(/ +$/, "");
    out += "\n" + "  ".repeat(Math.max(0, indent));
  };

  for (let i = 0; i < src.length; i++) {
    const c = src[i]!;
    const prev = src[i - 1];
    if (str) {
      out += c;
      if (c === str && prev !== "\\") str = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      str = c;
      out += c;
      continue;
    }
    if (c === "(") {
      stack.push("(");
      out += c;
      continue;
    }
    if (c === "{" || c === "[") {
      const close = matchClose(i);
      const inner = close > i ? src.slice(i + 1, close) : "";
      const inline = inner.length <= 40 && !inner.includes(";");
      if (inline) {
        stack.push("i");
        out += c;
      } else {
        stack.push(c);
        indent++;
        out += c;
        nl();
      }
      continue;
    }
    if (c === ")" || c === "}" || c === "]") {
      const top = stack.pop();
      if ((c === "}" || c === "]") && top !== "i") {
        indent = Math.max(0, indent - 1);
        nl();
      }
      out += c;
      continue;
    }
    if (c === ";") {
      out += ";";
      nl();
      continue;
    }
    if (c === ",") {
      out += ",";
      const top = stack[stack.length - 1];
      if (top === "{" || top === "[") nl();
      else out += " ";
      continue;
    }
    if (c === " " && /(\n *| )$/.test(out)) continue; // squeeze repeated spaces
    out += c;
  }

  return out
    .split("\n")
    .map((l) => l.replace(/\s+$/, ""))
    .filter((l) => l.trim().length > 0)
    .join("\n");
}

/**
 * Bound code to a slide-sized snippet: re-flow collapsed one-liners, normalize
 * tabs, cap line count and truncate any line that is far too wide (keeps the
 * canvas dimensions sane).
 */
function clampCode(code: string): string {
  const cleaned = stripLineNumberGutter(stripCodeFences(code).replace(/\t/g, "  "));
  const reflowed = reflowCollapsedCode(cleaned);
  const lines = reflowed.split("\n");
  const truncated = lines.length > MAX_CODE_LINES;
  const clamped = lines.slice(0, MAX_CODE_LINES).map((line) =>
    line.length > MAX_LINE_CHARS ? `${line.slice(0, MAX_LINE_CHARS - 1)}…` : line,
  );
  // Drop a trailing run of blank lines so the card isn't padded with empty space.
  while (clamped.length > 1 && clamped[clamped.length - 1]!.trim() === "") clamped.pop();
  // Mark a vertically-truncated block with an ellipsis line (indented to match
  // the last kept line) so it reads as "more code below" rather than a hard cut.
  if (truncated) {
    const indent = clamped[clamped.length - 1]!.match(/^\s*/)?.[0] ?? "";
    clamped.push(`${indent}...`);
  }
  return clamped.join("\n");
}

function asString(v: unknown): string {
  return typeof v === "string" ? v : "";
}

/**
 * Validate + normalize raw model output into a Lesson.
 * Clamps step counts and strips fences. Throws if unusable.
 */
export function validateLesson(raw: unknown, fallbackLanguage: string): Lesson {
  const obj = (typeof raw === "object" && raw !== null ? raw : {}) as Record<string, unknown>;

  const rawSteps = Array.isArray(obj.steps) ? obj.steps : [];
  const steps = rawSteps
    .map((s) => {
      const o = (s ?? {}) as Record<string, unknown>;
      return {
        code: clampCode(asString(o.code)),
        explanation: asString(o.explanation).trim(),
        narration: asString(o.narration).trim(),
      };
    })
    .filter((s) => s.code.length > 0 && s.narration.length > 0)
    .slice(0, 6);

  if (steps.length < 1) {
    throw new Error("AI returned no usable steps");
  }

  const rawImps = Array.isArray(obj.improvements) ? obj.improvements : [];
  const improvements = rawImps
    .map((s) => {
      const o = (s ?? {}) as Record<string, unknown>;
      return {
        title: asString(o.title).trim() || "Improvement",
        code: clampCode(asString(o.code)),
        narration: asString(o.narration).trim(),
      };
    })
    .filter((s) => s.code.length > 0 && s.narration.length > 0)
    .slice(0, 4);

  const language = (asString(obj.language).trim() || fallbackLanguage || "tsx").toLowerCase();
  const title = asString(obj.title).trim() || "AI Lesson";
  const hook =
    asString(obj.hook).trim() || `Let's learn ${title}. Here's how it works, step by step.`;

  return { title, language, hook, steps, improvements };
}

/**
 * Flatten a lesson into ordered narration segments: intro (hook) first, then one per code
 * step (steps then improvements). The `index` aligns each segment with the flattened code
 * step list the editor builds (steps ++ improvements).
 */
export function buildNarrationSegments(
  lesson: Lesson,
): { kind: "intro" | "step"; index: number; text: string }[] {
  const segments: { kind: "intro" | "step"; index: number; text: string }[] = [
    { kind: "intro", index: -1, text: lesson.hook },
  ];
  let codeIndex = 0;
  lesson.steps.forEach((s) => {
    segments.push({ kind: "step", index: codeIndex++, text: s.narration });
  });
  lesson.improvements.forEach((s) => {
    segments.push({ kind: "step", index: codeIndex++, text: `${s.title}. ${s.narration}` });
  });
  return segments;
}

export type AiEnv = {
  AI: Ai;
  AI_MODEL: string;
};

// ---------- code-block extraction (doc -> steps) ----------

const PREFERRED_LANGS = new Set([
  "tsx", "ts", "jsx", "js", "python", "go", "rust", "java",
  "c", "cpp", "csharp", "php", "ruby", "swift", "kotlin",
]);

/** Map fenced-block info strings to a highlight id we support. */
function normalizeLang(lang: string): string {
  const l = lang.toLowerCase().trim().split(/[\s,]/)[0] ?? "";
  const map: Record<string, string> = {
    typescript: "ts", javascript: "js",
    shell: "bash", sh: "bash", console: "bash", terminal: "bash", curl: "bash", zsh: "bash",
    py: "python", golang: "go", rs: "rust", yml: "yaml",
  };
  return map[l] ?? l;
}

/** Pull ```lang ... ``` fenced code blocks out of Markdown, in document order. */
export function extractCodeBlocks(markdown: string): { lang: string; code: string }[] {
  const blocks: { lang: string; code: string }[] = [];
  // Capture the language token, then allow any remaining info-string text on the
  // opening line (e.g. ```js title=".env") before the newline. Without this, a
  // fence with attributes fails to match and the regex mis-pairs the following
  // closing/opening fences, capturing prose as a "code block".
  const re = /```([\w+#.-]*)[^\n]*\r?\n([\s\S]*?)```/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(markdown)) !== null) {
    const lang = normalizeLang(m[1] ?? "");
    // Drop any line-number gutter, then re-flow collapsed one-liners so block
    // sizing/selection sees real lines.
    const code = reflowCollapsedCode(stripLineNumberGutter((m[2] ?? "").replace(/\s+$/, "")));
    if (code.trim().length > 1) blocks.push({ lang, code });
  }
  return blocks;
}

/**
 * Choose which blocks become steps: prefer a single programming language so the
 * highlighting stays consistent, keep reasonably-sized blocks, cap the count.
 */
export function selectBlocks(
  blocks: { lang: string; code: string }[],
): { lang: string; blocks: { lang: string; code: string }[] } {
  if (blocks.length === 0) return { lang: "tsx", blocks: [] };

  const counts = new Map<string, number>();
  for (const b of blocks) if (b.lang) counts.set(b.lang, (counts.get(b.lang) ?? 0) + 1);

  let chosen = "";
  let best = -Infinity;
  for (const [lang, c] of counts) {
    const score = c + (PREFERRED_LANGS.has(lang) ? 100 : 0);
    if (score > best) {
      best = score;
      chosen = lang;
    }
  }

  // Keep blocks in the chosen language (plus untagged ones); fall back to all.
  let kept = blocks.filter((b) => b.lang === chosen || b.lang === "");
  if (kept.length < 2) kept = blocks.slice();

  // We never drop a block just for being tall: a too-long block is truncated
  // with an ellipsis by clampCode so the substantive example always survives.
  return { lang: chosen || "tsx", blocks: kept.slice(0, MAX_BLOCK_STEPS) };
}

const NARRATION_SYSTEM = `You are an expert programming teacher narrating a short code tutorial video.
You are given REAL code blocks (taken verbatim from documentation) in order. Do NOT write or change
any code — only describe it. Teach at an unhurried, patient pace, like a friendly instructor walking
the viewer through each block. For each block produce:
- "explanation": a short on-screen label (a few words).
- "narration": 3-4 sentences (about 55-80 words) of natural spoken English. Walk through the block
  properly: what it does overall, then the important line(s) or parts one by one and why they matter,
  and how it connects to the previous block. Don't be terse — give the viewer time to follow along.
  No code, no symbols read literally, no markdown.
Also produce a "title" and an intro "hook" (2-3 sentences) saying what the topic is, why it matters,
and that we'll go through it step by step.`;

const NARRATION_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    hook: { type: "string" },
    steps: {
      type: "array",
      items: {
        type: "object",
        properties: {
          explanation: { type: "string" },
          narration: { type: "string" },
        },
        required: ["explanation", "narration"],
      },
    },
  },
  required: ["title", "hook", "steps"],
} as const;

/**
 * Walk a (possibly truncated/garbled) JSON string and return a balanced version:
 * any open string is closed, a dangling trailing comma is dropped, and every
 * still-open `{`/`[` is closed in the right order. Lets us salvage the valid
 * prefix when a small model appends junk or cuts off mid-array.
 */
function balanceJson(s: string): string {
  const stack: string[] = [];
  let inStr = false;
  let esc = false;
  let out = "";
  for (const c of s) {
    out += c;
    if (inStr) {
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') inStr = true;
    else if (c === "{") stack.push("}");
    else if (c === "[") stack.push("]");
    else if (c === "}" || c === "]") stack.pop();
  }
  if (inStr) out += '"';
  out = out.replace(/[,\s]+$/, ""); // drop a dangling comma/whitespace
  while (stack.length) out += stack.pop();
  return out;
}

/** Best-effort JSON parse for small-model output that isn't always strict JSON. */
function parseLenient(text: string): unknown {
  let t = text
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  const start = t.indexOf("{");
  if (start > 0) t = t.slice(start);

  try {
    return JSON.parse(t);
  } catch {
    /* keep trying */
  }

  // Remove trailing commas before a closing brace/bracket.
  const noTrailing = t.replace(/,(\s*[}\]])/g, "$1");
  try {
    return JSON.parse(noTrailing);
  } catch {
    /* keep trying */
  }

  // Salvage the valid prefix up to the reported error position, then balance.
  try {
    JSON.parse(t);
  } catch (e) {
    const pos = /position (\d+)/.exec(String((e as Error)?.message));
    const sliced = pos ? t.slice(0, Number(pos[1])) : t;
    try {
      return JSON.parse(balanceJson(sliced));
    } catch {
      /* fall through */
    }
  }

  // Last resort: balance the whole thing.
  return JSON.parse(balanceJson(t));
}

/** Run Workers AI with a JSON schema and return the parsed object payload. */
async function runJson(env: AiEnv, system: string, user: string, schema: unknown): Promise<unknown> {
  const result = (await env.AI.run(env.AI_MODEL as keyof AiModels, {
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    response_format: { type: "json_schema", json_schema: schema },
    max_tokens: 4096,
  } as never)) as { response?: unknown };

  const payload: unknown = result?.response ?? result;
  if (typeof payload === "string") {
    return parseLenient(payload);
  }
  return payload;
}

/**
 * Build a lesson whose code comes straight from the doc's fenced code blocks
 * (one step per block) — the model only writes the title, hook, and per-step
 * narration. This keeps the code real and correctly formatted instead of asking
 * a small model to (re)write code, which it tends to mangle.
 */
async function generateLessonFromBlocks(
  env: AiEnv,
  params: { prompt: string; sourceUrl?: string },
  selected: { lang: string; blocks: { lang: string; code: string }[] },
): Promise<LessonDraft> {
  const blocks = selected.blocks;
  const blockList = blocks
    .map((b, i) => `Block ${i + 1} [${b.lang || "code"}]:\n${b.code}`)
    .join("\n\n");

  const userPrompt =
    `Narrate these ${blocks.length} real documentation code blocks, in order.\n` +
    (params.prompt ? `Focus on: ${params.prompt}\n` : "") +
    (params.sourceUrl ? `Source: ${params.sourceUrl}\n` : "") +
    `Return JSON { title, hook, steps:[{explanation, narration}, ...] } with EXACTLY ${blocks.length} ` +
    `steps — one per block, in the same order. Do NOT include any code.\n\n` +
    `CODE BLOCKS:\n${blockList}`;

  const payload = (await runJson(env, NARRATION_SYSTEM, userPrompt, NARRATION_SCHEMA)) as {
    title?: unknown;
    hook?: unknown;
    steps?: unknown;
  };

  const narr = Array.isArray(payload.steps) ? payload.steps : [];
  const steps = blocks.map((b, i) => {
    const o = (narr[i] ?? {}) as Record<string, unknown>;
    return {
      code: clampCode(b.code),
      explanation: asString(o.explanation).trim() || `Step ${i + 1}`,
      narration:
        asString(o.narration).trim() || "Here we look at the next part of the code and what it does.",
    };
  });

  const title = asString(payload.title).trim() || "Tutorial";
  const hook =
    asString(payload.hook).trim() || `Let's walk through ${title}, step by step.`;

  return { title, language: selected.lang, hook, steps, improvements: [] };
}

/**
 * Generate the raw lesson draft. When documentation with real code blocks is
 * supplied, build the steps from those blocks (narration-only model call);
 * otherwise ask the model to author the lesson from the prompt/source.
 */
export async function generateLessonDraft(
  env: AiEnv,
  params: { prompt: string; language?: string; source?: string; sourceUrl?: string },
): Promise<LessonDraft> {
  const source = params.source?.trim();

  if (source) {
    const selected = selectBlocks(extractCodeBlocks(source));
    if (selected.blocks.length >= 2) {
      return generateLessonFromBlocks(env, params, selected);
    }
  }

  const userPrompt = source
    ? // Doc with too few code blocks: let the model author from the docs as context.
      `Create a tutorial lesson that teaches the core concept(s) from the documentation below. ` +
      `Build it around the REAL code examples in the docs and obey the CODE RULES.\n` +
      (params.prompt ? `Focus on: ${params.prompt}\n` : "") +
      (params.sourceUrl ? `Source URL: ${params.sourceUrl}\n` : "") +
      (params.language ? `Preferred language: ${params.language}\n` : "") +
      // Trim only what we hand the model (the full markdown is kept for the Docs view).
      `\nDOCUMENTATION (Markdown, may be truncated):\n"""\n${source.slice(0, 12_000)}\n"""\n\n` +
      `Return only the JSON lesson.`
    : `Learner prompt: ${params.prompt}\n` +
      (params.language ? `Preferred language: ${params.language}\n` : "") +
      `Return only the JSON lesson.`;

  const payload = await runJson(env, SYSTEM_PROMPT, userPrompt, RESPONSE_SCHEMA);
  return validateLesson(payload, params.language ?? "tsx");
}

// ---------- docs "gist" (separate from the audio/narration pipeline) ----------

const DOCS_GIST_SYSTEM = `You write a concise outline of documentation code examples.
You are given code blocks (verbatim from docs) in order. For EACH block produce a short "title"
(a few words) and a "summary" (ONE clear sentence describing what the block does and why). Do not
include any code, markdown, or symbols read literally.`;

const DOCS_GIST_SCHEMA = {
  type: "object",
  properties: {
    blocks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          summary: { type: "string" },
        },
        required: ["title", "summary"],
      },
    },
  },
  required: ["blocks"],
} as const;

/**
 * Build the docs "gist": the source's code blocks, each with an AI-generated
 * title + one-sentence summary. This is a SEPARATE model call from the lesson /
 * narration pipeline — it does not touch audio generation. Returns null when the
 * page has no usable code blocks.
 */
export async function generateDocsBlocks(env: AiEnv, source: string): Promise<DocsBlock[] | null> {
  const selected = selectBlocks(extractCodeBlocks(source));
  if (selected.blocks.length === 0) return null;
  const blocks = selected.blocks;

  const list = blocks
    .map((b, i) => `Block ${i + 1} [${b.lang || "code"}]:\n${b.code}`)
    .join("\n\n");
  const user =
    `Summarize these ${blocks.length} documentation code blocks, in order.\n` +
    `Return JSON { blocks:[{title, summary}, ...] } with EXACTLY ${blocks.length} entries — one ` +
    `per block, same order. No code.\n\nCODE BLOCKS:\n${list}`;

  let arr: unknown[] = [];
  try {
    const payload = (await runJson(env, DOCS_GIST_SYSTEM, user, DOCS_GIST_SCHEMA)) as {
      blocks?: unknown;
    };
    if (Array.isArray(payload.blocks)) arr = payload.blocks;
  } catch {
    // Fall back to code-only blocks if the summary call fails.
  }

  return blocks.map((b, i) => {
    const o = (arr[i] ?? {}) as Record<string, unknown>;
    return {
      lang: b.lang || selected.lang,
      code: clampCode(b.code),
      title: asString(o.title).trim() || `Example ${i + 1}`,
      summary: asString(o.summary).trim() || "A code example from the documentation.",
    };
  });
}
