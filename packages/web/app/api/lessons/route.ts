import { NextResponse } from "next/server";

import { getSession } from "@/src/auth/server";
import { listLessonsForUser } from "@/src/lib/lessons.server";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await listLessonsForUser(session.user.id);
  return NextResponse.json({
    lessons: rows.map((row) => ({
      id: row.id,
      title: row.title,
      status: row.status,
      createdAt: row.createdAt,
      claimedAt: row.claimedAt,
    })),
  });
}
