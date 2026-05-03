import { useRef, useState } from "react";
import { Download, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BadgeDef {
  id: string;
  name: string;
  subtitle: string;
  minutesRequired: number;
  color: string;
  glow: string;
  ring: string;
  symbol: string; // SVG path
}

export const BADGE_MILESTONES: BadgeDef[] = [
  {
    id: "genesis",    name: "GENESIS",    subtitle: "1 Hour of Focus",
    minutesRequired: 60,
    color: "#60C7D4", glow: "rgba(96,199,212,0.4)",  ring: "rgba(96,199,212,0.8)",
    symbol: "M20,12 L12,4 L4,12 L12,20 Z",
  },
  {
    id: "momentum",   name: "MOMENTUM",   subtitle: "2 Hours of Focus",
    minutesRequired: 120,
    color: "#9B7FE8", glow: "rgba(155,127,232,0.4)", ring: "rgba(155,127,232,0.8)",
    symbol: "M12,4 L14.5,10 L21,10 L16,14 L18,21 L12,17 L6,21 L8,14 L3,10 L9.5,10 Z",
  },
  {
    id: "deepwork",   name: "DEEP WORK",  subtitle: "4 Hours of Focus",
    minutesRequired: 240,
    color: "#4ECBA8", glow: "rgba(78,203,168,0.4)",  ring: "rgba(78,203,168,0.8)",
    symbol: "M12,3 L12,21 M3,12 L21,12 M5.6,5.6 L18.4,18.4 M18.4,5.6 L5.6,18.4",
  },
  {
    id: "halfday",    name: "HALF DAY",   subtitle: "6 Hours of Focus",
    minutesRequired: 360,
    color: "#F4A261", glow: "rgba(244,162,97,0.4)",  ring: "rgba(244,162,97,0.8)",
    symbol: "M12,2 A10,10 0 0,1 12,22 A10,10 0 0,1 12,2 M12,2 L12,22 M2,12 L22,12",
  },
  {
    id: "endurance",  name: "ENDURANCE",  subtitle: "8 Hours of Focus",
    minutesRequired: 480,
    color: "#E07EA3", glow: "rgba(224,126,163,0.4)", ring: "rgba(224,126,163,0.8)",
    symbol: "M12,12 m-8,0 a8,8 0 1,0 16,0 a8,8 0 1,0 -16,0 M12,12 m-4,0 a4,4 0 1,0 8,0 a4,4 0 1,0 -8,0",
  },
  {
    id: "dedicated",  name: "DEDICATED",  subtitle: "10 Hours of Focus",
    minutesRequired: 600,
    color: "#7B9EF4", glow: "rgba(123,158,244,0.4)", ring: "rgba(123,158,244,0.8)",
    symbol: "M12,3 L15,9 L21,10 L17,14 L18,21 L12,18 L6,21 L7,14 L3,10 L9,9 Z",
  },
  {
    id: "marathon",   name: "MARATHON",   subtitle: "12 Hours of Focus",
    minutesRequired: 720,
    color: "#F0C040", glow: "rgba(240,192,64,0.5)",  ring: "rgba(240,192,64,0.9)",
    symbol: "M12,2 L14,8 L20,8 L15,12 L17,18 L12,14 L7,18 L9,12 L4,8 L10,8 Z",
  },
  {
    id: "legendary",  name: "LEGENDARY",  subtitle: "24 Hours of Focus",
    minutesRequired: 1440,
    color: "#FFFFFF",  glow: "rgba(255,255,255,0.5)", ring: "rgba(255,255,255,0.95)",
    symbol: "M12,2 L13.5,8.5 L20,7 L15.5,12 L20,17 L13.5,15.5 L12,22 L10.5,15.5 L4,17 L8.5,12 L4,7 L10.5,8.5 Z",
  },
];

function BadgeSvg({ badge, size = 280 }: { badge: BadgeDef; size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.44;
  const innerR = size * 0.36;

  return (
    <svg
      id={`badge-svg-${badge.id}`}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ fontFamily: "JetBrains Mono, monospace" }}
    >
      {/* Background */}
      <rect width={size} height={size} fill="#07070f" rx="0" />

      {/* Outer glow */}
      <circle cx={cx} cy={cy} r={outerR + 4} fill="none" stroke={badge.glow} strokeWidth="12" opacity="0.3" />

      {/* Outer ring */}
      <circle cx={cx} cy={cy} r={outerR} fill="none" stroke={badge.ring} strokeWidth="1.5" opacity="0.6" />

      {/* Inner circle dark */}
      <circle cx={cx} cy={cy} r={innerR} fill="#0d0d18" />

      {/* Inner ring bright */}
      <circle cx={cx} cy={cy} r={innerR} fill="none" stroke={badge.ring} strokeWidth="1" opacity="0.8" />

      {/* Symbol */}
      <g transform={`translate(${cx - 12}, ${cy - 24}) scale(1)`} stroke={badge.color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d={badge.symbol} />
      </g>

      {/* Name */}
      <text
        x={cx} y={cy + size * 0.12}
        textAnchor="middle"
        fill={badge.color}
        fontSize={size * 0.055}
        fontFamily="JetBrains Mono, monospace"
        fontWeight="300"
        letterSpacing={size * 0.02}
      >
        {badge.name}
      </text>

      {/* Subtitle */}
      <text
        x={cx} y={cy + size * 0.21}
        textAnchor="middle"
        fill="rgba(255,255,255,0.35)"
        fontSize={size * 0.038}
        fontFamily="JetBrains Mono, monospace"
        fontWeight="300"
        letterSpacing={size * 0.008}
      >
        {badge.subtitle}
      </text>

      {/* Bottom label */}
      <text
        x={cx} y={size - size * 0.07}
        textAnchor="middle"
        fill="rgba(255,255,255,0.2)"
        fontSize={size * 0.032}
        fontFamily="JetBrains Mono, monospace"
        letterSpacing={size * 0.008}
      >
        FOCUS TIMER
      </text>
    </svg>
  );
}

function downloadBadgePng(badge: BadgeDef) {
  const size = 600;
  const svgEl = document.getElementById(`badge-svg-${badge.id}`);
  if (!svgEl) return;

  const clone = svgEl.cloneNode(true) as SVGElement;
  clone.setAttribute("width", String(size));
  clone.setAttribute("height", String(size));

  const svgData = new XMLSerializer().serializeToString(clone);
  const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  const img = new Image();
  img.onload = () => {
    ctx.fillStyle = "#07070f";
    ctx.fillRect(0, 0, size, size);
    ctx.drawImage(img, 0, 0, size, size);
    URL.revokeObjectURL(url);
    const link = document.createElement("a");
    link.download = `focus-badge-${badge.id}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };
  img.src = url;
}

interface BadgesProps {
  totalMinutes: number;
  earnedBadgeIds: string[];
  newlyUnlocked?: string | null;
  className?: string;
}

export default function Badges({ totalMinutes, earnedBadgeIds, newlyUnlocked, className }: BadgesProps) {
  const [selected, setSelected] = useState<BadgeDef | null>(null);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <span
          className="text-xs tracking-[0.25em] uppercase"
          style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'Rajdhani', sans-serif" }}
        >
          Achievement Badges
        </span>
        <span className="font-mono text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
          {earnedBadgeIds.length}/{BADGE_MILESTONES.length}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {BADGE_MILESTONES.map((badge) => {
          const earned = earnedBadgeIds.includes(badge.id);
          const isNew = newlyUnlocked === badge.id;
          const progress = Math.min(totalMinutes / badge.minutesRequired, 1);

          return (
            <button
              key={badge.id}
              onClick={() => earned && setSelected(badge)}
              disabled={!earned}
              className={cn(
                "flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all duration-300",
                earned && "cursor-pointer",
                isNew && "animate-badge-unlock"
              )}
              style={{
                background: earned ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${earned ? badge.glow : "rgba(255,255,255,0.06)"}`,
                boxShadow: earned ? `0 0 12px ${badge.glow}` : "none",
              }}
              data-testid={`badge-${badge.id}`}
            >
              {/* Mini badge preview */}
              <div className="relative w-10 h-10">
                {earned ? (
                  <div style={{ transform: "scale(0.36)", transformOrigin: "top left" }}>
                    <BadgeSvg badge={badge} size={112} />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    <Lock className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.2)" }} />
                  </div>
                )}
              </div>

              {/* Name */}
              <span
                className="text-center leading-tight"
                style={{
                  fontSize: "8px",
                  letterSpacing: "0.12em",
                  fontFamily: "'Rajdhani', sans-serif",
                  fontWeight: 600,
                  color: earned ? badge.color : "rgba(255,255,255,0.2)",
                }}
              >
                {badge.name}
              </span>

              {/* Progress bar if not earned */}
              {!earned && (
                <div className="w-full h-px rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${progress * 100}%`, background: "rgba(255,255,255,0.25)" }}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Badge detail modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }}
          onClick={() => setSelected(null)}
        >
          <div
            className="animate-scale-in flex flex-col items-center gap-6 p-8 rounded-3xl"
            style={{
              background: "rgba(8,8,18,0.95)",
              border: `1px solid ${selected.glow}`,
              boxShadow: `0 0 40px ${selected.glow}, 0 0 80px ${selected.glow}`,
              maxWidth: 360,
              width: "100%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="animate-float">
              <BadgeSvg badge={selected} size={240} />
            </div>

            <div className="text-center space-y-1">
              <div
                className="text-lg tracking-[0.2em] font-light"
                style={{ color: selected.color, fontFamily: "'Rajdhani', sans-serif" }}
              >
                {selected.name}
              </div>
              <div className="text-xs tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>
                {selected.subtitle}
              </div>
            </div>

            <button
              onClick={() => downloadBadgePng(selected)}
              data-testid={`button-download-badge-${selected.id}`}
              className="flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-200 active:scale-95"
              style={{
                background: `rgba(255,255,255,0.08)`,
                border: `1px solid ${selected.glow}`,
                color: selected.color,
                fontSize: "12px",
                letterSpacing: "0.15em",
                fontFamily: "'Rajdhani', sans-serif",
                fontWeight: 600,
              }}
            >
              <Download className="w-3.5 h-3.5" />
              DOWNLOAD BADGE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
