import { Link2, MessageSquare, FileText, ListChecks } from "lucide-react";
import { GitHubIcon } from "./ui/icons";

const LIME = "#CBFF2E";
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

export function FlowSection() {
  return (
    <section className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 max-w-7xl">
      {/* Eyebrow */}
      <div className="text-center">
        <p className="text-sm font-medium text-muted-foreground">
          <span className="text-muted-foreground/60">1.</span> The flow
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
        From documentation,
        <br />
        to real understanding.
      </h2>

      {/* Cards */}
      <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* ---------- Card 01: Source ---------- */}
        <article className="rounded-[2rem] border border-border/60 bg-card p-7 sm:p-9 shadow-sm">
          <p className="text-sm font-medium tracking-wide">
            <span className="text-muted-foreground/60">01</span>
            <span className="ml-3 text-muted-foreground">Source</span>
          </p>

          <h3 className="mt-5 font-serif text-2xl sm:text-3xl leading-snug text-foreground">
            First,{" "}
            <Pill icon={<Link2 className="w-5 h-5" />}>connect</Pill> your docs
            so the lesson can read your stack.
          </h3>

          <DemoSurface>
            {/* floating chips */}
            <div className="absolute -top-2 right-0 z-20 grid place-items-center w-12 h-12 rounded-2xl bg-card border border-border/60 shadow-md">
              <FileText className="w-5 h-5 text-foreground/80" />
            </div>
            <div className="absolute bottom-2 -left-2 z-20 grid place-items-center w-12 h-12 rounded-2xl bg-card border border-border/60 shadow-md">
              <GitHubIcon className="w-5 h-5 text-foreground/80" />
            </div>

            {/* source file card */}
            <div className="relative z-10 mx-auto max-w-sm rounded-2xl bg-card border border-border/60 shadow-lg overflow-hidden">
              {/* gradient banner */}
              <div
                className="h-20"
                style={{
                  background: `linear-gradient(90deg, ${GREEN}, ${LIME})`,
                }}
              />
              <div className="px-5 pb-5">
                <div className="-mt-8 mb-3 grid place-items-center w-16 h-16 rounded-2xl bg-card border-4 border-card shadow-sm">
                  <FileText className="w-7 h-7" style={{ color: GREEN }} />
                </div>
                <h4 className="text-lg font-semibold text-foreground">
                  React Hooks.md
                </h4>
                <p className="text-sm text-muted-foreground">
                  Official docs · 240 pages
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span
                    className="rounded-full px-3 py-1 text-xs font-medium"
                    style={{ backgroundColor: "rgba(0,122,85,0.14)", color: GREEN }}
                  >
                    Hooks
                  </span>
                  <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                    useState
                  </span>
                  <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                    Effects
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 border-t border-border/60 px-5 py-3 text-sm text-muted-foreground">
                <ListChecks className="w-4 h-4" />
                Reading your docs…
              </div>
            </div>
          </DemoSurface>
        </article>

        {/* ---------- Card 02: Lesson ---------- */}
        <article className="rounded-[2rem] border border-border/60 bg-card p-7 sm:p-9 shadow-sm">
          <p className="text-sm font-medium tracking-wide">
            <span className="text-muted-foreground/60">02</span>
            <span className="ml-3 text-muted-foreground">Lesson</span>
          </p>

          <h3 className="mt-5 font-serif text-2xl sm:text-3xl leading-snug text-foreground">
            Then it{" "}
            <Pill icon={<MessageSquare className="w-5 h-5" />}>explains</Pill>{" "}
            every concept until it finally clicks.
          </h3>

          <DemoSurface>
            <div className="relative z-10 mx-auto max-w-md rounded-2xl bg-card border border-border/60 shadow-lg p-5">
              {/* agent header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className="w-8 h-8 rounded-full"
                    style={{
                      background: `conic-gradient(from 180deg, ${LIME}, ${GREEN}, #0ea5e9, ${LIME})`,
                    }}
                  />
                  <div className="leading-tight">
                    <p className="text-sm font-semibold text-foreground">Tutora</p>
                    <p className="text-xs text-muted-foreground">
                      Your AI tutor · just now
                    </p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">9:42 AM</span>
              </div>

              {/* messages */}
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-end gap-2">
                  <span
                    className="w-6 h-6 shrink-0 rounded-full"
                    style={{
                      background: `conic-gradient(from 180deg, ${LIME}, ${GREEN}, #0ea5e9, ${LIME})`,
                    }}
                  />
                  <p
                    className="rounded-2xl px-4 py-2"
                    style={{ backgroundColor: "rgba(0,122,85,0.12)", color: "inherit" }}
                  >
                    Quick check — why does <code>await</code> pause a function?
                  </p>
                </div>
                <div className="flex justify-end">
                  <p
                    className="rounded-2xl px-4 py-2 text-white max-w-[80%]"
                    style={{ backgroundColor: GREEN }}
                  >
                    Because it waits for the promise to resolve before moving on.
                  </p>
                </div>
                <div className="flex items-end gap-2">
                  <span
                    className="w-6 h-6 shrink-0 rounded-full"
                    style={{
                      background: `conic-gradient(from 180deg, ${LIME}, ${GREEN}, #0ea5e9, ${LIME})`,
                    }}
                  />
                  <p
                    className="rounded-2xl px-4 py-2"
                    style={{ backgroundColor: "rgba(0,122,85,0.12)" }}
                  >
                    Exactly. Now let's see it run line by line.
                  </p>
                </div>
              </div>
            </div>
          </DemoSurface>
        </article>
      </div>
    </section>
  );
}
