"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VeyraMark } from "@/components/visuals/VeyraMark";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@institution.edu");
  const [password, setPassword] = useState("admin12345");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isSupabaseConfigured() && supabase) {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (authError) throw authError;
      } else {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Invalid credentials. Please verify your login.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (role: "admin" | "teacher") => {
    if (role === "admin") {
      setEmail("admin@institution.edu");
      setPassword("admin12345");
    } else {
      setEmail("teacher@institution.edu");
      setPassword("teacher12345");
    }
  };

  return (
    <div className="min-h-screen bg-[#090909] text-[#F3F0E8] flex flex-col justify-center items-center p-4 selection:bg-[#5C4612] selection:text-[#E3C283]">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2 flex flex-col items-center">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <VeyraMark size={32} />
            <span className="font-sans font-medium text-lg tracking-[0.2em] text-[#F3F0E8] group-hover:text-[#E3C283] transition-colors">
              VEYRA
            </span>
          </Link>
          <span className="font-mono text-[9px] text-[#E3C283] uppercase tracking-[0.3em]">
            PRESENCE, VERIFIED.
          </span>
          <p className="font-mono text-xs text-[#929189]">
            FACULTY &amp; INSTITUTIONAL PORTAL ACCESS
          </p>
        </div>

        {/* Login Chassis */}
        <div className="border border-[#222220] bg-[#0E0E0E]">
          <div className="p-6 border-b border-[#222220] space-y-1">
            <span className="font-mono text-[10px] text-[#E3C283] uppercase tracking-wider">
              [ AUTHENTICATION GATE ]
            </span>
            <h2 className="font-sans text-xl text-[#ffffff] uppercase tracking-tight">
              STAFF CREDENTIALS
            </h2>
          </div>

          <form onSubmit={handleLogin} className="p-6 space-y-4">
            {error && (
              <div className="p-3 border border-[#FFB4AB]/40 bg-[#93000A]/30 text-[#FFB4AB] font-mono text-xs">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block font-mono text-[10px] uppercase text-[#929189] tracking-wider">
                EMAIL ADDRESS
              </label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@institution.edu"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-mono text-[10px] uppercase text-[#929189] tracking-wider">
                ACCESS KEY / PASSWORD
              </label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="champagne"
                className="w-full h-11 font-bold"
                isLoading={isLoading}
              >
                AUTHORIZE SESSION →
              </Button>
            </div>
          </form>

          {/* Quick-Fill Demonstration Shortcuts */}
          <div className="p-4 border-t border-[#222220] bg-[#131313] space-y-2">
            <span className="font-mono text-[9px] text-[#929189] uppercase tracking-wider block">
              QUICK TEST CREDENTIALS:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill("admin")}
                className="p-2 border border-[#222220] bg-[#0E0E0E] hover:border-[#E3C283] transition-colors text-left"
              >
                <div className="font-mono text-[10px] text-[#ffffff] font-bold">ADMIN ROLE</div>
                <div className="font-mono text-[9px] text-[#929189]">admin@institution.edu</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill("teacher")}
                className="p-2 border border-[#222220] bg-[#0E0E0E] hover:border-[#E3C283] transition-colors text-left"
              >
                <div className="font-mono text-[10px] text-[#ffffff] font-bold">TEACHER ROLE</div>
                <div className="font-mono text-[9px] text-[#929189]">teacher@institution.edu</div>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center font-mono text-[10px] text-[#929189]">
          <Link href="/" className="hover:text-[#E3C283] transition-colors uppercase">
            [ RETURN TO PUBLIC HOMEPAGE ]
          </Link>
        </div>
      </div>
    </div>
  );
}
