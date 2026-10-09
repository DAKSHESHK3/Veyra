"use client";

import React, { useState } from "react";
import Link from "next/link";
import { VeyraShader } from "@/components/visuals/VeyraShader";
import { BiometricReticle } from "@/components/visuals/BiometricReticle";

interface LandingHeroProps {
  onOpenDemo?: () => void;
}

export function LandingHero({ onOpenDemo }: LandingHeroProps) {
  return (
    <section className="relative w-full max-w-[1440px] mx-auto px-5 lg:px-12 pt-10 pb-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Column: Typographic Monument */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#201F1F] border border-[#474740]/30 text-[#E3C283] font-mono text-[9px] uppercase tracking-[0.2em]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E3C283] animate-pulse" />
              WEBGL 2.0 DEEP METRIC LEARNING
            </span>
            <span className="font-mono text-[9px] text-[#929189] tracking-[0.2em] hidden sm:inline-block">
              [ BUILD 26.4.11-PROD ]
            </span>
          </div>

          <h1 className="font-sans text-5xl md:text-6xl lg:text-7xl tracking-[-0.04em] text-[#ffffff] uppercase font-light leading-[1.04]">
            PRESENCE,
            <br />
            <span className="text-[#E3C283] italic font-serif lowercase tracking-normal font-normal">
              verified.
            </span>
          </h1>

          <p className="font-sans text-base md:text-lg text-[#C9C7BD] max-w-xl font-normal leading-relaxed">
            Fast, secure biometric attendance computed directly in the browser via WebGL.
            128-dimensional mathematical embeddings without persisting raw sensor telemetry. Zero
            video streaming. Instant temporal certainty.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center h-12 px-8 bg-[#ffffff] text-[#31312B] font-mono text-[11px] tracking-[0.16em] uppercase transition-all duration-300 hover:bg-[#E4E3DC] hover:translate-y-[-1px] font-bold"
            >
              <span>OPEN DASHBOARD →</span>
            </Link>
            <button
              type="button"
              onClick={onOpenDemo}
              className="inline-flex items-center justify-center h-12 px-8 bg-transparent border border-[#474740] text-[#E5E2E1] font-mono text-[11px] tracking-[0.16em] uppercase transition-all duration-300 hover:border-[#E3C283] hover:text-[#E3C283] hover:bg-[#201F1F]"
            >
              <span>WATCH SYSTEM DEMO</span>
            </button>
          </div>

          <div className="pt-4 flex items-center gap-4 text-[#929189] font-mono text-[9px] uppercase tracking-[0.2em] flex-wrap">
            <span>LATENCY ≤ 18MS</span>
            <span>•</span>
            <span>ZERO PYTHON RUNTIME</span>
            <span>•</span>
            <span>100% IN-TAB INFERENCE</span>
          </div>
        </div>

        {/* Right Column: Interactive Optical Reticle HUD & WebGL Viewport */}
        <div className="lg:col-span-5 relative">
          <div className="relative w-full h-[480px] md:h-[520px] rounded-none overflow-hidden border border-[#474740]/30 bg-[#0E0E0E]">
            {/* Live WebGL Shader */}
            <div className="absolute inset-0 w-full h-full">
              <VeyraShader interactive />
            </div>

            {/* Precision Framing Brackets */}
            <div className="absolute inset-4 pointer-events-none border border-[#474740]/20 flex flex-col justify-between p-3">
              <div className="flex justify-between items-start">
                <span className="font-mono text-[9px] text-[#E3C283] font-bold tracking-[0.25em]">
                  [ HUD // 009-L ]
                </span>
                <span className="font-mono text-[9px] text-[#929189] tracking-[0.2em]">
                  SYS: ACTIVE
                </span>
              </div>

              {/* Center Biometric Reticle */}
              <div className="self-center">
                <BiometricReticle state="scanning" size="md" />
              </div>

              <div className="flex justify-between items-end">
                <span className="font-mono text-[9px] text-[#929189] tracking-[0.14em]">
                  OPT-X: 284.18 // OPT-Y: 911.02
                </span>
                <span className="font-mono text-[9px] text-[#E3C283] tracking-[0.2em] font-bold">
                  [ RETICLE LOCK ]
                </span>
              </div>
            </div>

            {/* Top HUD Badging */}
            <div className="absolute top-6 left-6 flex items-center space-x-2.5 bg-[#0E0E0E]/90 backdrop-blur-md px-3 py-1.5 border border-[#474740]/40">
              <span className="w-2 h-2 rounded-full bg-[#E3C283] animate-pulse" />
              <span className="font-mono text-[10px] uppercase text-[#ffffff] tracking-[0.18em]">
                NODE: WEBGL 2.0 LOCAL
              </span>
            </div>

            {/* Realtime Vector Math HUD */}
            <div className="absolute bottom-6 left-6 font-mono text-[9px] text-[#C9C7BD] space-y-1 bg-[#0E0E0E]/85 backdrop-blur-md p-2.5 border border-[#474740]/25">
              <div>VECTOR: 128-D FACENET EMBEDDING</div>
              <div>
                TEMPORAL CONFIDENCE: <span className="text-[#E3C283] font-bold">0.984</span>
              </div>
              <div>FRAME BUFFER: ZERO PERSISTED</div>
            </div>

            {/* Status Indicator Pill */}
            <div className="absolute bottom-6 right-6 font-mono text-[10px] text-[#E3C283] border border-[#E3C283]/40 px-3 py-1 bg-[#0E0E0E]/90 backdrop-blur-md">
              READY FOR SCAN
            </div>
          </div>
        </div>
      </div>

      {/* Metadata Horizon Strip */}
      <div className="mt-14 pt-4 border-t border-[#474740]/30 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex items-center gap-2 font-mono text-[10px] text-[#C9C7BD] tracking-[0.14em]">
          <span className="text-[#E3C283]">□</span>
          <span>BROWSER NATIVE WEBGL INFERENCE</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] text-[#C9C7BD] tracking-[0.14em]">
          <span className="text-[#E3C283]">□</span>
          <span>TEMPORAL VERIFICATION ENGINE</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] text-[#C9C7BD] tracking-[0.14em]">
          <span className="text-[#E3C283]">□</span>
          <span>ZERO RAW SENSOR STREAMING</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] text-[#C9C7BD] tracking-[0.14em]">
          <span className="text-[#E3C283]">□</span>
          <span>POSTGRES ROW LEVEL SECURITY</span>
        </div>
      </div>
    </section>
  );
}
