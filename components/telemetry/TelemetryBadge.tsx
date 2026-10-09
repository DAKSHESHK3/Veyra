import React from "react";

interface TelemetryBadgeProps {
  label?: string;
  value: string;
  pulse?: boolean;
  variant?: "champagne" | "neutral" | "active";
  className?: string;
}

export function TelemetryBadge({
  label,
  value,
  pulse = false,
  variant = "neutral",
  className = "",
}: TelemetryBadgeProps) {
  const variantStyles = {
    champagne: "bg-[#201F1F] border-[#E3C283]/40 text-[#E3C283]",
    neutral: "bg-[#1C1B1B] border-[#474740]/30 text-[#C9C7BD]",
    active: "bg-[#201F1F] border-[#474740]/40 text-[#F3F0E8]",
  }[variant];

  return (
    <div
      className={`inline-flex items-center gap-2 px-2.5 py-1 border font-mono text-[10px] tracking-[0.14em] uppercase ${variantStyles} ${className}`}
    >
      {pulse && <span className="w-1.5 h-1.5 rounded-full bg-[#E3C283] animate-pulse" />}
      {label && <span className="text-[#9A9A94]">{label}:</span>}
      <span className="font-bold">{value}</span>
    </div>
  );
}

interface TelemetryItemProps {
  label: string;
  value: string | number;
  subtext?: string;
  highlight?: boolean;
  className?: string;
}

export function TelemetryItem({
  label,
  value,
  subtext,
  highlight = false,
  className = "",
}: TelemetryItemProps) {
  return (
    <div className={`flex flex-col p-3 border border-[#222220] bg-[#0E0E0E] ${className}`}>
      <span className="font-mono text-[10px] uppercase text-[#9A9A94] tracking-[0.16em]">
        {label}
      </span>
      <div className="flex items-baseline gap-1 mt-1">
        <span
          className={`font-mono text-xl tracking-tight ${
            highlight ? "text-[#E3C283] font-bold" : "text-[#F3F0E8]"
          }`}
        >
          {value}
        </span>
        {subtext && (
          <span className="font-mono text-[10px] text-[#9A9A94] uppercase tracking-wider">
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
}
