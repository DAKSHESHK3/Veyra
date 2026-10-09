import React from "react";
import Link from "next/link";
import { VeyraMark } from "@/components/visuals/VeyraMark";

export function LandingFooter() {
  return (
    <>
      {/* FINAL INVITATION / ENTERPRISE ACCESS */}
      <section className="w-full bg-[#131313] border-t border-[#222220] py-16">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-12 flex flex-col items-center text-center space-y-6">
          {/* Monolithic Center Emblem */}
          <div className="w-16 h-16 rounded-full border border-[#E3C283]/40 flex items-center justify-center relative">
            <div className="absolute inset-1 rounded-full border border-dashed border-[#474740]/50" />
            <div className="w-3 h-3 rounded-full bg-[#E3C283]" />
          </div>

          <div className="space-y-2 max-w-2xl">
            <span className="font-mono text-[11px] text-[#E3C283] tracking-[0.3em] uppercase">
              SYSTEM READY FOR ENROLLMENT
            </span>
            <h2 className="font-sans text-3xl md:text-5xl text-[#ffffff] tracking-tight font-light uppercase">
              PRESENCE, VERIFIED.
            </h2>
            <p className="font-sans text-sm md:text-base text-[#C9C7BD]">
              Deploy Veyra across academic institutions and private enterprises. Instant setup in
              under 60 seconds with browser-native deep metric verification.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center h-12 px-8 bg-[#ffffff] text-[#090909] font-mono text-[11px] tracking-[0.16em] uppercase hover:bg-[#E4E3DC] transition-all font-bold"
            >
              <span>LAUNCH CONSOLE →</span>
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center h-12 px-8 bg-transparent border border-[#474740] text-[#E5E2E1] font-mono text-[11px] tracking-[0.16em] uppercase hover:border-[#E3C283] hover:text-[#E3C283] transition-all"
            >
              <span>EXPLORE SYSTEM</span>
            </a>
          </div>

          <div className="font-mono text-[9px] text-[#929189] tracking-[0.2em] uppercase pt-4">
            NEXT.JS • SUPABASE • WEBGL BROWSER INFERENCE • ROW-LEVEL SECURITY
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full bg-[#090909] border-t border-[#222220]">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-12 py-12">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-10 mb-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <VeyraMark size={22} />
                <span className="text-[#F3F0E8] font-sans font-medium text-sm tracking-[0.2em]">
                  VEYRA
                </span>
              </div>
              <p className="font-mono text-[11px] text-[#E3C283] tracking-[0.2em] uppercase">
                PRESENCE, VERIFIED.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
              <div className="flex flex-col space-y-2">
                <span className="font-mono text-[9px] text-[#929189] uppercase tracking-[0.2em] mb-1">
                  PLATFORM
                </span>
                <a
                  href="#system"
                  className="font-mono text-[11px] text-[#C9C7BD] hover:text-[#ffffff] transition-colors uppercase"
                >
                  Product
                </a>
                <Link
                  href="/dashboard"
                  className="font-mono text-[11px] text-[#C9C7BD] hover:text-[#ffffff] transition-colors uppercase"
                >
                  Console
                </Link>
              </div>

              <div className="flex flex-col space-y-2">
                <span className="font-mono text-[9px] text-[#929189] uppercase tracking-[0.2em] mb-1">
                  ASSURANCE
                </span>
                <a
                  href="#security"
                  className="font-mono text-[11px] text-[#C9C7BD] hover:text-[#ffffff] transition-colors uppercase"
                >
                  Security
                </a>
                <a
                  href="#how-it-works"
                  className="font-mono text-[11px] text-[#C9C7BD] hover:text-[#ffffff] transition-colors uppercase"
                >
                  How It Works
                </a>
              </div>

              <div className="flex flex-col space-y-2">
                <span className="font-mono text-[9px] text-[#929189] uppercase tracking-[0.2em] mb-1">
                  AUTHENTICATION
                </span>
                <Link
                  href="/login"
                  className="font-mono text-[11px] text-[#C9C7BD] hover:text-[#ffffff] transition-colors uppercase"
                >
                  Faculty Login
                </Link>
                <Link
                  href="/dashboard"
                  className="font-mono text-[11px] text-[#C9C7BD] hover:text-[#ffffff] transition-colors uppercase"
                >
                  Admin Portal
                </Link>
              </div>

              <div className="flex flex-col space-y-2">
                <span className="font-mono text-[9px] text-[#929189] uppercase tracking-[0.2em] mb-1">
                  RESOURCES
                </span>
                <Link
                  href="/attendance/new"
                  className="font-mono text-[11px] text-[#C9C7BD] hover:text-[#ffffff] transition-colors uppercase"
                >
                  Camera Room
                </Link>
                <Link
                  href="/students"
                  className="font-mono text-[11px] text-[#C9C7BD] hover:text-[#ffffff] transition-colors uppercase"
                >
                  Roster
                </Link>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[#222220] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <span className="font-mono text-[9px] text-[#929189] tracking-[0.14em]">
              © 2026 VEYRA. ALL RIGHTS RESERVED.
            </span>
            <span className="font-mono text-[9px] text-[#929189] tracking-[0.2em] uppercase">
              NEXT.JS · SUPABASE · WEBGL BROWSER INFERENCE · ROW-LEVEL SECURITY
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
