import React from "react";
import Link from "next/link";
import { ArrowLeft, Check, Camera, Layers, Cpu, Database, FileSpreadsheet } from "lucide-react";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "How It Works — VEYRA",
  description:
    "End-to-end technical walkthrough of the Veyra biometric verification platform from 3-pose enrollment to relational audit export.",
};

export default function HowItWorksPage() {
  const workflowSteps = [
    {
      step: "01",
      title: "Student Profile Provisioning",
      desc: "An administrator or faculty member registers student identification metadata (roll number, class section, academic semester). Unique constraints are verified immediately against Postgres tables.",
      code: "STAGE: PROVISION",
    },
    {
      step: "02",
      title: "Guided 3-Pose Calibration",
      desc: "The student faces their device camera. The in-browser calibration wizard guides them through frontal, left 15°, and right 15° orientations, collecting 24 high-confidence 128-float coordinate samples.",
      code: "STAGE: CENTROID CALCULATION",
    },
    {
      step: "03",
      title: "Centroid Vector Normalization",
      desc: "All valid samples are averaged into a single unit-normalized centroid vector. This irreversible mathematical fingerprint is saved into the face_embeddings table without raw imagery.",
      code: "STAGE: L2 NORMALIZATION",
    },
    {
      step: "04",
      title: "Session Initialization",
      desc: "Faculty initiates a lecture session for a designated subject and class room. A unique session UUID is minted in attendance_sessions with active status and real-time timer.",
      code: "STAGE: SESSION MINTING",
    },
    {
      step: "05",
      title: "Live WebGL Optical Inference",
      desc: "The camera room loads cached enrolled centroids into memory. Incoming webcam frames are passed through TinyFace and FaceNet shaders to extract 128-d vectors and measure Euclidean distance (τ ≤ 0.55).",
      code: "STAGE: REAL-TIME INFERENCE",
    },
    {
      step: "06",
      title: "Temporal Consistency Smoothing",
      desc: "To prevent false triggers from fleeting glances or background movement, a rolling temporal window requires consecutive positive matches across 3–5 frames before confirming presence.",
      code: "STAGE: 5-FRAME ROLLING FILTER",
    },
    {
      step: "07",
      title: "Postgres RLS Ledger Commit",
      desc: "Upon passing temporal verification, an attendance record is committed. Unique constraints prevent duplicate entries, and the student appears in the real-time verified ledger.",
      code: "STAGE: DATABASE COMMIT",
    },
    {
      step: "08",
      title: "Session Lock & Signed CSV Export",
      desc: "When lecture concludes, faculty locks the session. Attendance logs are immediately exportable as signed audit CSV spreadsheets containing student roll numbers, confidence scores, and timestamps.",
      code: "STAGE: DISK EXPORT",
    },
  ];

  return (
    <div className="bg-[#090909] text-[#F3F0E8] min-h-screen selection:bg-[#5C4612] selection:text-[#E3C283]">
      <LandingHeader />

      <main className="w-full pt-28 pb-16 px-5 lg:px-12 max-w-[1440px] mx-auto space-y-14">
        {/* Header */}
        <div className="space-y-3 border-b border-[#222220] pb-8">
          <Link
            href="/"
            className="inline-flex items-center font-mono text-[10px] text-[#929189] hover:text-[#E3C283] transition-colors uppercase"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            [ RETURN TO OVERVIEW ]
          </Link>
          <span className="font-mono text-[10px] text-[#E3C283] tracking-[0.25em] uppercase block">
            [ LIFECYCLE CHRONOLOGY // PROTOCOL SPEC ]
          </span>
          <h1 className="font-sans text-4xl md:text-5xl font-light text-[#ffffff] uppercase tracking-tight">
            HOW VEYRA WORKS
          </h1>
          <p className="font-sans text-base text-[#C9C7BD] max-w-3xl leading-relaxed">
            From sovereign 3-pose student enrollment to cryptographically audited lecture export,
            every operational milestone follows deterministic verification rails.
          </p>
        </div>

        {/* 8-Step Architectural Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workflowSteps.map((s) => (
            <div
              key={s.step}
              className="p-6 border border-[#222220] bg-[#0E0E0E] flex flex-col justify-between space-y-4 hover:border-[#E3C283]/60 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] px-2 py-0.5 bg-[#201F1F] border border-[#474740]/40 text-[#E3C283]">
                    {s.step}
                  </span>
                  <span className="font-mono text-[9px] text-[#929189] tracking-widest uppercase">
                    {s.code}
                  </span>
                </div>
                <h3 className="font-sans text-lg text-[#ffffff] font-normal leading-snug">
                  {s.title}
                </h3>
                <p className="font-sans text-xs text-[#C9C7BD] leading-relaxed">{s.desc}</p>
              </div>
              <div className="pt-2 border-t border-[#222220] flex items-center gap-1.5 font-mono text-[9px] text-[#E3C283]">
                <Check className="h-3 w-3" />
                <span>DETERMINISTIC VERIFICATION RAIL</span>
              </div>
            </div>
          ))}
        </div>

        {/* Action Callout */}
        <div className="p-8 border border-[#222220] bg-[#131313] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-sans text-xl text-[#ffffff] uppercase font-light">
              EXPERIENCE THE LIVE CONSOLE
            </h3>
            <p className="font-mono text-xs text-[#929189] mt-1">
              Initialize a live camera room to test face matching and temporal filtering.
            </p>
          </div>
          <Link href="/attendance/new">
            <Button variant="champagne" className="h-10 px-6 font-bold">
              LAUNCH CAMERA ROOM →
            </Button>
          </Link>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
