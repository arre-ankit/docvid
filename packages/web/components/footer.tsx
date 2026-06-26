import Link from "next/link";
import { GitHubIcon, TwitterIcon } from "./ui/icons";
import { Logo } from "./logo";
import { FluidGradientText } from "./fluid-gradient-text";

const LIME = "#CBFF2E";
const GREEN = "#007A55";

export function Footer() {
  return (
    <footer className="relative z-10 flex-shrink-0 bg-[#0c1108] text-white">
      {/* Subtle gradient at top */}
      <div
        className="absolute inset-x-0 top-0 h-32 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(203,255,46,0.1), transparent)",
        }}
      />

      {/* Main footer content */}
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12">
          {/* Left side: Logo + tagline + CTA */}
          <div className="space-y-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Logo className="text-2xl" />
              <h2 className="text-xl font-bold">DocVid</h2>
            </div>

            {/* Tagline */}
            <div className="space-y-2">
              <p className="text-lg sm:text-xl font-medium text-white/90">
                "Docs in, knowledge out in video form."
              </p>
              <p className="text-sm text-white/60">
                — AI-powered coding education that clicks.
              </p>
            </div>

            {/* CTA Button */}
            <Link
              href="/teach"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-black transition-transform hover:scale-[1.02]"
              style={{ backgroundColor: LIME }}
            >
              Get started free
              <span className="text-lg">→</span>
            </Link>
          </div>

          {/* Right side: Link columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            {/* Product */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider">
                Product
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/teach"
                    className="text-sm text-white/80 hover:text-white transition-colors"
                  >
                    Teach with AI
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-white/80 hover:text-white transition-colors"
                  >
                    Browse lessons
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-white/80 hover:text-white transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider">
                Company
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="#"
                    className="text-sm text-white/80 hover:text-white transition-colors"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-white/80 hover:text-white transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-white/80 hover:text-white transition-colors"
                  >
                    Careers
                  </Link>
                </li>
              </ul>
            </div>

            {/* Connect */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider">
                Connect
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="https://x.com/costiniuc00"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-white/80 hover:text-white transition-colors flex items-center gap-2"
                  >
                    Twitter / X
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://github.com/kostyniuk/docvid"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-white/80 hover:text-white transition-colors flex items-center gap-2"
                  >
                    GitHub
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-white/80 hover:text-white transition-colors"
                  >
                    LinkedIn
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="relative border-t border-white/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 max-w-7xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
            <p>© 2026 DocVid. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link
                href="#"
                className="hover:text-white/80 transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="#"
                className="hover:text-white/80 transition-colors"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
