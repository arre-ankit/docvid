import type { Metadata } from "next";

// The lesson player is a per-lesson, query-param client route — not useful to
// index, so give it a title and keep it out of search results.
export const metadata: Metadata = {
  title: "Watch lesson",
  robots: { index: false, follow: false },
};

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return children;
}
