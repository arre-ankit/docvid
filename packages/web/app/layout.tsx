import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {
  GeistPixelSquare,
  GeistPixelGrid,
  GeistPixelCircle,
  GeistPixelTriangle,
  GeistPixelLine,
} from "geist/font/pixel";

import "./globals.css";

import { Header } from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://docvid.in";
const OG_DESCRIPTION =
  "Stop recording tutorials. Paste a docs link and ship a narrated, animated video course in seconds.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "DocVid | Turn docs into a narrated video course",
    template: "%s | DocVid",
  },
  description: OG_DESCRIPTION,
  applicationName: "DocVid",
  keywords: [
    "docs to video",
    "documentation to video",
    "AI video tutorials",
    "code walkthrough generator",
    "narrated code animation",
    "developer tutorial generator",
    "video course generator",
    "coding lessons",
    "DevRel content",
  ],
  authors: [{ name: "DocVid" }],
  creator: "DocVid",
  publisher: "DocVid",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    siteName: "DocVid",
    url: SITE_URL,
    title: "DocVid | Turn docs into a narrated video course",
    description: OG_DESCRIPTION,
    locale: "en_US",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "DocVid: stop recording tutorials, start shipping video.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DocVid | Turn docs into a narrated video course",
    description: OG_DESCRIPTION,
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        // Browser extensions (e.g. Grammarly) inject attributes on <body> before
        // hydration; suppress the resulting attribute mismatch warning.
        suppressHydrationWarning
        className={`${geistMono.variable} ${geistSans.variable} ${GeistPixelSquare.variable} ${GeistPixelGrid.variable} ${GeistPixelCircle.variable} ${GeistPixelTriangle.variable} ${GeistPixelLine.variable} antialiased h-screen flex flex-col`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className="flex-1 min-h-0 relative">
            {children}
            <Analytics />
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
