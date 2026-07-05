import type { Metadata } from "next";
import { Patrick_Hand, Coming_Soon } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { GameStateProvider } from "@/components/game-state-provider";
import { SnowEffect } from "@/components/snow-effect";
import { MusicProvider } from "@/components/music-provider";
import { TvModeProvider } from "@/components/tv-mode-provider";

const headingFont = Coming_Soon({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-heading",
});

const bodyFont = Patrick_Hand({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-body",
});

const SITE_URL = "https://who-are-you-xmas.vercel.app";
const TITLE = "whoAreYouXmas — A Charlie Brown Investigation";
const DESCRIPTION =
  "A cozy but chaotic Christmas personality quiz. Answer five unhinged holiday questions and find out which Christmas character you really are — Krampus, Frosty, or the Smelly Mall Santa.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "whoAreYouXmas",
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "whoAreYouXmas title art — a cozy chaotic Christmas scene",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og.jpg"],
  },
  icons: {
    icon: "/whoAreYouXmasThumbnail1-114x114.png",
    shortcut: "/whoAreYouXmasThumbnail1-114x114.png",
    apple: "/whoAreYouXmasThumbnail1-114x114.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${headingFont.variable} ${bodyFont.variable}`}>
      <body className="antialiased">
        <TvModeProvider>
          <SnowEffect />
          <GameStateProvider>{children}</GameStateProvider>
          <MusicProvider />
        </TvModeProvider>
        <Analytics />
      </body>
    </html>
  );
}
