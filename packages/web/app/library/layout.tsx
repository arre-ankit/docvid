import type { Metadata } from "next";

// Personal, auth-gated page: give it a title but keep it out of search results.
export const metadata: Metadata = {
  title: "Your library",
  robots: { index: false, follow: false },
};

export default function LibraryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
