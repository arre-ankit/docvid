"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// The Dodo checkout endpoint requires a billing object. The hosted checkout page
// lets the customer enter/correct their real address, so we send placeholders.
const PLACEHOLDER_BILLING = {
  city: "",
  country: "US",
  state: "",
  street: "",
  zipcode: "",
};

/**
 * Pro upgrade CTA for the marketing home section. Resolves auth state on the
 * client (so the home page stays static) and starts a Dodo checkout. Falls back
 * to a friendly error if checkout isn't configured yet.
 */
export function PricingProCta({ slug, className }: { slug: string; className?: string }) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    if (!session) {
      router.push(`/login?redirect=${encodeURIComponent("/#pricing")}`);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data, error: checkoutError } = await authClient.dodopayments.checkout({
        slug,
        billing: PLACEHOLDER_BILLING,
        customer: {},
      });

      if (checkoutError || !data?.url) {
        setError(checkoutError?.message ?? "Checkout isn't available yet. Please try again later.");
        setLoading(false);
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("Checkout isn't available yet. Please try again later.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        size="lg"
        onClick={onClick}
        disabled={loading || isPending}
        className={cn("w-full", className)}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Upgrade to Pro"}
      </Button>
      {error && <p className="text-center text-sm text-destructive">{error}</p>}
    </div>
  );
}
