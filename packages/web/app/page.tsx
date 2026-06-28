import { Footer } from "@/components/footer";
import { FlowSection } from "@/components/flow-section";
import { FaqSection } from "@/components/faq-section";
import { TechStackPile } from "@/components/tech-stack-pile";
import { Hero } from "@/components/hero";
import { LogoMarquee } from "@/components/logo-marquee";

export default function Page() {
  return (
    <div className="relative w-full min-h-screen flex flex-col bg-background overflow-hidden">
      {/* Light mode: green → lime gradient wash across the whole page */}
      <div
        className="pointer-events-none fixed inset-0 z-0 block dark:hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(0,122,85,0.16) 0%, rgba(203,255,46,0.16) 55%, rgba(203,255,46,0.06) 100%)",
        }}
      />

      {/* Dark mode: green/lime ambient glow behind the hero */}
      <div
        className="pointer-events-none fixed inset-0 z-0 hidden dark:block"
        style={{
          background:
            "radial-gradient(70% 55% at 50% 38%, rgba(203,255,46,0.16), transparent 72%), radial-gradient(60% 50% at 82% 8%, rgba(203,255,46,0.12), transparent 70%), radial-gradient(65% 55% at 12% 22%, rgba(0,122,85,0.22), transparent 70%), radial-gradient(90% 60% at 50% 100%, rgba(0,122,85,0.18), transparent 75%)",
        }}
      />

      <div className="relative z-10 flex-1 flex flex-col">
        <Hero />

        {/* ---------- Logo reel ---------- */}
        <div className="mt-14 sm:mt-20 animate-in fade-in duration-700 delay-300 fill-mode-backwards">
          <LogoMarquee />
        </div>

        <FlowSection />
        <FaqSection />
        <TechStackPile />
      </div>

      <Footer />
    </div>
  );
}
