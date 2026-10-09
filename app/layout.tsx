import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Veyra — Verified Presence, Simplified",
  description:
    "Next-generation, browser-side facial recognition attendance platform. Verified presence, simplified.",
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
