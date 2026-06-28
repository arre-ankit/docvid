import { ChevronDown } from "lucide-react";

const GREEN = "#007A55";

const FAQS: { q: string; a: string }[] = [
  {
    q: "What is DocVid?",
    a: "DocVid turns documentation into narrated, animated coding lessons. Paste a docs link or describe a topic, and AI writes a step-by-step lesson, narrates it, and animates the code into a video you can watch and share.",
  },
  {
    q: "How does it work?",
    a: "Drop a documentation URL or a plain-text prompt into the box. AI reads it, breaks it into clear code steps, writes a voiceover script, and renders everything as a typed-out code animation with synced narration.",
  },
  {
    q: "Do I need an account to try it?",
    a: "No. You can generate a lesson without signing in. Sign in only when you want to customize the look, pick a different voice, or save lessons to your library.",
  },
  {
    q: "Can I export or share the video?",
    a: "Yes. Finished lessons can be exported as MP4 (with the narration muxed in), GIF, or WebM, or you can share a link so anyone can watch the lesson in the browser.",
  },
  {
    q: "Which languages and themes are supported?",
    a: "Dozens of languages with full syntax highlighting, including TypeScript, JavaScript, Python, Go, and Rust, plus a wide range of editor themes you can switch between on the fly.",
  },
  {
    q: "Can I change the narrator's voice?",
    a: "Absolutely. Choose from several natural-sounding voices before you generate, and re-voice an existing lesson anytime without regenerating the code or script.",
  },
];

export function FaqSection() {
  return (
    <section
      id="faq"
      className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 max-w-3xl scroll-mt-24"
    >
      {/* Eyebrow */}
      <div className="text-center">
        <p className="text-sm font-medium text-muted-foreground">FAQ</p>
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
      <h2 className="mt-6 text-center font-serif text-4xl sm:text-5xl leading-[1.05] tracking-tight text-foreground">
        Frequently asked questions
      </h2>

      {/* Accordion */}
      <div className="mt-12 space-y-3">
        {FAQS.map(({ q, a }) => (
          <details
            key={q}
            className="group rounded-2xl border border-border/60 bg-card px-5 shadow-sm transition-colors open:border-[color:var(--c)]/40"
            style={{ ["--c" as string]: GREEN }}
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left font-medium text-foreground [&::-webkit-details-marker]:hidden">
              {q}
              <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <p className="pb-5 -mt-1 text-sm leading-relaxed text-muted-foreground">{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
