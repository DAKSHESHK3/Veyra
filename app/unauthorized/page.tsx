import Link from "next/link";
import { ShieldAlert, ArrowLeft, Lock } from "lucide-react";
import { VeyraMark } from "@/components/visuals/VeyraMark";

export const metadata = {
  title: "Access Restricted // 403 — Veyra",
  description: "Identity verification failed or insufficient privilege clearance for requested node.",
};

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-[#090909] text-[#F3F0E8] flex flex-col justify-between p-6 md:p-12 font-sans selection:bg-[#E3C283] selection:text-[#090909]">
      <header className="flex items-center justify-between border-b border-[#222220] pb-6">
        <Link href="/" className="flex items-center gap-3 group">
          <VeyraMark size={28} />
          <span className="font-mono text-xs tracking-[0.25em] text-[#C9C7BD] uppercase group-hover:text-[#E3C283] transition-colors">
            VEYRA // ACCESS CONTROL
          </span>
        </Link>
        <div className="font-mono text-[10px] uppercase text-[#9A9A94] tracking-widest border border-[#222220] px-3 py-1 bg-[#0E0E0E]">
          NODE STATUS: RESTRICTED
        </div>
      </header>

      <main className="max-w-xl mx-auto my-auto w-full py-16">
        <div className="border border-[#474740] bg-[#0E0E0E] p-8 md:p-12 relative">
          <div className="absolute top-0 left-0 w-2 h-2 bg-[#E3C283]" />
          <div className="absolute top-0 right-0 w-2 h-2 bg-[#E3C283]" />
          <div className="absolute bottom-0 left-0 w-2 h-2 bg-[#E3C283]" />
          <div className="absolute bottom-0 right-0 w-2 h-2 bg-[#E3C283]" />

          <div className="flex items-center gap-3 text-[#E3C283] mb-6">
            <ShieldAlert className="w-6 h-6 stroke-[1.5]" />
            <span className="font-mono text-[11px] uppercase tracking-[0.2em]">
              ERR_CODE // 403_INSUFFICIENT_CLEARANCE
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-light tracking-tight text-[#F3F0E8] mb-4">
            Security Authorization Boundary Reached
          </h1>

          <p className="text-sm text-[#C9C7BD] leading-relaxed mb-8">
            The authenticated session does not possess the requisite cryptographic permissions or administrator role to read or execute modifications on this resource.
          </p>

          <div className="border border-[#222220] bg-[#131313] p-4 font-mono text-[11px] text-[#9A9A94] mb-8 space-y-1">
            <div className="flex justify-between">
              <span>SECURITY PROTOCOL:</span>
              <span className="text-[#F3F0E8]">STRICT RLS ENFORCED</span>
            </div>
            <div className="flex justify-between">
              <span>REQUIRED ROLE:</span>
              <span className="text-[#E3C283]">ADMIN // FACULTY_LEAD</span>
            </div>
            <div className="flex justify-between">
              <span>AUDIT EVENT:</span>
              <span>LOGGED TO POSTGRES AUTH LOG</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#E3C283] text-[#090909] font-mono text-xs uppercase tracking-wider font-medium hover:bg-[#F3F0E8] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Command Center
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-[#222220] text-[#C9C7BD] font-mono text-xs uppercase tracking-wider hover:border-[#474740] hover:text-[#F3F0E8] transition-colors"
            >
              <Lock className="w-4 h-4" /> Re-Authenticate Identity
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-[#222220] pt-6 flex flex-col md:flex-row items-center justify-between font-mono text-[10px] text-[#9A9A94] tracking-widest gap-4">
        <div>VEYRA BIOMETRIC IDENTITY PLATFORM</div>
        <div>SYS_SIG: 0x403_RESTRICTED</div>
      </footer>
    </div>
  );
}
