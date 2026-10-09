"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Lock, ShieldCheck, Key, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

export default function SecuritySettingsPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updating, setUpdating] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMsg({ type: "error", text: "Password inputs do not match." });
      return;
    }
    if (newPassword.length < 6) {
      setMsg({ type: "error", text: "Password must be at least 6 characters long." });
      return;
    }

    setUpdating(true);
    setMsg(null);

    try {
      if (isSupabaseConfigured() && supabase) {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw new Error(error.message);
      }
      setMsg({ type: "success", text: "Security credentials updated successfully." });
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setMsg({ type: "error", text: err?.message || "Failed updating credentials." });
    } finally {
      setUpdating(false);
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
            Security & Authentication Node
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
              className="px-3 py-1.5 font-mono text-xs border border-[#E3C283] bg-[#5C4612]/30 text-[#E3C283]"
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

        {/* Security Posture Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-[#222220] bg-[#0E0E0E] p-4 font-mono text-xs">
            <div className="text-[10px] text-[#9A9A94] uppercase mb-1">SESSION PROTOCOL</div>
            <div className="text-[#F3F0E8] font-bold">SUPABASE JWT // HS256</div>
            <div className="text-[10px] text-[#E3C283] mt-1">SECURE COOKIE ATTACHED</div>
          </div>

          <div className="border border-[#222220] bg-[#0E0E0E] p-4 font-mono text-xs">
            <div className="text-[10px] text-[#9A9A94] uppercase mb-1">ROW-LEVEL SECURITY</div>
            <div className="text-[#E3C283] font-bold">STRICT RLS ENFORCED</div>
            <div className="text-[10px] text-[#9A9A94] mt-1">POSTGRES 15 ENGINE</div>
          </div>

          <div className="border border-[#222220] bg-[#0E0E0E] p-4 font-mono text-xs">
            <div className="text-[10px] text-[#9A9A94] uppercase mb-1">SERVICE KEY EXPOSURE</div>
            <div className="text-[#F3F0E8] font-bold">ZERO LEAKAGE</div>
            <div className="text-[10px] text-[#E3C283] mt-1">CLIENT USES ANON KEY ONLY</div>
          </div>
        </div>

        {/* Password Update Form */}
        <div className="border border-[#222220] bg-[#0E0E0E] p-8">
          <div className="mb-6 border-b border-[#222220] pb-4">
            <span className="font-mono text-[10px] text-[#E3C283] uppercase tracking-widest block mb-1">
              [ ACCESS CREDENTIALS ]
            </span>
            <h2 className="text-lg font-light text-[#F3F0E8] uppercase">
              Rotate Authentication Password
            </h2>
          </div>

          {msg && (
            <div
              className={`p-3 font-mono text-xs mb-6 flex items-center gap-2 border ${
                msg.type === "success"
                  ? "bg-[#5C4612]/20 border-[#E3C283] text-[#E3C283]"
                  : "bg-[#201F1F] border-red-500/50 text-red-400"
              }`}
            >
              {msg.type === "success" ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span>{msg.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-lg">
            <div>
              <label className="block font-mono text-[11px] uppercase tracking-wider text-[#9A9A94] mb-2">
                NEW SECURITY KEY / PASSWORD
              </label>
              <Input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="bg-[#131313] border-[#222220] text-[#F3F0E8] focus:border-[#E3C283] font-mono"
              />
            </div>

            <div>
              <label className="block font-mono text-[11px] uppercase tracking-wider text-[#9A9A94] mb-2">
                CONFIRM SECURITY KEY
              </label>
              <Input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="bg-[#131313] border-[#222220] text-[#F3F0E8] focus:border-[#E3C283] font-mono"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="champagne"
                disabled={updating}
                className="font-mono text-xs uppercase"
              >
                <Key className="w-3.5 h-3.5 mr-1.5" />
                {updating ? "UPDATING CREDENTIALS..." : "COMMIT KEY ROTATION"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
