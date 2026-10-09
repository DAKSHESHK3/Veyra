"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { VeyraMark } from "@/components/visuals/VeyraMark";

export function LandingHeader() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 border-b border-[#222220] transition-colors duration-200 ${
        isScrolled
          ? "bg-[#090909]/90 backdrop-blur-md"
          : "bg-[#090909]/75 backdrop-blur-md"
      }`}
    >
      <div className="h-16 max-w-[1440px] mx-auto px-5 lg:px-12 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <VeyraMark size={24} />
          <span className="text-[#F3F0E8] font-sans font-medium text-sm tracking-[0.2em] select-none group-hover:text-[#E3C283] transition-colors">
            VEYRA
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8 font-mono text-[11px] tracking-[0.14em] uppercase">
          <a
            href="#system"
            className="text-[#F3F0E8] border-b border-[#E3C283] pb-0.5 transition-colors"
          >
            SYSTEM
          </a>
          <a
            href="#security"
            className="text-[#9A9A94] hover:text-[#F3F0E8] transition-colors"
          >
            SECURITY
          </a>
          <a
            href="#how-it-works"
            className="text-[#9A9A94] hover:text-[#F3F0E8] transition-colors"
          >
            HOW IT WORKS
          </a>
          <a
            href="#console"
            className="text-[#9A9A94] hover:text-[#F3F0E8] transition-colors"
          >
            CONSOLE
          </a>
        </nav>

        {/* CTA Actions */}
        <div className="flex items-center gap-4 shrink-0 font-mono text-[11px] tracking-[0.14em] uppercase">
          <Link
            href="/login"
            className="text-[#9A9A94] hover:text-[#F3F0E8] transition-colors hidden sm:inline-block"
          >
            SIGN IN
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center h-10 px-4 bg-[#E3C283] text-[#402D00] font-bold transition-all hover:bg-[#FFDEA1] hover:text-[#261900]"
          >
            <span className="flex items-center gap-1.5">
              <span>OPEN DASHBOARD</span>
              <span>→</span>
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
