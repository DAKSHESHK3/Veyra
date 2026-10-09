import React from "react";

export type VeyraStatusVariant =
  | "active"
  | "verified"
  | "scanning"
  | "pending"
  | "locked"
  | "error";

interface VeyraStatusProps {
  label: string;
  variant?: VeyraStatusVariant;
  pulse?: boolean;
  className?: string;
}

export function VeyraStatus({
  label,
  variant = "active",
  pulse = false,
  className = "",
}: VeyraStatusProps) {
  const variantStyles = {
    active: "bg-[#5C4612]/30 border-[#E3C283]/50 text-[#E3C283]",
    verified: "bg-[#5C4612]/40 border-[#E3C283] text-[#E3C283]",
    scanning: "bg-[#201F1F] border-[#E3C283]/60 text-[#E3C283]",
    pending: "bg-[#201F1F] border-[#474740]/40 text-[#C9C7BD]",
    locked: "bg-[#1C1B1B] border-[#222220] text-[#9A9A94]",
    error: "bg-[#93000A]/30 border-[#FFB4AB]/40 text-[#FFB4AB]",
  }[variant];

  const dotColors = {
    active: "bg-[#E3C283]",
    verified: "bg-[#E3C283]",
    scanning: "bg-[#E3C283]",
    pending: "bg-[#C9C7BD]",
    locked: "bg-[#9A9A94]",
    error: "bg-[#FFB4AB]",
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 border font-mono text-[9px] uppercase tracking-[0.14em] select-none ${variantStyles} ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${dotColors} ${
          pulse || variant === "active" || variant === "scanning" ? "animate-pulse" : ""
        }`}
      />
      <span>{label}</span>
    </span>
  );
}
