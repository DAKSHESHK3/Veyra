"use client";

import React, { useEffect, useState } from "react";

export type ReticleState =
  | "idle"
  | "scanning"
  | "detected"
  | "verifying"
  | "verified"
  | "unknown"
  | "error";

interface BiometricReticleProps {
  state?: ReticleState;
  size?: "sm" | "md" | "lg";
  label?: string;
  sublabel?: string;
  showFraming?: boolean;
  optCoordinates?: { x: number; y: number };
  className?: string;
}

export function BiometricReticle({
  state = "idle",
  size = "md",
  label,
  sublabel,
  showFraming = false,
  optCoordinates,
  className = "",
}: BiometricReticleProps) {
  const [coords, setCoords] = useState(
    optCoordinates || { x: 284.18, y: 911.02 }
  );

  // Subtle coordinate jitter to feel like real optical tracking telemetry
  useEffect(() => {
    if (state !== "scanning" && state !== "verifying") return;
    const interval = setInterval(() => {
      setCoords({
        x: Number((280 + Math.random() * 8).toFixed(2)),
        y: Number((908 + Math.random() * 6).toFixed(2)),
      });
    }, 450);
    return () => clearInterval(interval);
  }, [state]);

  const sizeClasses = {
    sm: "w-28 h-28",
    md: "w-44 h-44",
    lg: "w-60 h-60",
  }[size];

  const stateBorderColors = {
    idle: "border-[#474740]/40",
    scanning: "border-[#E3C283]/60",
    detected: "border-[#E3C283]/80",
    verifying: "border-[#E3C283]",
    verified: "border-[#E3C283]",
    unknown: "border-[#929189]",
    error: "border-[#ffb4ab]",
  }[state];

  const statePips = {
    idle: "bg-[#474740]",
    scanning: "bg-[#E3C283] animate-pulse",
    detected: "bg-[#E3C283]",
    verifying: "bg-[#E3C283] animate-ping",
    verified: "bg-[#E3C283]",
    unknown: "bg-[#929189]",
    error: "bg-[#ffb4ab]",
  }[state];

  const content = (
    <div
      className={`relative ${sizeClasses} flex items-center justify-center select-none ${className}`}
    >
      {/* Outermost segmented perimeter ring */}
      <div
        className={`absolute inset-0 rounded-full border border-dashed ${stateBorderColors} ${
          state === "scanning" || state === "verifying"
            ? "animate-[spin_40s_linear_infinite]"
            : "animate-[spin_90s_linear_infinite]"
        }`}
      />

      {/* Mid concentric ring */}
      <div className="absolute inset-4 rounded-full border border-[#474740]/30" />

      {/* Champagne Core Reticle */}
      <div
        className={`absolute inset-10 rounded-full border ${stateBorderColors} flex items-center justify-center`}
      >
        {(state === "scanning" || state === "verifying") && (
          <div className={`w-3 h-3 rounded-full ${statePips} opacity-60 absolute`} />
        )}
        <div className={`w-2 h-2 rounded-full ${statePips}`} />
      </div>

      {/* Crosshair Lines */}
      <div className="absolute inset-x-0 top-1/2 h-px bg-[#474740]/40 -translate-y-1/2" />
      <div className="absolute inset-y-0 left-1/2 w-px bg-[#474740]/40 -translate-x-1/2" />

      {/* Corner optical pips */}
      <div className={`absolute top-4 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${statePips}`} />
      <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${statePips}`} />
      <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full ${statePips}`} />
      <div className={`absolute right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full ${statePips}`} />

      {/* Scanning laser line in active states */}
      {(state === "scanning" || state === "verifying") && (
        <div className="absolute inset-x-2 h-[1px] bg-gradient-to-r from-transparent via-[#E3C283] to-transparent animate-pulse" />
      )}
    </div>
  );

  if (!showFraming) {
    return content;
  }

  return (
    <div className="relative border border-[#474740]/25 p-4 flex flex-col justify-between bg-[#0E0E0E]/80 backdrop-blur-sm">
      <div className="flex justify-between items-start text-xs font-mono">
        <span className="text-[#E3C283] font-bold tracking-[0.25em] text-[10px]">
          [ HUD {"//"} 009-L ]
        </span>
        <span className="text-[#9A9A94] tracking-[0.2em] text-[10px] uppercase">
          SYS: {state.toUpperCase()}
        </span>
      </div>

      <div className="my-6 self-center">{content}</div>

      <div className="flex justify-between items-end text-xs font-mono">
        <span className="text-[#9A9A94] tracking-[0.14em] text-[9px]">
          OPT-X: {coords.x} {"//"} OPT-Y: {coords.y}
        </span>
        <span className="text-[#E3C283] tracking-[0.2em] text-[9px] uppercase font-bold">
          [ {label || (state === "verified" ? "VERIFIED LOCK" : "RETICLE LOCK")} ]
        </span>
      </div>
      {sublabel && (
        <div className="mt-2 text-center text-[10px] font-mono text-[#9A9A94]">
          {sublabel}
        </div>
      )}
    </div>
  );
}
