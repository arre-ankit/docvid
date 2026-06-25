import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Play,
  Sparkles,
  Code2,
  Crosshair,
  GraduationCap,
  Star,
  FileText,
  Clock,
  ListChecks,
  Maximize2,
} from "lucide-react";
import { GitHubIcon, TwitterIcon } from "@/components/ui/icons";
import { Footer } from "@/components/footer";
import { FlowSection } from "@/components/flow-section";
import { TechStackPile } from "@/components/tech-stack-pile";

// Brand palette — lime is the accent, deep green is the secondary.
const LIME = "#CBFF2E";
const GREEN = "#007A55";

export default function Page() {
  return (
    <div className="relative w-full min-h-screen flex flex-col bg-background overflow-hidden">
      {/* Subtle green/lime ambient glow behind the hero */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-60"
        style={{
          background:
            "radial-gradient(60% 60% at 75% 15%, rgba(203,255,46,0.08), transparent 70%), radial-gradient(50% 50% at 10% 30%, rgba(0,122,85,0.12), transparent 70%)",
        }}
      />

      <div className="relative z-10 flex-1 flex flex-col">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            {/* ---------- Left: headline + social proof ---------- */}
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.02]">
                Docs in.
                <br />
                Knowledge out.
                <br />
                In{" "}
                <span className="relative inline-block" style={{ color: LIME }}>
                  video
                  {/* hand-drawn underline scribble */}
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 220 24"
                    className="absolute left-0 -bottom-3 w-full h-3"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M4 14 C 60 4, 150 22, 216 8"
                      fill="none"
                      stroke={LIME}
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>{" "}
                form.
              </h1>

              <p className="text-lg sm:text-xl text-muted-foreground max-w-md leading-relaxed">
                AI-powered coding education that clicks.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link href="/teach">
                  <Button
                    className="h-13 px-7 text-base rounded-xl font-semibold text-black shadow-lg transition-transform hover:scale-[1.02] hover:brightness-105"
                    style={{ backgroundColor: LIME }}
                  >
                    Get started free
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/teach">
                  <Button
                    variant="outline"
                    className="h-13 px-7 text-base rounded-xl font-semibold border-border/60 bg-transparent hover:bg-muted/40"
                  >
                    See how it works
                    <span className="ml-1 inline-flex items-center justify-center w-6 h-6 rounded-full border border-current">
                      <Play className="w-3 h-3 fill-current" />
                    </span>
                  </Button>
                </Link>
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-4 pt-2">
                <div className="flex -space-x-3">
                  {AVATARS.map((gradient, i) => (
                    <span
                      key={i}
                      className="w-10 h-10 rounded-full border-2 border-background"
                      style={{ background: gradient }}
                    />
                  ))}
                  <span className="w-10 h-10 rounded-full border-2 border-background bg-muted text-foreground text-xs font-semibold flex items-center justify-center">
                    +8k
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex" style={{ color: LIME }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Loved by 8,000+ developers
                  </p>
                </div>
              </div>
            </div>

            {/* ---------- Right: code player + feature tiles ---------- */}
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-backwards">
              <CodePlayer />

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <FeatureTile
                  icon={<Sparkles className="w-5 h-5" />}
                  title="Bite-sized videos"
                  description="Short, focused, and practical."
                />
                <FeatureTile
                  icon={<Code2 className="w-5 h-5" />}
                  title="Real code"
                  description="Examples you can run and learn."
                />
                <FeatureTile
                  icon={<Crosshair className="w-5 h-5" />}
                  title="Built for developers"
                  description="From basics to advanced topics."
                />
                <FeatureTile
                  icon={<GraduationCap className="w-5 h-5" />}
                  title="Learn by doing"
                  description="Watch, run, edit, and master."
                />
              </div>
            </div>
          </div>

          {/* ---------- Trusted by ---------- */}
          <div className="mt-16 sm:mt-20 text-center animate-in fade-in duration-700 delay-300 fill-mode-backwards">
            <p className="text-sm text-muted-foreground mb-6">
              Trusted by developers at
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5 text-muted-foreground/70 font-semibold text-lg">
              <span className="flex items-center gap-2">▲ Vercel</span>
              <span className="flex items-center gap-2">
                <GitHubIcon className="w-5 h-5" /> GitHub
              </span>
              <span>Google</span>
              <span className="flex items-center gap-2">▦ Microsoft</span>
              <span className="lowercase">stripe</span>
            </div>
          </div>
        </section>

        <FlowSection />
        <TechStackPile />
      </div>

      <Footer />
    </div>
  );
}

/* Gradient "avatars" — keeps the social-proof stack image-free. */
const AVATARS = [
  `linear-gradient(135deg,${LIME},${GREEN})`,
  `linear-gradient(135deg,${GREEN},#0ea5e9)`,
  `linear-gradient(135deg,#f59e0b,${LIME})`,
  `linear-gradient(135deg,#8b5cf6,${GREEN})`,
];

