import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Ai Interviewer — Adaptive Voice-Based Interview Simulation",
  description:
    "Smart Ai Interviewer is a voice-first interview simulation platform that asks questions using generated speech, listens to spoken answers, evaluates performance, adapts future questions, and generates structured feedback.",
  keywords: [
    "interview preparation",
    "voice interview",
    "AI interview",
    "mock interview",
    "adaptive interview",
    "placement preparation",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
