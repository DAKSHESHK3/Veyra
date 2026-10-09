import React from "react";

export function LandingFaq() {
  const specs = [
    {
      code: "SPEC // 001",
      q: "Do I need to install Python, OpenCV, or Tkinter?",
      a: "No. The entire system is built on modern web primitives. Inference executes client-side via WebGL 2.0 shaders and WebAssembly. No local Python interpreter, GPU drivers, or terminal commands are necessary.",
      tag: "ZERO RUNTIME FOOTPRINT",
    },
    {
      code: "SPEC // 002",
      q: "Are video frames uploaded to an external server?",
      a: "Never. Camera sensor frames are strictly retained in ephemeral browser RAM for matrix manipulation and instantly discarded. Only irreversible 128-float mathematical vectors and timestamp records ever reach the database.",
      tag: "AIR-GAPPED SENSOR FRAMES",
    },
    {
      code: "SPEC // 003",
      q: "Can a student be marked present twice in a lecture?",
      a: "Impossible. The front-end memory bus buffers already-identified UUIDs to prevent repeated trigger pings, while Postgres enforces a compound primary constraint UNIQUE(session_id, student_id) at the database layer.",
      tag: "RELATIONAL INTEGRITY ENFORCED",
    },
  ];

  return (
    <section className="w-full max-w-[1440px] mx-auto px-5 lg:px-12 py-16 space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#222220] pb-4 gap-2">
        <div className="space-y-1">
          <span className="font-mono text-[11px] text-[#E3C283] tracking-[0.25em] uppercase">
            [ TECHNICAL RIGOR ]
          </span>
          <h2 className="font-sans text-2xl md:text-3xl text-[#ffffff] tracking-tight font-light">
            SYSTEM SPECIFICATIONS &amp; FAQ
          </h2>
        </div>
        <span className="font-mono text-[9px] text-[#929189] tracking-[0.2em] uppercase">
          RFC • PROTOCOL ASSURANCE
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {specs.map((spec) => (
          <div
            key={spec.code}
            className="p-6 bg-[#131313] border border-[#222220] flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="font-mono text-[11px] text-[#E3C283] uppercase">{spec.code}</div>
              <h4 className="font-sans text-base text-[#ffffff] font-medium leading-snug">
                {spec.q}
              </h4>
              <p className="font-sans text-xs text-[#C9C7BD] leading-relaxed">{spec.a}</p>
            </div>
            <div className="font-mono text-[9px] text-[#929189] pt-3 border-t border-[#222220]">
              {spec.tag}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
