import type { Metadata } from "next";
import { Check } from "lucide-react";

import { getSession } from "@/src/auth/server";
import { getCurrentSubscription } from "@/src/lib/subscription.server";
import { buildDodoProducts } from "@/src/lib/dodo";
import { readAuthEnvSource } from "@/src/lib/auth-env";
import { UpgradeButton } from "@/components/upgrade-button";
import { ManageBillingButton } from "@/components/manage-billing-button";
import { cn } from "@/lib/utils";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Create lessons for free, or upgrade to DocVid Pro for unlimited video courses and the full set of narrator voices.",
  alternates: { canonical: "/pricing" },
};

const GREEN = "#007A55";
const PRO_SLUG = "pro-monthly";

const FREE_FEATURES = ["Create coding lessons", "Standard voices", "Community support"];

const PRO_FEATURES = [
  "Unlimited lessons",
  "Premium AI voices & revoicing",
  "Priority rendering",
  "Priority support",
];

export default async function PricingPage() {
  const [session, subscription, envSource] = await Promise.all([
    getSession(),
    getCurrentSubscription(),
    readAuthEnvSource(),
  ]);

  const authenticated = !!session;
  const isPro = subscription.isPro;
  // Checkout is only possible if the Pro product id is configured in the env.
  const checkoutConfigured = buildDodoProducts(envSource).some((p) => p.slug === PRO_SLUG);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-background">
      {/* Light mode: green → lime gradient wash across the whole page */}
      <div
        className="pointer-events-none fixed inset-0 z-0 block dark:hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(0,122,85,0.16) 0%, rgba(203,255,46,0.16) 55%, rgba(203,255,46,0.06) 100%)",
        }}
      />

      {/* Dark mode: green/lime ambient glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0 hidden dark:block"
        style={{
          background:
            "radial-gradient(70% 55% at 50% 38%, rgba(203,255,46,0.16), transparent 72%), radial-gradient(60% 50% at 82% 8%, rgba(203,255,46,0.12), transparent 70%), radial-gradient(65% 55% at 12% 22%, rgba(0,122,85,0.22), transparent 70%), radial-gradient(90% 60% at 50% 100%, rgba(0,122,85,0.18), transparent 75%)",
        }}
      />

      <main className="relative z-10 container mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
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
      <h1 className="mt-6 text-center font-serif text-4xl leading-[1.05] tracking-tight text-foreground sm:text-5xl">
        Simple, honest pricing
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
        Start free. Upgrade to Pro when you want unlimited lessons and premium voices.
      </p>

      {/* Cards */}
      <div className="mx-auto mt-14 grid max-w-3xl gap-6 sm:grid-cols-2">
        {/* Free plan */}
        <PlanCard
          name="Free"
          price="$0"
          cadence="forever"
          features={FREE_FEATURES}
          current={!isPro}
        >
          {!isPro && <p className="text-sm text-muted-foreground">You&apos;re on the Free plan.</p>}
        </PlanCard>

        {/* Pro plan */}
        <PlanCard
          name="Pro"
          price="$5"
          cadence="per month"
          features={PRO_FEATURES}
          highlight
          current={isPro}
        >
          {isPro ? (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium" style={{ color: GREEN }}>
                You&apos;re on Pro
                {subscription.cancelAtPeriodEnd ? " (cancels at period end)" : ""}.
              </p>
              <ManageBillingButton />
            </div>
          ) : checkoutConfigured ? (
            <UpgradeButton
              slug={PRO_SLUG}
              authenticated={authenticated}
              label="Upgrade to Pro"
              className="w-full"
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              Checkout isn&apos;t configured yet. Set the Dodo product id to enable upgrades.
            </p>
          )}
        </PlanCard>
      </div>
      </main>
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}

function PlanCard({
  name,
  price,
  cadence,
  features,
  children,
  highlight = false,
  current = false,
}: {
  name: string;
  price: string;
  cadence: string;
  features: string[];
  children: React.ReactNode;
  highlight?: boolean;
  current?: boolean;
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
      {current && (
        <span
          className="absolute right-5 top-5 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-white"
          style={{ backgroundColor: GREEN }}
        >
          Current plan
        </span>
      )}

      <h2 className="text-lg font-semibold text-foreground">{name}</h2>
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
