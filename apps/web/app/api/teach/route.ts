import { NextResponse } from "next/server";
import { backendFetch } from "./backend";

// Start a lesson generation. Proxies to the docvid-ai Worker, which kicks off the
// Cloudflare Workflow. Keeps the Workers AI entirely server-side.
export async function POST(request: Request) {
  const body = await request.text();
  const res = await backendFetch("/lessons", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
  const data = await res.text();
  return new NextResponse(data, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
