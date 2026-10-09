import React from "react";

interface VeyraMarkProps {
  size?: number;
  className?: string;
}

export function VeyraMark({ size = 26, className = "" }: VeyraMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
    >
      {/* Outer precision diamond frame */}
      <rect
        x="14"
        y="1.5"
        width="17.68"
        height="17.68"
        transform="rotate(45 14 1.5)"
        stroke="#E3C283"
        strokeWidth="1.2"
        strokeOpacity="0.8"
      />
      {/* Inner concentric ring */}
      <circle cx="14" cy="14" r="6.5" stroke="#474740" strokeWidth="1" strokeDasharray="2 2" />
      {/* Core biometric coordinate pip */}
      <circle cx="14" cy="14" r="2.2" fill="#E3C283" />
      {/* Crosshair fine marks */}
      <line x1="14" y1="4" x2="14" y2="7" stroke="#E3C283" strokeWidth="1" />
      <line x1="14" y1="21" x2="14" y2="24" stroke="#E3C283" strokeWidth="1" />
      <line x1="4" y1="14" x2="7" y2="14" stroke="#E3C283" strokeWidth="1" />
      <line x1="21" y1="14" x2="24" y2="14" stroke="#E3C283" strokeWidth="1" />
    </svg>
  );
}