/* The hero "code player" card — a static mock of a lesson video. */
function CodePlayer() {
  return (
    <div className="relative rounded-2xl border border-border/60 bg-[#0c1108]/90 dark:bg-[#0c1108]/90 backdrop-blur-sm shadow-2xl p-4 sm:p-5">
      {/* Lesson header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3">
          <div
            className="mt-0.5 p-2 rounded-lg"
            style={{ backgroundColor: "rgba(203,255,46,0.12)", color: LIME }}
          >
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-white leading-snug">
              Understanding
              <br />
              Async/Await in JavaScript
            </h3>
            <div className="flex items-center gap-4 mt-1.5 text-xs text-white/50">
              <span className="flex items-center gap-1">
                <ListChecks className="w-3.5 h-3.5" /> 12 Steps
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> 8:45 min
              </span>
            </div>
          </div>
        </div>
        {/* decorative dot grid */}
        <div className="grid grid-cols-5 gap-1 shrink-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <span
              key={i}
              className="w-1 h-1 rounded-full"
              style={{ backgroundColor: "rgba(203,255,46,0.45)" }}
            />
          ))}
        </div>
      </div>

      {/* Code surface */}
      <div className="relative rounded-xl border border-white/10 bg-black/60 p-4 font-mono text-[13px] leading-6 overflow-hidden">
        <div className="flex items-center gap-1.5 mb-3">
          <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
          <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
        </div>

        <CodeLines />

        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            aria-label="Play lesson"
            className="w-16 h-16 rounded-full bg-white/95 shadow-xl flex items-center justify-center transition-transform hover:scale-105"
          >
            <Play className="w-6 h-6 ml-0.5 fill-black text-black" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: "42%", backgroundColor: LIME }}
        />
      </div>

      {/* Controls */}
      <div className="mt-2.5 flex items-center justify-between text-white/60 text-xs">
        <div className="flex items-center gap-3">
          <Play className="w-4 h-4 fill-current" />
          <span className="tabular-nums">03:42 / 08:45</span>
        </div>
        <div className="flex items-center gap-3">
          <span>1x</span>
          <Maximize2 className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}

/* Syntax-highlighted code lines (static). */
function CodeLines() {
  const kw = { color: "#7dd3fc" }; // keywords
  const fn = { color: "#fbbf24" }; // function names
  const str = { color: "#86efac" }; // strings
  const punc = { color: "#94a3b8" };
  const plain = { color: "#e2e8f0" };

  const lines: React.ReactNode[] = [
    <>
      <span style={kw}>async function </span>
      <span style={fn}>fetchData</span>
      <span style={punc}>() {"{"}</span>
    </>,
    <>
      {"  "}
      <span style={kw}>const </span>
      <span style={plain}>response = </span>
      <span style={kw}>await </span>
      <span style={fn}>fetch</span>
      <span style={punc}>(</span>
      <span style={str}>{"'https://api.example.com/data'"}</span>
      <span style={punc}>);</span>
    </>,
    <>
      {"  "}
      <span style={kw}>const </span>
      <span style={plain}>data = </span>
      <span style={kw}>await </span>
      <span style={plain}>response.</span>
      <span style={fn}>json</span>
      <span style={punc}>();</span>
    </>,
    <>
      {"  "}
      <span style={kw}>return </span>
      <span style={plain}>data;</span>
    </>,
    <span style={punc}>{"}"}</span>,
    <>&nbsp;</>,
    <>
      <span style={fn}>fetchData</span>
      <span style={punc}>()</span>
    </>,
    <>
      {"  "}
      <span style={punc}>.</span>
      <span style={fn}>then</span>
      <span style={punc}>(</span>
      <span style={plain}>data =&gt; </span>
      <span style={plain}>console.</span>
      <span style={fn}>log</span>
      <span style={punc}>(</span>
      <span style={plain}>data</span>
      <span style={punc}>))</span>
    </>,
    <>
      {"  "}
      <span style={punc}>.</span>
      <span style={fn}>catch</span>
      <span style={punc}>(</span>
      <span style={plain}>error =&gt; </span>
      <span style={plain}>console.</span>
      <span style={fn}>error</span>
      <span style={punc}>(</span>
      <span style={plain}>error</span>
      <span style={punc}>));</span>
    </>,
  ];

  return (
    <div>
      {lines.map((line, i) => (
        <div key={i} className="flex">
          <span className="select-none w-6 mr-4 text-right text-white/25 shrink-0">
            {i + 1}
          </span>
          <span className="whitespace-pre">{line}</span>
        </div>
      ))}
    </div>
  );
}

function FeatureTile({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-muted/10 backdrop-blur-sm p-4 transition-colors hover:border-border/80">
      <div className="mb-3" style={{ color: LIME }}>
        {icon}
      </div>
      <h4 className="text-sm font-bold text-foreground mb-1">{title}</h4>
      <p className="text-xs text-muted-foreground leading-snug">{description}</p>
    </div>
  );
}
