"use client";

import React, { useState } from "react";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingManifesto } from "@/components/landing/LandingManifesto";
import { LandingSystemSections } from "@/components/landing/LandingSystemSections";
import { LandingPrivacySchematic } from "@/components/landing/LandingPrivacySchematic";
import { LandingConsolePreview } from "@/components/landing/LandingConsolePreview";
import { LandingWorkflow } from "@/components/landing/LandingWorkflow";
import { LandingFaq } from "@/components/landing/LandingFaq";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingDemoModal } from "@/components/landing/LandingDemoModal";

export default function LandingPage() {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <div className="bg-[#090909] text-[#F3F0E8] min-h-screen selection:bg-[#5C4612] selection:text-[#E3C283]">
      {/* Sticky Architectural Header */}
      <LandingHeader />

      {/* Main Content Spine */}
      <main className="w-full pt-16 bg-[#090909]">
        <div className="flex flex-col w-full text-[#F3F0E8]">
          {/* Hero Section */}
          <LandingHero onOpenDemo={() => setDemoOpen(true)} />

          {/* Philosophical Manifesto */}
          <LandingManifesto />

          {/* The System: 01 Recognize, 02 Verify, 03 Record */}
          <LandingSystemSections />

          {/* Cryptographic Sanctity: Privacy & Isolation Schematic */}
          <LandingPrivacySchematic />

          {/* Live Interactive Attendance Console */}
          <LandingConsolePreview />

          {/* 6-Step Vertical Workflow Narrative */}
          <LandingWorkflow />

          {/* Technical Rigor: RFC Specs & FAQ */}
          <LandingFaq />

          {/* Enterprise Invitation & Footer */}
          <LandingFooter />
        </div>
      </main>

      {/* Interactive System Demo Modal */}
      <LandingDemoModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}
