import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { getSession } from "@/src/auth/server";
import { getSubscriptionForUser } from "@/src/lib/subscription.server";
import { countLessonsForUser } from "@/src/lib/lessons.server";
import {
  ANON_FREE_LIMIT,
  ANON_GEN_COOKIE,
  FREE_USER_LIMIT,
  parseAnonGenCount,
} from "@/src/lib/generation-limits";

export async function GET() {
  const session = await getSession();

  // Signed-out visitors: quota lives in the anon cookie.
  if (!session) {
    const cookieStore = await cookies();
    const used = parseAnonGenCount(cookieStore.get(ANON_GEN_COOKIE)?.value);
    return NextResponse.json({
      isPro: false,
      plan: "free",
      status: null,
      cancelAtPeriodEnd: false,
      authenticated: false,
      limit: ANON_FREE_LIMIT,
      used,
      remaining: Math.max(0, ANON_FREE_LIMIT - used),
    });
  }

  const subscription = await getSubscriptionForUser(session.user.id);

  // Pro: unlimited — null limit signals "no cap" to the client.
  if (subscription.isPro) {
    return NextResponse.json({
      isPro: true,
      plan: "pro",
      status: subscription.status,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      authenticated: true,
      limit: null,
      used: null,
      remaining: null,
    });
  }

  // Signed-in free user: quota counted from owned lessons.
  const used = await countLessonsForUser(session.user.id);
  return NextResponse.json({
    isPro: false,
    plan: "free",
    status: subscription.status,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    authenticated: true,
    limit: FREE_USER_LIMIT,
    used,
    remaining: Math.max(0, FREE_USER_LIMIT - used),
  });
}
