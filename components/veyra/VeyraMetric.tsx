import React from "react";

interface VeyraMetricProps {
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  accent?: boolean;
  className?: string;
}

export function VeyraMetric({
  label,
  value,
  unit,
  subtext,
  accent = false,
  className = "",
}: VeyraMetricProps) {
  return (
    <div className={`p-6 border border-[#222220] bg-[#0E0E0E] flex flex-col justify-between space-y-3 ${className}`}>
      <span className="font-mono text-[9px] text-[#9A9A94] uppercase tracking-[0.2em]">
        {label}
      </span>
      <div className="space-y-0.5">
        <div className="font-mono text-3xl md:text-4xl font-bold tracking-tight text-[#ffffff] flex items-baseline gap-1">
          <span className={accent ? "text-[#E3C283]" : "text-[#ffffff]"}>{value}</span>
          {unit && <span className="text-sm font-normal text-[#9A9A94]">{unit}</span>}
        </div>
        {subtext && (
          <p className="font-mono text-[9px] text-[#9A9A94] uppercase tracking-wider">{subtext}</p>
        )}
      </div>
    </div>
  );
}
