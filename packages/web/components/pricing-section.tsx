import Link from "next/link";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PricingProCta } from "@/components/pricing-cta";
import { cn } from "@/lib/utils";

const GREEN = "#007A55";
const PRO_SLUG = "pro-monthly";

const FREE_FEATURES = ["Create coding lessons", "Standard voices", "Community support"];
const PRO_FEATURES = [
  "Unlimited lessons",
  "Premium AI voices & revoicing",
  "Priority rendering",
  "Priority support",
];

export function PricingSection() {
  return (
    <section
      id="pricing"
      className="relative z-10 container mx-auto max-w-5xl scroll-mt-24 px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
    >
      {/* Eyebrow */}
      <div className="text-center">
        <p className="text-sm font-medium text-muted-foreground">Pricing</p>
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
      <h2 className="mt-6 text-center font-serif text-4xl leading-[1.05] tracking-tight text-foreground sm:text-5xl">
        Simple, honest pricing
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
        Start free. Upgrade to Pro when you want unlimited lessons and premium voices.
      </p>

      {/* Cards */}
      <div className="mx-auto mt-14 grid max-w-3xl gap-6 sm:grid-cols-2">
        {/* Free */}
        <PlanCard name="Free" price="$0" cadence="forever" features={FREE_FEATURES}>
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link href="/teach">Get started</Link>
          </Button>
        </PlanCard>

        {/* Pro */}
        <PlanCard
          name="Pro"
          price="$5"
          cadence="per month"
          features={PRO_FEATURES}
          highlight
        >
          <PricingProCta slug={PRO_SLUG} />
        </PlanCard>
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        See full details on the{" "}
        <Link href="/pricing" className="font-medium text-foreground underline underline-offset-4">
          pricing page
        </Link>
        .
      </p>
    </section>
  );
}

function PlanCard({
  name,
  price,
  cadence,
  features,
  highlight = false,
  children,
}: {
  name: string;
  price: string;
  cadence: string;
  features: string[];
  highlight?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border bg-card p-6 shadow-sm transition-colors sm:p-8",
        highlight
          ? "border-[color:var(--c)]/50 ring-1 ring-[color:var(--c)]/30"
          : "border-border/60",
      )}
      style={{ ["--c" as string]: GREEN }}
    >
      {highlight && (
        <span
          className="absolute right-5 top-5 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-white"
          style={{ backgroundColor: GREEN }}
        >
          Popular
        </span>
      )}

      <h3 className="text-lg font-semibold text-foreground">{name}</h3>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-4xl font-bold tracking-tight text-foreground">{price}</span>
        <span className="text-sm text-muted-foreground">/ {cadence}</span>
      </div>

      <ul className="mt-6 flex flex-1 flex-col gap-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-foreground">
            <Check className="mt-0.5 size-4 flex-shrink-0" style={{ color: GREEN }} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-8">{children}</div>
    </div>
  );
}
