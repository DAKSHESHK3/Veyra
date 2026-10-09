import type { Metadata } from "next";
import { Geist, Space_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VEYRA — Verified Presence, Simplified",
  description:
    "Next-generation biometric attendance verification powered directly in-browser via WebGL deep metric learning. Private by design, cryptographically audited.",
  keywords: [
    "Biometric Attendance",
    "FaceNet",
    "WebGL Inference",
    "Supabase RLS",
    "Veyra",
    "Temporal Verification",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${geist.variable} ${spaceMono.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen bg-[#090909] text-[#F3F0E8] antialiased selection:bg-[#5C4612] selection:text-[#E3C283]">
        {children}
      </body>
    </html>
  );
}
