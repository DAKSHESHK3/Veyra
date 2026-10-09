import React from "react";

interface VeyraSectionLabelProps {
  code: string;
  title?: string;
  className?: string;
}

export function VeyraSectionLabel({ code, title, className = "" }: VeyraSectionLabelProps) {
  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      <span className="font-mono text-[10px] text-[#E3C283] tracking-[0.25em] uppercase font-bold">
        [ {code} ]
      </span>
      {title && (
        <span className="font-mono text-[9px] text-[#9A9A94] uppercase tracking-[0.18em]">
          {title}
        </span>
      )}
    </div>
  );
}
