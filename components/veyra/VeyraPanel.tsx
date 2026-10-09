import React from "react";
import { cn } from "@/lib/utils";

interface VeyraPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  badge?: string;
  children: React.ReactNode;
}

export function VeyraPanel({
  label,
  badge,
  children,
  className,
  ...props
}: VeyraPanelProps) {
  return (
    <div
      className={cn(
        "border border-[#222220] bg-[#0E0E0E] relative transition-colors",
        className
      )}
      {...props}
    >
      {(label || badge) && (
        <div className="p-4 border-b border-[#222220] bg-[#131313] flex items-center justify-between font-mono text-[10px]">
          {label && (
            <span className="text-[#C9C7BD] uppercase tracking-wider">
              {label}
            </span>
          )}
          {badge && (
            <span className="text-[#E3C283] uppercase tracking-widest px-2 py-0.5 border border-[#474740] bg-[#090909]">
              {badge}
            </span>
          )}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}
