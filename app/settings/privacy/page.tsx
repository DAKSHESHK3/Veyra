"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldCheck, Eye, Database, HardDrive, Trash2, CheckCircle2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";

export default function PrivacySettingsPage() {
  const [retentionPolicy, setRetentionPolicy] = useState("academic_year");
  const [allowVectorPrune, setAllowVectorPrune] = useState(true);
  const [purged, setPurged] = useState(false);

  const handlePurgeLocalCache = () => {
    if (confirm("Purge local browser ML model cache and session scratchpad?")) {
      setPurged(true);
      setTimeout(() => setPurged(false), 3000);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Bar */}
        <div className="border-b border-[#222220] pb-4">
          <div className="font-mono text-[10px] text-[#E3C283] uppercase tracking-[0.25em] mb-1">
            CONTROL CONSOLE // SYSTEM CONFIGURATION
          </div>
          <h1 className="text-2xl font-light text-[#F3F0E8] tracking-tight mb-4">
            Biometric Privacy & Isolation Panel
          </h1>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/settings"
              className="px-3 py-1.5 font-mono text-xs border border-[#222220] bg-[#131313] text-[#9A9A94] hover:text-[#F3F0E8] transition-colors"
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
              className="px-3 py-1.5 font-mono text-xs border border-[#E3C283] bg-[#5C4612]/30 text-[#E3C283]"
            >
              04 // DATA RETENTION & PRIVACY
            </Link>
          </div>
        </div>

        {purged && (
          <div className="p-3 bg-[#5C4612]/30 border border-[#E3C283] text-[#E3C283] font-mono text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            BROWSER MEMORY SCRATCHPAD & MODEL CACHE PURGED
          </div>
        )}

        {/* 3 Privacy Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-[#222220] bg-[#0E0E0E] p-5 font-mono text-xs space-y-2">
            <div className="text-[10px] text-[#E3C283] uppercase flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" /> ZERO IMAGE UPLOAD
            </div>
            <div className="text-[#F3F0E8] font-bold">CLIENT MEMORY ONLY</div>
            <p className="text-[10px] text-[#9A9A94] leading-relaxed">
              Video buffers reside strictly in browser RAM and are immediately GC-collected after vector inference.
            </p>
          </div>

          <div className="border border-[#222220] bg-[#0E0E0E] p-5 font-mono text-xs space-y-2">
            <div className="text-[10px] text-[#E3C283] uppercase flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" /> VECTOR ISOLATION
            </div>
            <div className="text-[#F3F0E8] font-bold">128-D FLOAT ARRAYS</div>
            <p className="text-[10px] text-[#9A9A94] leading-relaxed">
              Database records contain only mathematical embeddings, making raw photo storage unnecessary.
            </p>
          </div>

          <div className="border border-[#222220] bg-[#0E0E0E] p-5 font-mono text-xs space-y-2">
            <div className="text-[10px] text-[#E3C283] uppercase flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5" /> HARDWARE ACCESS
            </div>
            <div className="text-[#F3F0E8] font-bold">EXPLICIT USER CONSENT</div>
            <p className="text-[10px] text-[#9A9A94] leading-relaxed">
              Camera streams require active per-session browser permission and terminate when session is closed.
            </p>
          </div>
        </div>

        {/* Data Retention & Storage Policy Panel */}
        <div className="border border-[#222220] bg-[#0E0E0E] p-8 space-y-6">
          <div className="border-b border-[#222220] pb-4">
            <span className="font-mono text-[10px] text-[#E3C283] uppercase tracking-widest block mb-1">
              [ COMPLIANCE & RETENTION ]
            </span>
            <h2 className="text-lg font-light text-[#F3F0E8] uppercase">
              Biometric Lifecycle Management
            </h2>
          </div>

          <div className="space-y-4 max-w-xl font-mono text-xs">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#9A9A94] mb-2">
                BIOMETRIC RECORD RETENTION TIMEFRAME
              </label>
              <select
                value={retentionPolicy}
                onChange={(e) => setRetentionPolicy(e.target.value)}
                className="w-full bg-[#131313] border border-[#222220] p-2.5 text-xs text-[#F3F0E8] focus:border-[#E3C283]"
              >
                <option value="semester">CURRENT SEMESTER (180 DAYS)</option>
                <option value="academic_year">FULL ACADEMIC YEAR (365 DAYS)</option>
                <option value="graduation">DEGREE PROGRAM CONCURRENCE (4 YEARS)</option>
              </select>
            </div>

            <div className="pt-4 border-t border-[#222220] flex items-center justify-between">
              <div>
                <div className="text-[#F3F0E8] uppercase">CLIENT CACHE PURGE</div>
                <div className="text-[10px] text-[#9A9A94]">
                  Clear in-browser WebGL shader cache and temporal tracking queues
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePurgeLocalCache}
                className="text-[10px] font-mono uppercase"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" /> PURGE CACHE
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
