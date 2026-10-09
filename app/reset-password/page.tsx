"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VeyraMark } from "@/components/visuals/VeyraMark";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isSupabaseConfigured() && supabase) {
        const { error: updateErr } = await supabase.auth.updateUser({
          password,
        });
        if (updateErr) throw updateErr;
      }
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setError(err?.message || "Failed to update password.");
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
            KEY UPDATE PROTOCOL
          </span>
        </div>

        <div className="border border-[#222220] bg-[#0E0E0E]">
          <div className="p-6 border-b border-[#222220] space-y-1">
            <span className="font-mono text-[10px] text-[#E3C283] uppercase tracking-wider">
              [ SECURE KEY MODIFICATION ]
            </span>
            <h2 className="font-sans text-xl text-[#ffffff] uppercase tracking-tight">
              SET NEW ACCESS KEY
            </h2>
          </div>

          <div className="p-6 space-y-4">
            {success ? (
              <div className="text-center py-4 space-y-2">
                <CheckCircle2 className="h-8 w-8 text-[#E3C283] mx-auto" />
                <h3 className="font-sans text-sm text-[#ffffff] uppercase font-bold">
                  PASSWORD UPDATED SUCCESSFULLY
                </h3>
                <p className="font-mono text-xs text-[#9A9A94]">Redirecting to authentication...</p>
              </div>
            ) : (
              <form onSubmit={handleUpdate} className="space-y-4">
                {error && (
                  <div className="p-3 border border-[#FFB4AB]/40 bg-[#93000A]/30 text-[#FFB4AB] font-mono text-xs">
                    {error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block font-mono text-[10px] uppercase text-[#9A9A94] tracking-wider">
                    NEW PASSWORD
                  </label>
                  <Input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-mono text-[10px] uppercase text-[#9A9A94] tracking-wider">
                    CONFIRM PASSWORD
                  </label>
                  <Input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                <Button
                  type="submit"
                  variant="champagne"
                  className="w-full h-10 font-bold"
                  isLoading={loading}
                >
                  SAVE NEW ACCESS KEY →
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
