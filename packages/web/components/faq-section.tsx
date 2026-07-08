import { ChevronDown } from "lucide-react";

const GREEN = "#007A55";

const FAQS: { q: string; a: string }[] = [
  {
    q: "What is DocVid?",
    a: "DocVid turns your documentation into a narrated, animated video course, with no screen recorder and no editing suite. Paste a docs link or describe a topic, and AI writes the lesson, records the voiceover, and animates the code into a share-ready video.",
  },
  {
    q: "Who is DocVid for?",
    a: "Anyone who ships technical content: DevRel teams and developer advocates, course creators, indie founders launching a product, educators, and open-source maintainers who want a polished video walkthrough of their docs without losing a weekend to it.",
  },
  {
    q: "Isn't it faster to just record it myself?",
    a: "Recording one tutorial means screen capture, retakes, a voiceover, and editing. That is usually an afternoon, often a whole weekend. DocVid builds the same thing from a single link in seconds, so you can ship a course in the time it used to take to set up your mic.",
  },
  {
    q: "Can I publish the videos commercially?",
    a: "Yes. The videos are yours to put on YouTube, your docs site, a paid course, or a launch thread. Export an MP4 and use it however you like.",
  },
  {
    q: "Do I need an account, and what's free vs Pro?",
    a: "You can generate a lesson without signing in. Free covers creating lessons; Pro unlocks unlimited lessons and the full set of narrator voices, built for creators who publish regularly.",
  },
  {
    q: "How do I export or share the finished video?",
    a: "Export as MP4 with the narration muxed in. You can also just share a link and anyone can watch it in the browser, no login or download.",
  },
  {
    q: "Can I pick the voice, language, and theme?",
    a: "Yes. Choose from several natural-sounding voices before you generate, and re-voice a lesson later without regenerating the code. Dozens of languages get full syntax highlighting, with editor themes you can switch on the fly.",
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
