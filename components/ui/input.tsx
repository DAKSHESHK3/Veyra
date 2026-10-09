import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-none border border-[#222220] bg-[#0E0E0E] px-3 py-2 text-xs font-mono text-[#F3F0E8] placeholder:text-[#9A9A94]/50 focus-visible:outline-none focus-visible:border-[#E3C283] focus-visible:ring-1 focus-visible:ring-[#E3C283] disabled:cursor-not-allowed disabled:opacity-40 transition-colors",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
