import { NextResponse } from "next/server";

import { getOAuthProviderFlags, readAuthEnvSource } from "@/src/lib/auth-env";

export async function GET() {
  const source = await readAuthEnvSource();
  return NextResponse.json(getOAuthProviderFlags(source));
}
