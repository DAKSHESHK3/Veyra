import React from "react";

interface VeyraLoadingStateProps {
  label?: string;
  sublabel?: string;
  className?: string;
}

export function VeyraLoadingState({
  label = "INITIALIZING SENSORS & QUERYING REGISTRY...",
  sublabel = "CLIENT-SIDE WEBGL PIPELINE ACTIVE",
  className = "",
}: VeyraLoadingStateProps) {
  return (
    <div
      className={`p-12 border border-[#222220] bg-[#0E0E0E] text-center flex flex-col items-center justify-center space-y-3 select-none ${className}`}
    >
      <div className="w-10 h-10 rounded-full border border-dashed border-[#E3C283]/60 animate-spin flex items-center justify-center">
        <span className="w-1.5 h-1.5 rounded-full bg-[#E3C283]" />
      </div>
      <div className="space-y-1">
        <span className="font-mono text-[10px] text-[#E3C283] uppercase tracking-[0.2em] font-bold block">
          {label}
        </span>
        <span className="font-mono text-[9px] text-[#9A9A94] uppercase tracking-wider block">
          {sublabel}
        </span>
      </div>
    </div>
  );
}
