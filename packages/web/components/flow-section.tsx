import { Link2, Film, AudioLines, Download } from "lucide-react";
import { SourceDemo } from "./source-demo";
import { LessonDemo } from "./lesson-demo";
import { VoiceDemo } from "./voice-demo";
import { ExportDemo } from "./export-demo";

const GREEN = "#007A55";

/* A pill that highlights a word inside the serif headline. */
function Pill({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span
      className="inline-flex items-center gap-2 align-middle rounded-2xl px-3 py-1"
      style={{ backgroundColor: "rgba(0,122,85,0.14)", color: GREEN }}
    >
      <span className="opacity-80">{icon}</span>
      {children}
    </span>
  );
}

/* Dotted-grid demo surface used inside each card. */
function DemoSurface({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative mt-8 rounded-3xl border border-border/60 p-6 sm:p-8 overflow-hidden"
      style={{
        backgroundImage:
          "radial-gradient(circle at center, var(--color-border) 1px, transparent 1px)",
        backgroundSize: "16px 16px",
      }}
    >
      {/* soft green wash */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, transparent 40%, rgba(0,122,85,0.08))",
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

/* Small card header: step number + label. */
function Step({ n, label }: { n: string; label: string }) {
  return (
    <p className="text-sm font-medium tracking-wide">
      <span className="text-muted-foreground/60">{n}</span>
      <span className="ml-3 text-muted-foreground">{label}</span>
    </p>
  );
}

export function FlowSection() {
  return (
    <section className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 max-w-7xl">
      {/* Eyebrow */}
      <div className="text-center">
        <p className="text-sm font-medium text-muted-foreground">
           How it works
        </p>
        <svg
          aria-hidden="true"
          viewBox="0 0 80 8"
          className="mx-auto mt-2 h-2 w-16"
          style={{ color: GREEN }}
          preserveAspectRatio="none"
        >
          <path
            d="M1 4 Q 6 0, 11 4 T 21 4 T 31 4 T 41 4 T 51 4 T 61 4 T 71 4 T 79 4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Heading */}
      <h2 className="mt-6 text-center font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-foreground">
        From a link to a lesson,
        <br />
        in four steps.
      </h2>

      {/* Cards */}
      <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* ---------- Card 01: Source ---------- */}
        <article
          className="rounded-[2rem] border border-border/60 bg-card p-7 sm:p-9 shadow-sm"
          style={{
            backgroundImage:
              "linear-gradient(135deg, rgba(0,122,85,0.12), rgba(203,255,46,0.06) 45%, transparent 70%)",
          }}
        >
          <Step n="01" label="Source" />
          <h3 className="mt-5 font-serif text-2xl sm:text-3xl leading-snug text-foreground">
            Just <Pill icon={<Link2 className="w-5 h-5" />}>paste</Pill> a documentation
            link and click generate.
          </h3>

          <DemoSurface>
            <SourceDemo />
          </DemoSurface>
        </article>

        {/* ---------- Card 02: Lesson (the player) ---------- */}
        <article
          className="rounded-[2rem] border border-border/60 bg-card p-7 sm:p-9 shadow-sm"
          style={{
            backgroundImage:
              "linear-gradient(135deg, rgba(0,122,85,0.12), rgba(203,255,46,0.06) 45%, transparent 70%)",
          }}
        >
          <Step n="02" label="Lesson" />
          <h3 className="mt-5 font-serif text-2xl sm:text-3xl leading-snug text-foreground">
            It <Pill icon={<Film className="w-5 h-5" />}>creates</Pill> a narrated
            video with code on the left, visuals on the right.
          </h3>

          <DemoSurface>
            <LessonDemo />
          </DemoSurface>
        </article>

        {/* ---------- Card 03: Voice ---------- */}
        <article
          className="rounded-[2rem] border border-border/60 bg-card p-7 sm:p-9 shadow-sm"
          style={{
            backgroundImage:
              "linear-gradient(135deg, rgba(0,122,85,0.12), rgba(203,255,46,0.06) 45%, transparent 70%)",
          }}
        >
          <Step n="03" label="Voice" />
          <h3 className="mt-5 font-serif text-2xl sm:text-3xl leading-snug text-foreground">
            You can pick the{" "}
            <Pill icon={<AudioLines className="w-5 h-5" />}>voice</Pill> that
            narrates your coding lesson.
          </h3>

          <DemoSurface>
            <VoiceDemo />
          </DemoSurface>
        </article>

        {/* ---------- Card 04: Export & share ---------- */}
        <article className="rounded-[2rem] border border-border/60 bg-card p-7 sm:p-9 shadow-sm">
          <Step n="04" label="Share" />
          <h3 className="mt-5 font-serif text-2xl sm:text-3xl leading-snug text-foreground">
            You can<Pill icon={<Download className="w-5 h-5" />}>export</Pill> a
            polished MP4 or share the lesson anywhere from link.
          </h3>

          <DemoSurface>
            <ExportDemo />
          </DemoSurface>
        </article>
      </div>
    </section>
  );
}
