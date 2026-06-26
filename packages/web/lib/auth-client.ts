import { cloudflareClient } from "better-auth-cloudflare/client";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  plugins: [cloudflareClient()],
});

export type AuthClient = typeof authClient;
