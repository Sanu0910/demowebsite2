import React from "react";

/**
 * The walking Buddha — a monk in a saffron robe with a backpack and trekking pole,
 * styled after the Trekking Buddha logo. `phase` drives the walk cycle (radians).
 * Feet touch y = 0; the figure is ~135 units tall.
 */
const SKIN = "#c98a5b";
const SKIN_D = "#a86d44";

export const Monk: React.FC<{ phase: number; size?: number; x?: number; y?: number; style?: React.CSSProperties }> = ({ phase, size = 200, x, y, style }) => {
  const s = Math.sin(phase);
  const bob = -Math.abs(Math.cos(phase)) * 2.4;
  return (
    <svg viewBox="-40 -135 80 140" x={x} y={y} width={size * (80 / 140)} height={size} style={{ overflow: "visible", ...style }}>
      <g transform={`translate(0 ${bob})`}>
        <g transform={`rotate(${26 * s} 0 -46)`}>
          <path d="M-4,-46 L4,-46 L3.5,-8 L-3.5,-8 Z" fill={SKIN_D} />
          <path d="M-5,-9 L5,-9 Q12,-8 13,-3 L13,0 L-5,0 Z" fill="#4a2e17" />
        </g>
        <rect x="-27" y="-100" width="18" height="46" rx="6" fill="#f2b632" />
        <rect x="-25" y="-107" width="14" height="9" rx="4" fill="#c98a16" />
        <rect x="-24" y="-80" width="12" height="10" rx="3" fill="#d99a1c" />
        <path d="M-11,-96 Q2,-101 13,-95 L19,-34 Q2,-30 -17,-34 Z" fill="#f26b1d" />
        <path d="M-8,-97 L13,-95 L-1,-58 L-12,-63 Z" fill="#d9531a" />
        <path d="M4,-70 Q8,-52 10,-36" stroke="#d9531a" strokeWidth={2} fill="none" />
        <path d="M-10,-96 Q-2,-80 -7,-60" stroke="#8a5a10" strokeWidth={3} fill="none" strokeLinecap="round" />
        <g transform={`rotate(${-26 * s} 0 -46)`}>
          <path d="M-4,-46 L4,-46 L3.5,-8 L-3.5,-8 Z" fill={SKIN} />
          <path d="M-5,-9 L5,-9 Q12,-8 13,-3 L13,0 L-5,0 Z" fill="#5b3a1e" />
        </g>
        <path d="M-17,-34 Q2,-30 19,-34 L18,-38 Q2,-35 -16,-38 Z" fill="#d9531a" />
        <rect x="0" y="-105" width="7" height="10" fill={SKIN} />
        <circle cx="4" cy="-112" r="10" fill={SKIN} />
        <path d="M-6,-112 Q-6,-124 5,-123 Q13,-122 14,-115 Q6,-119 -1,-111 Z" fill="#2a1a10" />
        <circle cx="-6" cy="-119" r="4.5" fill="#2a1a10" />
        <circle cx="10" cy="-112" r="1.2" fill="#2a1a10" />
        <path d="M9,-106 Q11,-105 12,-107" stroke="#2a1a10" strokeWidth={1} fill="none" strokeLinecap="round" />
        <g transform={`rotate(${14 * s - 4} 6 -93)`}>
          <line x1="11" y1="-80" x2="26" y2="0" stroke="#3b3b3b" strokeWidth={2.4} strokeLinecap="round" />
          <path d="M3,-95 L10,-93 L13,-70 L7,-69 Z" fill={SKIN} />
          <circle cx="11" cy="-70" r="3.4" fill={SKIN} />
        </g>
      </g>
    </svg>
  );
};
