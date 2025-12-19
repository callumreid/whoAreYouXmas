import type { Metadata } from "next";
import { Patrick_Hand, Coming_Soon } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { GameStateProvider } from "@/components/game-state-provider";
import { SnowEffect } from "@/components/snow-effect";

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

export const metadata: Metadata = {
  title: "whoAreYouXmas - A Charlie Brown Investigation",
  description: "A cozy but chaotic Christmas personality quiz.",
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
        <SnowEffect />
        <GameStateProvider>{children}</GameStateProvider>
        <Analytics />
      </body>
    </html>
  );
}
