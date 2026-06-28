"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

type UpgradeButtonProps = {
  slug: string;
  /** True when the viewer is signed in; signed-out users go to /login first. */
  authenticated: boolean;
  label?: string;
  className?: string;
};

// The Dodo checkout endpoint requires a billing object. The hosted checkout page
// lets the customer enter/correct their real address, so we send placeholders.
const PLACEHOLDER_BILLING = {
  city: "",
  country: "US",
  state: "",
  street: "",
  zipcode: "",
};

export function UpgradeButton({ slug, authenticated, label = "Upgrade", className }: UpgradeButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    if (!authenticated) {
      router.push(`/login?redirect=${encodeURIComponent("/pricing")}`);
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
        setError(checkoutError?.message ?? "Could not start checkout. Please try again.");
        setLoading(false);
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("Could not start checkout. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button onClick={onClick} disabled={loading} className={className}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : label}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
