import React from "react";

export function LandingWorkflow() {
  const steps = [
    {
      num: "01 / ENROLLMENT",
      title: "Register Student",
      desc: "Provision unique roll identifier, institutional department, course batch, and access tier with strict database uniqueness validation.",
      stage: "[ STAGE: SEEDING ]",
    },
    {
      num: "02 / CALIBRATION",
      title: "3-Pose Capture",
      desc: "In-browser guided wizard samples frontal, left 15°, and right 15° poses, evaluating ambient illumination before computing centroid vectors.",
      stage: "[ STAGE: CENTROID CALC ]",
    },
    {
      num: "03 / INFERENCE",
      title: "Real-Time Recognize",
      desc: "On faculty session initialization, browser opens camera stream. Local WebGL pipeline processes incoming video frames at zero cloud bandwidth.",
      stage: "[ STAGE: ACTIVE MATRIX ]",
    },
    {
      num: "04 / FILTER",
      title: "Temporal Verification",
      desc: "Multi-frame rolling consistency algorithm filters spurious blinks, occlusions, and peripheral false positives over a 500ms sliding horizon.",
      stage: "[ STAGE: TEMPORAL FILTER ]",
    },
    {
      num: "05 / PERSISTENCE",
      title: "Enforce Constraints",
      desc: "Unique constraint UNIQUE(session_id, student_id) prevents accidental or malicious double entries permanently at database layer.",
      stage: "[ STAGE: POSTGRES RLS ]",
    },
    {
      num: "06 / AUDIT",
      title: "Lock & Longitudinal Export",
      desc: "Session is mathematically sealed. Faculty exports signed CSV audit trails and reviews semester longitudinal attendance trends immediately.",
      stage: "[ STAGE: DISK ARCHIVE ]",
    },
  ];

  return (
    <section id="how-it-works" className="w-full bg-[#1C1B1B] border-y border-[#222220] py-16">
      <div className="max-w-[1440px] mx-auto px-5 lg:px-12 space-y-12">
        <div className="max-w-2xl space-y-2">
          <span className="font-mono text-[11px] text-[#E3C283] uppercase tracking-[0.25em]">
            [ LIFECYCLE CHRONOLOGY ]
          </span>
          <h2 className="font-sans text-3xl md:text-4xl text-[#ffffff] tracking-tight font-light">
            SYSTEM WORKFLOW
          </h2>
          <p className="font-sans text-sm text-[#C9C7BD]">
            From sovereign student enrollment to cryptographically sealed export, every operational
            milestone follows deterministic verification rails.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {steps.map((st) => (
            <div
              key={st.num}
              className="p-6 bg-[#201F1F] border border-[#222220] flex flex-col justify-between space-y-4 hover:border-[#474740] transition-colors"
            >
              <div className="space-y-2">
                <span className="font-mono text-[11px] text-[#E3C283]">{st.num}</span>
                <h4 className="font-sans text-base text-[#ffffff] font-medium">{st.title}</h4>
                <p className="font-sans text-xs text-[#C9C7BD] leading-relaxed">{st.desc}</p>
              </div>
              <span className="font-mono text-[9px] text-[#929189] tracking-widest uppercase">
                {st.stage}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
