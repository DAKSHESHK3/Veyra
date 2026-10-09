import { VeyraMark } from "@/components/visuals/VeyraMark";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#090909] text-[#F3F0E8] flex flex-col items-center justify-center p-6 font-mono">
      <div className="relative mb-6">
        <VeyraMark size={48} className="animate-pulse" />
        <div className="absolute inset-0 rounded-full border border-[#E3C283]/30 animate-ping pointer-events-none" />
      </div>
      <div className="text-xs uppercase tracking-[0.3em] text-[#C9C7BD] mb-2">
        INITIALIZING VEYRA RUNTIME
      </div>
      <div className="text-[10px] uppercase text-[#9A9A94] tracking-widest flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[#E3C283] animate-ping" />
        HYDRATING ENCRYPTION MATRICES &bull; SYNCING POSTGRES SHARDS
      </div>
    </div>
  );
}
