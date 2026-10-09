"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VeyraMark } from "@/components/visuals/VeyraMark";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSupabaseConfigured() && supabase) {
        const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (resetErr) throw resetErr;
      }
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message || "Failed to initiate password reset.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090909] text-[#F3F0E8] flex flex-col justify-center items-center p-4 selection:bg-[#5C4612] selection:text-[#E3C283]">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2 flex flex-col items-center">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <VeyraMark size={32} />
            <span className="font-sans font-medium text-lg tracking-[0.2em] text-[#F3F0E8] group-hover:text-[#E3C283] transition-colors">
              VEYRA
            </span>
          </Link>
          <span className="font-mono text-[9px] text-[#E3C283] uppercase tracking-[0.3em]">
            KEY RECOVERY PROTOCOL
          </span>
        </div>

        <div className="border border-[#222220] bg-[#0E0E0E]">
          <div className="p-6 border-b border-[#222220] space-y-1">
            <span className="font-mono text-[10px] text-[#E3C283] uppercase tracking-wider">
              [ ACCESS RECOVERY ]
            </span>
            <h2 className="font-sans text-xl text-[#ffffff] uppercase tracking-tight">
              RESET PASSWORD
            </h2>
          </div>

          <div className="p-6 space-y-4">
            {submitted ? (
              <div className="space-y-4 text-center py-4">
                <CheckCircle2 className="h-8 w-8 text-[#E3C283] mx-auto" />
                <div className="space-y-1">
                  <h3 className="font-sans text-sm text-[#ffffff] uppercase font-bold">
                    RECOVERY TOKEN DISPATCHED
                  </h3>
                  <p className="font-mono text-xs text-[#9A9A94]">
                    If an account exists for <span className="text-[#E3C283]">{email}</span>, a
                    secure recovery link has been dispatched.
                  </p>
                </div>
                <Link href="/login" className="block pt-2">
                  <Button variant="outline" className="w-full text-xs">
                    RETURN TO AUTHENTICATION
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 border border-[#FFB4AB]/40 bg-[#93000A]/30 text-[#FFB4AB] font-mono text-xs">
                    {error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block font-mono text-[10px] uppercase text-[#9A9A94] tracking-wider">
                    INSTITUTIONAL EMAIL
                  </label>
                  <Input
                    type="email"
                    required
                    placeholder="faculty@institution.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <Button
                  type="submit"
                  variant="champagne"
                  className="w-full h-10 font-bold"
                  isLoading={loading}
                >
                  DISPATCH RECOVERY INSTRUCTIONS →
                </Button>
              </form>
            )}
          </div>
        </div>

        <div className="text-center font-mono text-[10px] text-[#929189]">
          <Link href="/login" className="hover:text-[#E3C283] transition-colors uppercase">
            [ RETURN TO LOGIN ]
          </Link>
        </div>
      </div>
    </div>
  );
}
