import { cloudflareClient } from "better-auth-cloudflare/client";
import { dodopaymentsClient } from "@dodopayments/better-auth/client";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  plugins: [cloudflareClient(), dodopaymentsClient()],
});

export type AuthClient = typeof authClient;
