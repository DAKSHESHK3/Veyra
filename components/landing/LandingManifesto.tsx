import React from "react";

export function LandingManifesto() {
  return (
    <section className="w-full bg-[#131313] border-y border-[#222220] py-14">
      <div className="max-w-[1440px] mx-auto px-5 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 flex flex-col justify-between">
          <span className="font-mono text-[11px] text-[#E3C283] uppercase tracking-[0.25em]">
            [ PHILOSOPHICAL FOUNDATION ]
          </span>
          <div className="font-mono text-[9px] text-[#929189] tracking-[0.2em] mt-6 lg:mt-0 uppercase">
            PROTOCOL 01 — ARCHITECTURAL CERTAINTY
          </div>
        </div>
        <div className="lg:col-span-8 flex flex-col space-y-4">
          <h2 className="font-sans text-2xl md:text-3xl text-[#ffffff] tracking-tight font-light leading-snug">
            “ATTENDANCE SHOULD FEEL INVISIBLE.”
          </h2>
          <p className="font-sans text-base text-[#C9C7BD] max-w-3xl leading-relaxed">
            Veyra removes the friction between entering a room and being counted. Transitioning the
            original OpenCV/Keras prototype into a resilient, production-ready enterprise platform,
            we eliminate hardware dongles, Python installations, and paper manifests. Mathematical
            vectors are computed silently where the light strikes the silicon.
          </p>
        </div>
      </div>
    </section>
  );
}
