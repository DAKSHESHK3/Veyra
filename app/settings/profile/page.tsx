"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { User, Shield, Building, Mail, Save, CheckCircle2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

export default function ProfileSettingsPage() {
  const [name, setName] = useState("Faculty Administrator");
  const [email, setEmail] = useState("admin@veyra.internal");
  const [role, setRole] = useState("ADMIN // FACULTY_LEAD");
  const [institution, setInstitution] = useState("Rajasthan Technical University (RTU)");
  const [department, setDepartment] = useState("Computer Science & Engineering");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadUser() {
      if (isSupabaseConfigured() && supabase) {
        const { data } = await supabase.auth.getUser();
        if (data?.user?.email) {
          setEmail(data.user.email);
        }
      }
    }
    loadUser();
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Settings Navigation Bar */}
        <div className="border-b border-[#222220] pb-4">
          <div className="font-mono text-[10px] text-[#E3C283] uppercase tracking-[0.25em] mb-1">
            CONTROL CONSOLE // SYSTEM CONFIGURATION
          </div>
          <h1 className="text-2xl font-light text-[#F3F0E8] tracking-tight mb-4">
            Security & Identity Preferences
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
              className="px-3 py-1.5 font-mono text-xs border border-[#E3C283] bg-[#5C4612]/30 text-[#E3C283]"
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

        {saved && (
          <div className="p-3 bg-[#5C4612]/30 border border-[#E3C283] text-[#E3C283] font-mono text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            OPERATOR PROFILE PREFERENCES PERSISTED TO ACTIVE SESSION
          </div>
        )}

        <div className="border border-[#222220] bg-[#0E0E0E] p-8">
          <div className="mb-6 border-b border-[#222220] pb-4">
            <span className="font-mono text-[10px] text-[#E3C283] uppercase tracking-widest block mb-1">
              [ OPERATOR IDENTITY RECORD ]
            </span>
            <h2 className="text-lg font-light text-[#F3F0E8] uppercase">
              Authenticated Node Profile
            </h2>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[#9A9A94] mb-2">
                  FULL LEGAL NAME
                </label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-[#131313] border-[#222220] text-[#F3F0E8] focus:border-[#E3C283] font-sans"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[#9A9A94] mb-2">
                  AUTHENTICATED EMAIL
                </label>
                <Input
                  type="email"
                  value={email}
                  disabled
                  className="bg-[#131313] border-[#222220] text-[#9A9A94] font-mono cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[#9A9A94] mb-2">
                  ROLE & CLEARANCE
                </label>
                <Input
                  type="text"
                  value={role}
                  disabled
                  className="bg-[#131313] border-[#222220] text-[#E3C283] font-mono cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[#9A9A94] mb-2">
                  ACADEMIC DEPARTMENT
                </label>
                <Input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="bg-[#131313] border-[#222220] text-[#F3F0E8] focus:border-[#E3C283] font-sans"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-[11px] uppercase tracking-wider text-[#9A9A94] mb-2">
                AFFILIATED INSTITUTION
              </label>
              <Input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="bg-[#131313] border-[#222220] text-[#F3F0E8] focus:border-[#E3C283] font-sans"
              />
            </div>

            <div className="pt-4 border-t border-[#222220] flex justify-end">
              <Button type="submit" variant="champagne" className="font-mono text-xs uppercase">
                <Save className="w-3.5 h-3.5 mr-1.5" /> COMMIT PROFILE CHANGES
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
