import React from "react";
import { Camera, Cpu, Hash, Database } from "lucide-react";

export function LandingPrivacySchematic() {
  return (
    <section id="security" className="w-full bg-[#1C1B1B] border-y border-[#222220] py-16">
      <div className="max-w-[1440px] mx-auto px-5 lg:px-12 space-y-12">
        <div className="max-w-2xl space-y-2">
          <span className="font-mono text-[11px] text-[#E3C283] uppercase tracking-[0.25em]">
            [ CRYPTOGRAPHIC SANCTITY ]
          </span>
          <h2 className="font-sans text-3xl md:text-4xl text-[#ffffff] tracking-tight font-light uppercase">
            YOUR CAMERA STAYS YOURS.
          </h2>
          <p className="font-sans text-sm md:text-base text-[#C9C7BD] leading-relaxed">
            Veyra processes biometric identification locally in the browser. Your live sensor stream
            never travels across network boundaries, avoiding cloud leaks and biometric dragnet databases.
          </p>
        </div>

        {/* Architectural Flow Schematic */}
        <div className="p-6 bg-[#201F1F] border border-[#222220]">
          <div className="font-mono text-[9px] text-[#929189] tracking-[0.2em] uppercase mb-6">
            ISOLATION SCHEMATIC — ZERO OUTBOUND SENSOR DATA
          </div>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3 items-center text-center">
            {/* Step 1 */}
            <div className="p-4 bg-[#0E0E0E] border border-[#474740]/40 flex flex-col items-center">
              <Camera className="h-6 w-6 text-[#E3C283] mb-2" />
              <span className="font-mono text-[11px] text-[#ffffff] tracking-wider uppercase">
                CAMERA STREAM
              </span>
              <span className="font-mono text-[9px] text-[#929189] mt-1">VOLATILE VRAM ONLY</span>
            </div>

            <div className="hidden md:flex justify-center text-[#E3C283] font-mono text-sm">
              ——&gt;
            </div>

            {/* Step 2 */}
            <div className="p-4 bg-[#0E0E0E] border border-[#E3C283]/50 flex flex-col items-center">
              <Cpu className="h-6 w-6 text-[#E3C283] mb-2" />
              <span className="font-mono text-[11px] text-[#E3C283] tracking-wider uppercase">
                LOCAL BROWSER INFERENCE
              </span>
              <span className="font-mono text-[9px] text-[#929189] mt-1">CLIENT-SIDE WEBGL 2.0</span>
            </div>

            <div className="hidden md:flex justify-center text-[#E3C283] font-mono text-sm">
              ——&gt;
            </div>

            {/* Step 3 */}
            <div className="p-4 bg-[#0E0E0E] border border-[#474740]/40 flex flex-col items-center">
              <Hash className="h-6 w-6 text-[#E3C283] mb-2" />
              <span className="font-mono text-[11px] text-[#ffffff] tracking-wider uppercase">
                128-D MATH VECTOR
              </span>
              <span className="font-mono text-[9px] text-[#929189] mt-1">IRREVERSIBLE HASH</span>
            </div>

            <div className="hidden md:flex justify-center text-[#E3C283] font-mono text-sm">
              ——&gt;
            </div>

            {/* Step 4 */}
            <div className="p-4 bg-[#0E0E0E] border border-[#474740]/40 flex flex-col items-center">
              <Database className="h-6 w-6 text-[#E3C283] mb-2" />
              <span className="font-mono text-[11px] text-[#ffffff] tracking-wider uppercase">
                POSTGRES AUDIT LOG
              </span>
              <span className="font-mono text-[9px] text-[#929189] mt-1">ENCRYPTED AT REST</span>
            </div>
          </div>
        </div>

        {/* 4 Pillars of Security Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-6 bg-[#201F1F] border border-[#222220] space-y-2">
            <div className="font-mono text-[11px] text-[#E3C283] uppercase">
              01 / NON-TRANSMISSION
            </div>
            <h4 className="font-sans text-base text-[#ffffff] font-medium">
              No Live Video Streaming
            </h4>
            <p className="font-sans text-xs text-[#C9C7BD] leading-relaxed">
              Raw sensor frames are strictly isolated within browser RAM and cleared every frame
              tick. No video feeds transit WebSocket or WebRTC connections.
            </p>
          </div>

          <div className="p-6 bg-[#201F1F] border border-[#222220] space-y-2">
            <div className="font-mono text-[11px] text-[#E3C283] uppercase">
              02 / LOCAL INFERENCE
            </div>
            <h4 className="font-sans text-base text-[#ffffff] font-medium">
              Deep Metric Learning
            </h4>
            <p className="font-sans text-xs text-[#C9C7BD] leading-relaxed">
              Lightweight FaceNet weights compile into WebGL shader instructions. Device GPU
              executes mathematical inferences with zero cloud dependence.
            </p>
          </div>

          <div className="p-6 bg-[#201F1F] border border-[#222220] space-y-2">
            <div className="font-mono text-[11px] text-[#E3C283] uppercase">
              03 / PRIVATE STORAGE
            </div>
            <h4 className="font-sans text-base text-[#ffffff] font-medium">
              Mathematical Vectors Only
            </h4>
            <p className="font-sans text-xs text-[#C9C7BD] leading-relaxed">
              Faces cannot be reconstructed backwards from 128-float coordinate arrays. The system
              stores biometric fingerprints, not visual human likeness.
            </p>
          </div>

          <div className="p-6 bg-[#201F1F] border border-[#222220] space-y-2">
            <div className="font-mono text-[11px] text-[#E3C283] uppercase">
              04 / ROW INTEGRITY
            </div>
            <h4 className="font-sans text-base text-[#ffffff] font-medium">Role-Based RLS</h4>
            <p className="font-sans text-xs text-[#C9C7BD] leading-relaxed">
              Instructors can only record within their verified active classroom window. Admin
              auditing permissions enforce strict institutional segregation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
