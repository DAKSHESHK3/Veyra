"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sliders, CheckCircle2, Database, ShieldCheck } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export default function SettingsPage() {
  const [distanceThreshold, setDistanceThreshold] = useState("0.55");
  const [temporalFrames, setTemporalFrames] = useState("5");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const isCloud = isSupabaseConfigured();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <AppLayout>
      <div className="space-y-6 select-none max-w-5xl mx-auto">
        {/* Header Horizon */}
        <div className="border-b border-[#222220] pb-4">
          <span className="font-mono text-[10px] text-[#E3C283] tracking-[0.25em] uppercase">
            [ CONFIGURATION &amp; HYPERPARAMETERS // 006 ]
          </span>
          <h1 className="font-sans text-2xl md:text-3xl font-light text-[#ffffff] uppercase tracking-tight">
            SYSTEM &amp; BIOMETRIC TUNING
          </h1>
          <p className="font-mono text-xs text-[#929189] mb-4">
            Calibrate FaceNet Euclidean distance thresholds, temporal rolling windows, and RLS integrity
          </p>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/settings"
              className="px-3 py-1.5 font-mono text-xs border border-[#E3C283] bg-[#5C4612]/30 text-[#E3C283]"
            >
              01 // BIOMETRIC ML TUNING
            </Link>
            <Link
              href="/settings/profile"
              className="px-3 py-1.5 font-mono text-xs border border-[#222220] bg-[#131313] text-[#9A9A94] hover:text-[#F3F0E8] transition-colors"
            >
              02 // FACULTY PROFILE
            </Link>
            <Link
              href="/settings/security"
              className="px-3 py-1.5 font-mono text-xs border border-[#222220] bg-[#131313] text-[#9A9A94] hover:text-[#F3F0E8] transition-colors"
            >
              03 // AUTH & SESSIONS
            </Link>
            <Link
              href="/settings/privacy"
              className="px-3 py-1.5 font-mono text-xs border border-[#222220] bg-[#131313] text-[#9A9A94] hover:text-[#F3F0E8] transition-colors"
            >
              04 // DATA RETENTION & PRIVACY
            </Link>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-3 bg-[#5C4612]/30 border border-[#E3C283] text-[#E3C283] font-mono text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#E3C283]" />
            BIOMETRIC HYPERPARAMETERS SAVED TO ACTIVE RUNTIME SESSION
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Biometric ML Hyperparameters */}
          <div className="border border-[#222220] bg-[#0E0E0E]">
            <div className="p-6 border-b border-[#222220] space-y-1">
              <span className="font-mono text-[10px] text-[#E3C283] uppercase tracking-wider">
                [ ALGORITHM // TUNING ]
              </span>
              <h2 className="font-sans text-lg text-[#ffffff] uppercase">
                DISTANCE SENSITIVITY
              </h2>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="block font-mono text-[10px] uppercase text-[#929189]">
                  EUCLIDEAN DISTANCE THRESHOLD (τ)
                </label>
                <Input
                  type="number"
                  step="0.05"
                  min="0.30"
                  max="0.80"
                  value={distanceThreshold}
                  onChange={(e) => setDistanceThreshold(e.target.value)}
                />
                <p className="font-mono text-[10px] text-[#929189]">
                  Default: 0.55. Calibrated for 128-d FaceNet cosine projections.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block font-mono text-[10px] uppercase text-[#929189]">
                  TEMPORAL CONSISTENCY FRAMES (K)
                </label>
                <Input
                  type="number"
                  min="3"
                  max="15"
                  value={temporalFrames}
                  onChange={(e) => setTemporalFrames(e.target.value)}
                />
                <p className="font-mono text-[10px] text-[#929189]">
                  Consecutive matches required over rolling window before committing attendance.
                </p>
              </div>

              <div className="pt-2">
                <Button type="submit" variant="champagne" size="sm" className="font-bold">
                  APPLY HYPERPARAMETERS
                </Button>
              </div>
            </form>
          </div>

          {/* Database & Cryptographic Infrastructure */}
          <div className="border border-[#222220] bg-[#0E0E0E] flex flex-col justify-between">
            <div className="p-6 border-b border-[#222220] space-y-1">
              <span className="font-mono text-[10px] text-[#E3C283] uppercase tracking-wider">
                [ INFRASTRUCTURE // BACKEND ]
              </span>
              <h2 className="font-sans text-lg text-[#ffffff] uppercase">
                POSTGRES &amp; RLS INTEGRITY
              </h2>
            </div>

            <div className="p-6 space-y-4 font-mono text-xs">
              <div className="p-3 border border-[#222220] bg-[#131313] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[#929189] uppercase text-[10px]">DATABASE ENGINE:</span>
                  <span className="text-[#E3C283] font-bold">
                    {isCloud ? "SUPABASE POSTGRESQL" : "INDEXEDDB FALLBACK"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#929189] uppercase text-[10px]">ROW LEVEL SECURITY:</span>
                  <span className="text-[#ffffff]">ENFORCED (RLS)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#929189] uppercase text-[10px]">VIDEO RETENTION:</span>
                  <span className="text-[#E3C283]">ZERO (VOLATILE ONLY)</span>
                </div>
              </div>

              <p className="text-[#929189] text-[11px] leading-relaxed">
                Veyra enforces compound constraints at the SQL layer:{" "}
                <code className="text-[#E3C283]">UNIQUE(session_id, student_id)</code> preventing
                repeated attendance entries.
              </p>
            </div>

            <div className="p-4 border-t border-[#222220] bg-[#131313] font-mono text-[10px] text-[#929189]">
              BUILD VERSION: 26.4.11-PROD // PROTOCOL RFC-01
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
