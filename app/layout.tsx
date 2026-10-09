import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Attendance System — Biometric Recognition",
  description:
    "Fast, private, browser-accelerated facial recognition attendance platform with real-time biometric verification.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
