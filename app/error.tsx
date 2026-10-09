"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import { VeyraMark } from "@/components/visuals/VeyraMark";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Veyra System Fault:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#090909] text-[#F3F0E8] flex flex-col justify-between p-6 md:p-12 font-sans selection:bg-[#E3C283] selection:text-[#090909]">
      <header className="flex items-center justify-between border-b border-[#222220] pb-6">
        <Link href="/" className="flex items-center gap-3 group">
          <VeyraMark size={28} />
          <span className="font-mono text-xs tracking-[0.25em] text-[#C9C7BD] uppercase group-hover:text-[#E3C283] transition-colors">
            VEYRA // FAULT INTERCEPTOR
          </span>
        </Link>
        <div className="font-mono text-[10px] uppercase text-[#E3C283] tracking-widest border border-[#474740] px-3 py-1 bg-[#0E0E0E]">
          SYS_STATUS: TRIPPED
        </div>
      </header>

      <main className="max-w-xl mx-auto my-auto w-full py-16">
        <div className="border border-[#474740] bg-[#0E0E0E] p-8 md:p-12 relative">
          <div className="flex items-center gap-3 text-[#E3C283] mb-6">
            <AlertTriangle className="w-6 h-6 stroke-[1.5]" />
            <span className="font-mono text-[11px] uppercase tracking-[0.2em]">
              ERR // EXCEPTION_CAUGHT
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-light tracking-tight text-[#F3F0E8] mb-4">
            Computational Anomaly Intercepted
          </h1>

          <p className="text-sm text-[#C9C7BD] leading-relaxed mb-6">
            An unhandled runtime condition interrupted the rendering pipeline. The biometric state has been safely isolated.
          </p>

          <div className="border border-[#222220] bg-[#131313] p-4 font-mono text-[11px] text-[#9A9A94] mb-8 break-all">
            <div className="text-[#C9C7BD] font-semibold mb-1">FAULT TRACE:</div>
            <div>{error?.message || "Internal system state corrupted or network transport failed."}</div>
            {error?.digest && (
              <div className="mt-2 text-[#474740]">DIGEST: {error.digest}</div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => reset()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#E3C283] text-[#090909] font-mono text-xs uppercase tracking-wider font-medium hover:bg-[#F3F0E8] transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Re-execute Operation
            </button>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-[#222220] text-[#C9C7BD] font-mono text-xs uppercase tracking-wider hover:border-[#474740] hover:text-[#F3F0E8] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Safety
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-[#222220] pt-6 flex flex-col md:flex-row items-center justify-between font-mono text-[10px] text-[#9A9A94] tracking-widest gap-4">
        <div>VEYRA BIOMETRIC IDENTITY PLATFORM</div>
        <div>RECOVERY HARNESS ACTIVE</div>
      </footer>
    </div>
  );
}
