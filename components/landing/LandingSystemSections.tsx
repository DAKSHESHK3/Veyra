import React from "react";
import { Check } from "lucide-react";

export function LandingSystemSections() {
  return (
    <section id="system" className="w-full max-w-[1440px] mx-auto px-5 lg:px-12 py-16 space-y-12">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#222220] pb-4 gap-2">
        <div className="space-y-1">
          <span className="font-mono text-[11px] text-[#E3C283] tracking-[0.25em] uppercase">
            [ THE SYSTEM / 01 — 03 ]
          </span>
          <h2 className="font-sans text-2xl md:text-3xl text-[#ffffff] tracking-tight font-light">
            TRIPLE-TIER BIOMETRIC CERTAINTY
          </h2>
        </div>
        <span className="font-mono text-[9px] text-[#929189] tracking-[0.2em] uppercase">
          MATHEMATICAL VERIFICATION ARCHITECTURE
        </span>
      </div>

      {/* 01 RECOGNIZE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 border border-[#222220] bg-[#0E0E0E]">
        <div className="lg:col-span-5 p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#222220]">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] px-2 py-0.5 bg-[#201F1F] border border-[#474740]/40 text-[#E3C283]">
                01
              </span>
              <span className="font-mono text-[11px] text-[#929189] uppercase tracking-[0.2em]">
                IN-BROWSER DEEP METRICS
              </span>
            </div>
            <h3 className="font-sans text-2xl text-[#ffffff] font-normal leading-snug">
              Your camera becomes the interface.
            </h3>
            <p className="font-sans text-sm text-[#C9C7BD] leading-relaxed">
              Biometric 128-d feature embeddings are computed locally on your device via WebGL. Your
              raw camera stream never leaves your browser tab, ensuring cryptographic
              confidentiality from source to vector calculation.
            </p>
          </div>
          <div className="mt-8 pt-4 border-t border-[#222220] font-mono text-[9px] text-[#929189] tracking-[0.16em] uppercase">
            FACENET COMPATIBLE • LOCAL SHADER PIPELINE • NO PYTHON / OPENCV DAEMON
          </div>
        </div>

        {/* Visualization panel for 01 */}
        <div className="lg:col-span-7 bg-[#0E0E0E] p-6 relative flex flex-col justify-center min-h-[320px]">
          <div className="relative w-full h-full min-h-[260px] bg-[#131313] border border-[#222220] flex flex-col justify-between p-4 overflow-hidden">
            <div className="flex items-center justify-between text-[#929189] font-mono text-[9px]">
              <span>[ SENSOR_STREAM: IN-MEMORY BUFFER ]</span>
              <span className="text-[#E3C283]">128-D EMBEDDER ACTIVE</span>
            </div>

            {/* Viewfinder Target Reticle */}
            <div className="my-auto mx-auto w-44 h-44 relative border border-[#E3C283]/30 flex items-center justify-center">
              <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#E3C283]" />
              <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[#E3C283]" />
              <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-[#E3C283]" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-[#E3C283]" />
              <div className="w-full h-0.5 bg-[#E3C283]/30 absolute top-1/2 -translate-y-1/2" />
              <div className="h-full w-0.5 bg-[#E3C283]/30 absolute left-1/2 -translate-x-1/2" />
              <div className="w-14 h-14 rounded-full border border-[#E3C283]/50 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E3C283]" />
              </div>
              <span className="absolute bottom-2 font-mono text-[9px] text-[#E3C283] tracking-widest">
                ECL: 0.0412
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-2 font-mono text-[9px] text-[#9A9A94] border-t border-[#222220]">
              <div>D_01: +0.4819</div>
              <div>D_02: -0.1984</div>
              <div>D_03: +0.8901</div>
              <div>D_128: -0.0124</div>
            </div>
          </div>
        </div>
      </div>

      {/* 02 VERIFY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 border border-[#222220] bg-[#0E0E0E]">
        <div className="lg:col-span-5 p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#222220]">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] px-2 py-0.5 bg-[#201F1F] border border-[#474740]/40 text-[#E3C283]">
                02
              </span>
              <span className="font-mono text-[11px] text-[#929189] uppercase tracking-[0.2em]">
                TEMPORAL SMOOTHING
              </span>
            </div>
            <h3 className="font-sans text-2xl text-[#ffffff] font-normal leading-snug">
              Presence is never decided from a single frame.
            </h3>
            <p className="font-sans text-sm text-[#C9C7BD] leading-relaxed">
              Multi-frame rolling consistency algorithm prevents transient false-positives, glance
              vectors, or optical spoofing. Presence is acknowledged solely when consecutive
              mathematical vectors maintain delta coherence beyond θ threshold.
            </p>
          </div>
          <div className="mt-8 pt-4 border-t border-[#222220] font-mono text-[9px] text-[#929189] tracking-[0.16em] uppercase">
            ROLLING HORIZON • L2 COSINE SIMILARITY • ZERO LATENT GHOSTING
          </div>
        </div>

        {/* Visualization panel for 02: Rolling Horizon Matrix */}
        <div className="lg:col-span-7 bg-[#0E0E0E] p-6 flex flex-col justify-center">
          <div className="bg-[#131313] border border-[#222220] p-6 space-y-4">
            <div className="flex justify-between items-center text-[#929189] font-mono text-[9px] uppercase">
              <span>TEMPORAL PIPELINE: 5-FRAME INTEGRITY BUFFER</span>
              <span className="text-[#E3C283]">COHERENCE ACHIEVED</span>
            </div>

            {/* Frame steps */}
            <div className="grid grid-cols-5 gap-2">
              <div className="p-2 bg-[#0E0E0E] border border-[#222220] flex flex-col items-center">
                <span className="font-mono text-[9px] text-[#929189]">t - 4</span>
                <span className="font-mono text-[11px] text-[#C9C7BD] mt-1">0.89</span>
                <div className="w-full bg-[#201F1F] h-1 mt-2">
                  <div className="bg-[#929189] h-1 w-[89%]" />
                </div>
              </div>
              <div className="p-2 bg-[#0E0E0E] border border-[#222220] flex flex-col items-center">
                <span className="font-mono text-[9px] text-[#929189]">t - 3</span>
                <span className="font-mono text-[11px] text-[#C9C7BD] mt-1">0.93</span>
                <div className="w-full bg-[#201F1F] h-1 mt-2">
                  <div className="bg-[#929189] h-1 w-[93%]" />
                </div>
              </div>
              <div className="p-2 bg-[#0E0E0E] border border-[#222220] flex flex-col items-center">
                <span className="font-mono text-[9px] text-[#929189]">t - 2</span>
                <span className="font-mono text-[11px] text-[#C9C7BD] mt-1">0.96</span>
                <div className="w-full bg-[#201F1F] h-1 mt-2">
                  <div className="bg-[#E3C283]/70 h-1 w-[96%]" />
                </div>
              </div>
              <div className="p-2 bg-[#0E0E0E] border border-[#222220] flex flex-col items-center">
                <span className="font-mono text-[9px] text-[#929189]">t - 1</span>
                <span className="font-mono text-[11px] text-[#E3C283] mt-1">0.98</span>
                <div className="w-full bg-[#201F1F] h-1 mt-2">
                  <div className="bg-[#E3C283] h-1 w-[98%]" />
                </div>
              </div>
              <div className="p-2 bg-[#5C4612]/30 border border-[#E3C283] flex flex-col items-center">
                <span className="font-mono text-[9px] text-[#E3C283] font-bold">t (NOW)</span>
                <span className="font-mono text-[11px] text-[#E3C283] font-bold mt-1">0.99</span>
                <div className="w-full bg-[#5C4612] h-1 mt-2">
                  <div className="bg-[#E3C283] h-1 w-[100%]" />
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#0E0E0E] border border-[#E3C283]/40 flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-[11px] text-[#ffffff]">
                <Check className="h-4 w-4 text-[#E3C283]" />
                <span>CONFIRMATION: BIOMETRIC PRESENCE ASSIGNED</span>
              </div>
              <span className="font-mono text-[9px] text-[#E3C283] uppercase tracking-[0.2em]">
                THRESHOLD: 0.950 MET
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 03 RECORD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 border border-[#222220] bg-[#0E0E0E]">
        <div className="lg:col-span-5 p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#222220]">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] px-2 py-0.5 bg-[#201F1F] border border-[#474740]/40 text-[#E3C283]">
                03
              </span>
              <span className="font-mono text-[11px] text-[#929189] uppercase tracking-[0.2em]">
                IMMUTABLE AUDIT
              </span>
            </div>
            <h3 className="font-sans text-2xl text-[#ffffff] font-normal leading-snug">
              Every verified presence becomes an auditable event.
            </h3>
            <p className="font-sans text-sm text-[#C9C7BD] leading-relaxed">
              Postgres Row Level Security enforces relational integrity, dual-tier role authorization
              (Institutional Admin vs Department Faculty), and immutable duplicate attendance
              prevention via database-level unique indexing.
            </p>
          </div>
          <div className="mt-8 pt-4 border-t border-[#222220] font-mono text-[9px] text-[#929189] tracking-[0.16em] uppercase">
            CONSTRAINT: UNIQUE(session_id, student_id) • RLS ENABLED • INSTANT CSV EXPORT
          </div>
        </div>

        {/* Visualization panel for 03: Relational Schema Inspector */}
        <div className="lg:col-span-7 bg-[#0E0E0E] p-6 flex flex-col justify-center">
          <div className="bg-[#131313] border border-[#222220] p-4 font-mono text-[11px] space-y-2.5">
            <div className="flex items-center justify-between text-[#929189] border-b border-[#222220] pb-2">
              <span className="text-[#ffffff] font-bold">SQL RLS PROTOCOL SCHEMA</span>
              <span className="text-[#E3C283]">ENFORCED</span>
            </div>
            <div className="text-[#C9C7BD] space-y-1 leading-relaxed text-xs">
              <p>
                <span className="text-[#E3C283]">CREATE TABLE</span> public.attendance_logs (
              </p>
              <p className="pl-4">
                id <span className="text-[#929189]">uuid PRIMARY KEY DEFAULT gen_random_uuid(),</span>
              </p>
              <p className="pl-4">
                session_id{" "}
                <span className="text-[#929189]">
                  uuid REFERENCES public.sessions ON DELETE CASCADE,
                </span>
              </p>
              <p className="pl-4">
                student_id <span className="text-[#929189]">uuid REFERENCES public.students,</span>
              </p>
              <p className="pl-4">
                confidence_score{" "}
                <span className="text-[#E3C283]">
                  numeric(4,3) CHECK (confidence_score &gt;= 0.950),
                </span>
              </p>
              <p className="pl-4">
                verified_at{" "}
                <span className="text-[#929189]">timestamptz DEFAULT clock_timestamp(),</span>
              </p>
              <p className="pl-4 text-[#E3C283]">
                CONSTRAINT uq_session_student UNIQUE(session_id, student_id)
              </p>
              <p>);</p>
              <p className="text-[#474740] pt-1">-- ENABLE ROW LEVEL SECURITY;</p>
              <p className="text-[#E3C283]">
                ALTER TABLE public.attendance_logs ENABLE ROW LEVEL SECURITY;
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
