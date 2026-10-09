import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "success"
    | "warning"
    | "champagne";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default:
      "border-[#E3C283]/40 bg-[#5C4612]/30 text-[#E3C283]",
    champagne:
      "border-[#E3C283]/60 bg-[#5C4612]/40 text-[#E3C283]",
    secondary:
      "border-[#474740]/40 bg-[#201F1F] text-[#C9C7BD]",
    destructive:
      "border-[#FFB4AB]/40 bg-[#93000A]/40 text-[#FFB4AB]",
    outline:
      "border-[#222220] bg-transparent text-[#9A9A94]",
    success:
      "border-[#E3C283]/60 bg-[#5C4612]/40 text-[#E3C283]",
    warning:
      "border-[#E3C283]/30 bg-[#201F1F] text-[#E3C283]",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-none border px-2 py-0.5 font-mono text-[10px] tracking-[0.14em] uppercase select-none",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
