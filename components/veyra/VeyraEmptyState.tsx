import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface VeyraEmptyStateProps {
  code?: string;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  className?: string;
}

export function VeyraEmptyState({
  code = "STATE // EMPTY",
  title,
  description,
  actionHref,
  actionLabel,
  className = "",
}: VeyraEmptyStateProps) {
  return (
    <div
      className={`p-12 border border-[#222220] bg-[#0E0E0E] text-center flex flex-col items-center justify-center space-y-4 select-none ${className}`}
    >
      <div className="w-12 h-12 rounded-full border border-dashed border-[#474740]/60 flex items-center justify-center">
        <span className="w-2 h-2 rounded-full bg-[#E3C283]" />
      </div>
      <div className="space-y-1 max-w-md">
        <span className="font-mono text-[9px] text-[#E3C283] uppercase tracking-[0.25em]">
          [ {code} ]
        </span>
        <h3 className="font-sans text-base text-[#ffffff] font-normal uppercase tracking-tight">
          {title}
        </h3>
        <p className="font-mono text-xs text-[#9A9A94] leading-relaxed">{description}</p>
      </div>

      {actionHref && actionLabel && (
        <Link href={actionHref}>
          <Button variant="champagne" size="sm" className="h-8 font-bold text-[10px]">
            {actionLabel}
          </Button>
        </Link>
      )}
    </div>
  );
}
