import { describe, expect, test } from "bun:test";
import { buildNarrationSegments, extractCodeBlocks, selectBlocks, validateLesson } from "./ai";

describe("selectBlocks", () => {
  test("keeps the substantive block instead of only trivial one-liners", () => {
    // Mirrors a real doc page: install command, the main example, run command.
    const example = Array.from({ length: 29 }, (_, i) => `line_${i + 1}()`).join("\n");
    const { blocks } = selectBlocks([
      { lang: "python", code: "pip install elevenlabs\npip install python-dotenv" },
      { lang: "python", code: example },
      { lang: "python", code: "python example.py" },
    ]);
    // The 29-line example must survive selection, not be dropped for the one-liners.
    expect(blocks.some((b) => b.code === example)).toBe(true);
  });
});

describe("extractCodeBlocks", () => {
  test("handles fences with info-string attributes without mis-pairing", () => {
    const md = [
      'Intro prose.',
      '',
      '```js title=".env"',
      "API_KEY=abc",
      '```',
      '',
      "We'll also use the `dotenv` library to load our key.",
      '',
      '```python title="example.py"',
      "import os",
      '```',
      '',
      "You should hear the music playing.",
    ].join("\n");

    const blocks = extractCodeBlocks(md);
    expect(blocks).toHaveLength(2);
    expect(blocks[0]).toMatchObject({ lang: "js", code: "API_KEY=abc" });
    expect(blocks[1]).toMatchObject({ lang: "python", code: "import os" });
    // The prose between fences must never be captured as code.
    expect(blocks.some((b) => b.code.includes("dotenv"))).toBe(false);
  });
});

describe("validateLesson", () => {
  test("normalizes valid output and strips code fences", () => {
    const raw = {
      title: "useState basics",
      language: "TSX",
      steps: [
        {
          code: "```tsx\nconst [n, setN] = useState(0);\n```",
          explanation: "Declare state",
          narration: "We start by declaring a state variable.",
        },
      ],
      improvements: [
        { title: "Lazy init", code: "useState(() => compute())", narration: "Use a lazy initializer." },
      ],
    };
    const lesson = validateLesson(raw, "tsx");
    expect(lesson.language).toBe("tsx");
    expect(lesson.steps).toHaveLength(1);
    expect(lesson.steps[0]!.code).toBe("const [n, setN] = useState(0);");
    expect(lesson.improvements).toHaveLength(1);
  });

  test("drops steps missing code or narration", () => {
    const lesson = validateLesson(
      {
        title: "x",
        language: "js",
        steps: [
          { code: "a()", explanation: "", narration: "good" },
          { code: "", explanation: "", narration: "no code" },
          { code: "b()", explanation: "", narration: "" },
        ],
        improvements: [],
      },
      "js",
    );
    expect(lesson.steps).toHaveLength(1);
  });

  test("truncates an over-long code block with a trailing ellipsis", () => {
    const longCode = Array.from({ length: 60 }, (_, i) => `line_${i + 1}()`).join("\n");
    const lesson = validateLesson(
      { title: "x", language: "js", steps: [{ code: longCode, explanation: "", narration: "y" }] },
      "js",
    );
    const lines = lesson.steps[0]!.code.split("\n");
    expect(lines.length).toBeLessThan(60);
    expect(lines.at(-1)).toBe("...");
  });

  test("throws when there are no usable steps", () => {
    expect(() => validateLesson({ steps: [] }, "tsx")).toThrow();
  });

  test("falls back to provided language and a default title", () => {
    const lesson = validateLesson(
      { steps: [{ code: "x", explanation: "", narration: "y" }] },
      "python",
    );
    expect(lesson.language).toBe("python");
    expect(lesson.title.length).toBeGreaterThan(0);
  });
});

describe("buildNarrationSegments", () => {
  test("emits intro first, then one aligned segment per code step", () => {
    const segments = buildNarrationSegments({
      title: "Lesson",
      language: "tsx",
      hook: "Here is the crux.",
      steps: [
        { code: "a", explanation: "", narration: "First point." },
        { code: "b", explanation: "", narration: "Second point." },
      ],
      improvements: [{ title: "Tip", code: "c", narration: "Improve it." }],
    });

    expect(segments).toHaveLength(4);
    expect(segments[0]).toMatchObject({ kind: "intro", index: -1, text: "Here is the crux." });
    expect(segments[1]).toMatchObject({ kind: "step", index: 0, text: "First point." });
    expect(segments[2]).toMatchObject({ kind: "step", index: 1, text: "Second point." });
    // Improvements continue the flattened code-step index and prefix their title.
    expect(segments[3]).toMatchObject({ kind: "step", index: 2 });
    expect(segments[3]!.text).toContain("Improve it.");
  });
});
