import type { Metadata } from "next";

// The teach page itself is a client component, so its metadata lives here.
export const metadata: Metadata = {
  title: "Turn docs into video",
  description:
    "Paste a docs link or describe a topic. DocVid writes the lesson, narrates it, and animates the code into a share-ready video. No screen recorder, no editing.",
  alternates: { canonical: "/teach" },
};

export default function TeachLayout({ children }: { children: React.ReactNode }) {
  return children;
}
