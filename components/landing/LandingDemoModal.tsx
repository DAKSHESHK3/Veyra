"use client";

import React from "react";
import { BiometricReticle } from "@/components/visuals/BiometricReticle";

interface LandingDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LandingDemoModal({ isOpen, onClose }: LandingDemoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0E0E0E]/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#131313] border border-[#474740]/50 p-6 space-y-4 relative">
        <div className="flex items-center justify-between border-b border-[#222220] pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E3C283]" />
            <span className="font-mono text-[11px] text-[#ffffff] font-bold tracking-wider uppercase">
              OPTICAL DEMO STREAM // VEYRA 26.4
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-[11px] text-[#929189] hover:text-[#ffffff] transition-colors"
          >
            × CLOSE
          </button>
        </div>

        <div className="relative w-full h-72 bg-[#0E0E0E] border border-[#222220] flex items-center justify-center">
          <BiometricReticle state="verifying" size="sm" label="SYNCHRONIZING" />
          <div className="absolute bottom-3 left-3 font-mono text-[9px] text-[#929189]">
            EMBEDDING ENGINE: 128 FLOATS COMPUTED LOCAL
          </div>
        </div>

        <div className="font-sans text-xs text-[#C9C7BD] leading-relaxed">
          This simulation mirrors the zero-server WebGL pipeline. Camera telemetry is parsed into
          float arrays locally without network exposure.
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#E3C283] text-[#402D00] font-mono text-[11px] font-bold uppercase hover:bg-[#FFDEA1] transition-colors"
          >
            ACKNOWLEDGE &amp; RETURN
          </button>
        </div>
      </div>
    </div>
  );
}
