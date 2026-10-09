import React from "react";
import { cn } from "@/lib/utils";

interface VeyraTelemetryProps {
  label: string;
  value: string | number;
  highlight?: boolean;
  unit?: string;
  className?: string;
}

export function VeyraTelemetry({
  label,
  value,
  highlight = false,
  unit,
  className,
}: VeyraTelemetryProps) {
  return (
    <div
      className={cn(
        "p-3 border border-[#222220] bg-[#131313] font-mono text-xs flex flex-col justify-between",
        highlight && "border-[#E3C283]/40 bg-[#5C4612]/20",
        className
      )}
    >
      <span className="text-[10px] text-[#9A9A94] uppercase tracking-wider block mb-1">
        {label}
      </span>
      <div className="flex items-baseline gap-1">
        <span
          className={cn(
            "text-base font-bold",
            highlight ? "text-[#E3C283]" : "text-[#F3F0E8]"
          )}
        >
          {value}
        </span>
        {unit && <span className="text-[10px] text-[#9A9A94] uppercase">{unit}</span>}
      </div>
    </div>
  );
}
