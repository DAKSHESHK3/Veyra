import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "champagne"
    | "ghost"
    | "link"
    | "glass";
  size?: "default" | "sm" | "lg" | "icon";
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      isLoading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center whitespace-nowrap rounded-none text-xs font-mono uppercase tracking-[0.14em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E3C283] disabled:pointer-events-none disabled:opacity-40 select-none";

    const variants = {
      default:
        "bg-[#ffffff] text-[#090909] font-medium hover:bg-[#E4E3DC] active:translate-y-[1px]",
      champagne:
        "bg-[#E3C283] text-[#402D00] font-bold hover:bg-[#FFDEA1] active:translate-y-[1px]",
      secondary:
        "bg-[#201F1F] text-[#F3F0E8] border border-[#474740]/40 hover:border-[#E3C283] hover:text-[#E3C283]",
      destructive:
        "bg-[#93000A] text-[#FFDAD6] border border-[#FFB4AB]/40 hover:bg-[#BA1A1A]",
      outline:
        "border border-[#474740] bg-transparent text-[#F3F0E8] hover:border-[#E3C283] hover:text-[#E3C283] hover:bg-[#1C1B1B]",
      ghost:
        "bg-transparent text-[#C9C7BD] hover:text-[#F3F0E8] hover:bg-[#201F1F]",
      link: "text-[#E3C283] underline-offset-4 hover:underline normal-case",
      glass:
        "bg-[#0E0E0E]/80 backdrop-blur-md border border-[#222220] text-[#F3F0E8] hover:border-[#E3C283]/50",
    };

    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-8 px-3 text-[11px]",
      lg: "h-12 px-6 text-xs",
      icon: "h-10 w-10 p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <svg
            className="mr-2 h-3.5 w-3.5 animate-spin text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
