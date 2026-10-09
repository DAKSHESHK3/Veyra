import React from "react";
import Link from "next/link";
import { Camera, Cpu, Hash, Database, Shield, ArrowLeft } from "lucide-react";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Security & Privacy Architecture — VEYRA",
  description:
    "Technical breakdown of Veyra's client-side biometric inference, vector extraction pipeline, and Postgres Row Level Security architecture.",
};

export default function SecurityPage() {
  return (
    <div className="bg-[#090909] text-[#F3F0E8] min-h-screen selection:bg-[#5C4612] selection:text-[#E3C283]">
      <LandingHeader />

      <main className="w-full pt-28 pb-16 px-5 lg:px-12 max-w-[1440px] mx-auto space-y-14">
        {/* Breadcrumb & Header */}
        <div className="space-y-3 border-b border-[#222220] pb-8">
          <Link
            href="/"
            className="inline-flex items-center font-mono text-[10px] text-[#9A9A94] hover:text-[#E3C283] transition-colors uppercase"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            [ RETURN TO OVERVIEW ]
          </Link>
          <span className="font-mono text-[10px] text-[#E3C283] tracking-[0.25em] uppercase block">
            [ PROTOCOL ASSURANCE // RFC-01 ]
          </span>
          <h1 className="font-sans text-4xl md:text-5xl font-light text-[#ffffff] uppercase tracking-tight">
            SECURITY &amp; PRIVACY ARCHITECTURE
          </h1>
          <p className="font-sans text-base text-[#C9C7BD] max-w-3xl leading-relaxed">
            Veyra is engineered around local execution boundaries. By executing biometric feature
            extraction directly within client browser VRAM, raw video feeds remain local to the
            capturing device, transmitting only mathematical coordinate vectors and audited records.
          </p>
        </div>

        {/* Technical Pipeline Flow Diagram */}
        <section className="space-y-4">
          <span className="font-mono text-[10px] text-[#E3C283] tracking-[0.2em] uppercase">
            DATA TRANSIT ISOLATION FLOW
          </span>

          <div className="p-6 bg-[#0E0E0E] border border-[#222220]">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-stretch">
              <div className="p-5 bg-[#131313] border border-[#222220] flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between text-[#E3C283] mb-2 font-mono text-[10px]">
                    <Camera className="h-5 w-5" />
                    <span>PHASE 01</span>
                  </div>
                  <h3 className="font-mono text-sm text-[#ffffff] uppercase font-bold">
                    CAMERA SENSOR
                  </h3>
                  <p className="font-mono text-xs text-[#9A9A94] mt-1 leading-relaxed">
                    Browser invokes <code className="text-[#E3C283]">getUserMedia</code> with user
                    consent. Frames are buffered temporarily in browser GPU texture memory and
                    cleared each frame loop.
                  </p>
                </div>
                <div className="font-mono text-[9px] text-[#9A9A94] pt-2 border-t border-[#222220]">
                  VOLATILE VRAM ONLY
                </div>
              </div>

              <div className="p-5 bg-[#131313] border border-[#E3C283]/40 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between text-[#E3C283] mb-2 font-mono text-[10px]">
                    <Cpu className="h-5 w-5" />
                    <span>PHASE 02</span>
                  </div>
                  <h3 className="font-mono text-sm text-[#ffffff] uppercase font-bold">
                    CLIENT WEBGL 2.0
                  </h3>
                  <p className="font-mono text-xs text-[#9A9A94] mt-1 leading-relaxed">
                    TinyFace and FaceNet model weights evaluate faces in-tab. A 128-dimensional
                    floating point coordinate vector is produced via hardware-accelerated shaders.
                  </p>
                </div>
                <div className="font-mono text-[9px] text-[#E3C283] pt-2 border-t border-[#222220]">
                  LOCAL IN-TAB INFERENCE
                </div>
              </div>

              <div className="p-5 bg-[#131313] border border-[#222220] flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between text-[#E3C283] mb-2 font-mono text-[10px]">
                    <Hash className="h-5 w-5" />
                    <span>PHASE 03</span>
                  </div>
                  <h3 className="font-mono text-sm text-[#ffffff] uppercase font-bold">
                    TEMPORAL VERIFY
                  </h3>
                  <p className="font-mono text-xs text-[#9A9A94] mt-1 leading-relaxed">
                    A rolling multi-frame sliding horizon evaluates Euclidean distance across
                    consecutive frames to mitigate transient optical flicker and momentary false
                    positives.
                  </p>
                </div>
                <div className="font-mono text-[9px] text-[#9A9A94] pt-2 border-t border-[#222220]">
                  MULTI-FRAME DELTA LOCK
                </div>
              </div>

              <div className="p-5 bg-[#131313] border border-[#222220] flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between text-[#E3C283] mb-2 font-mono text-[10px]">
                    <Database className="h-5 w-5" />
                    <span>PHASE 04</span>
                  </div>
                  <h3 className="font-mono text-sm text-[#ffffff] uppercase font-bold">
                    POSTGRES RLS
                  </h3>
                  <p className="font-mono text-xs text-[#9A9A94] mt-1 leading-relaxed">
                    Only verified UUID markers and confidence timestamps reach Supabase. Unique
                    indexing prevents repeated records within the same active lecture session.
                  </p>
                </div>
                <div className="font-mono text-[9px] text-[#9A9A94] pt-2 border-t border-[#222220]">
                  DATABASE-LEVEL AUDIT
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Accurate Technical Specifications */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 border border-[#222220] bg-[#0E0E0E] space-y-3">
            <span className="font-mono text-[10px] text-[#E3C283] uppercase">
              PRINCIPLE 01 // NON-STREAMING
            </span>
            <h4 className="font-sans text-lg text-[#ffffff]">Zero Raw Video Streaming</h4>
            <p className="font-sans text-xs text-[#C9C7BD] leading-relaxed">
              Video frames captured from webcams are never streamed over WebSocket, WebRTC, or HTTP
              uploads. All image manipulation and matrix crops occur inside client-side JavaScript
              and WebGL shaders before immediate garbage collection.
            </p>
          </div>

          <div className="p-6 border border-[#222220] bg-[#0E0E0E] space-y-3">
            <span className="font-mono text-[10px] text-[#E3C283] uppercase">
              PRINCIPLE 02 // VECTOR ENCODING
            </span>
            <h4 className="font-sans text-lg text-[#ffffff]">Mathematical Embeddings</h4>
            <p className="font-sans text-xs text-[#C9C7BD] leading-relaxed">
              Enrolled students store 128-float unit vectors representing facial feature coordinates
              in hyperspace. While raw human likeness is not stored as images, vector databases are
              isolated using Supabase Row Level Security to prevent unauthorized access.
            </p>
          </div>

          <div className="p-6 border border-[#222220] bg-[#0E0E0E] space-y-3">
            <span className="font-mono text-[10px] text-[#E3C283] uppercase">
              PRINCIPLE 03 // RELATIONAL INTEGRITY
            </span>
            <h4 className="font-sans text-lg text-[#ffffff]">Duplicate Prevention</h4>
            <p className="font-sans text-xs text-[#C9C7BD] leading-relaxed">
              Database schema enforces <code className="text-[#E3C283]">UNIQUE(session_id, student_id)</code>,
              ensuring that client race conditions or repeated recognitions within a lecture
              window cannot produce erroneous duplicate attendance entries.
            </p>
          </div>
        </section>

        {/* CTA */}
        <div className="p-8 border border-[#222220] bg-[#131313] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-sans text-xl text-[#ffffff] uppercase font-light">
              READY TO TEST IN YOUR ENVIRONMENT?
            </h3>
            <p className="font-mono text-xs text-[#9A9A94] mt-1">
              Verify local WebGL performance and real-time attendance tracking directly in your browser.
            </p>
          </div>
          <Link href="/dashboard">
            <Button variant="champagne" className="h-10 px-6 font-bold">
              OPEN CONSOLE →
            </Button>
          </Link>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
