import { describe, expect, test } from "bun:test";
import { buildNarrationSegments, validateLesson } from "./ai";

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
