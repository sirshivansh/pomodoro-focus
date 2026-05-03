import { useState } from "react";
import { Download, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BadgeDef {
  id: string; name: string; subtitle: string;
  minutesRequired: number;
  color: string; glow: string; ring: string;
  symbol: string;
}

export const BADGE_MILESTONES: BadgeDef[] = [
  { id: "genesis",   name: "GENESIS",   subtitle: "1 Hour of Focus",   minutesRequired: 60,   color: "#60C7D4", glow: "rgba(96,199,212,0.45)",  ring: "rgba(96,199,212,0.9)"  },
  { id: "momentum",  name: "MOMENTUM",  subtitle: "2 Hours of Focus",  minutesRequired: 120,  color: "#9B7FE8", glow: "rgba(155,127,232,0.45)", ring: "rgba(155,127,232,0.9)" },
  { id: "deepwork",  name: "DEEP WORK", subtitle: "4 Hours of Focus",  minutesRequired: 240,  color: "#4ECBA8", glow: "rgba(78,203,168,0.45)",  ring: "rgba(78,203,168,0.9)"  },
  { id: "halfday",   name: "HALF DAY",  subtitle: "6 Hours of Focus",  minutesRequired: 360,  color: "#F4A261", glow: "rgba(244,162,97,0.45)",  ring: "rgba(244,162,97,0.9)"  },
  { id: "endurance", name: "ENDURANCE", subtitle: "8 Hours of Focus",  minutesRequired: 480,  color: "#E07EA3", glow: "rgba(224,126,163,0.45)", ring: "rgba(224,126,163,0.9)" },
  { id: "dedicated", name: "DEDICATED", subtitle: "10 Hours of Focus", minutesRequired: 600,  color: "#7B9EF4", glow: "rgba(123,158,244,0.45)", ring: "rgba(123,158,244,0.9)" },
  { id: "marathon",  name: "MARATHON",  subtitle: "12 Hours of Focus", minutesRequired: 720,  color: "#F0C040", glow: "rgba(240,192,64,0.5)",   ring: "rgba(240,192,64,0.95)" },
  { id: "legendary", name: "LEGENDARY", subtitle: "24 Hours of Focus", minutesRequired: 1440, color: "#FFFFFF",  glow: "rgba(255,255,255,0.5)",  ring: "rgba(255,255,255,1)"   },
];

function BadgeSvg({ badge, size = 280 }: { badge: BadgeDef; size?: number }) {
  const cx = size / 2, cy = size / 2;
  const outerR = size * 0.44, innerR = size * 0.36;
  return (
    <svg id={`badge-svg-${badge.id}`} width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg">
      <rect width={size} height={size} fill="#07070f" rx="0" />
      <circle cx={cx} cy={cy} r={outerR + 4} fill="none" stroke={badge.glow} strokeWidth="14" opacity="0.35" />
      <circle cx={cx} cy={cy} r={outerR} fill="none" stroke={badge.ring} strokeWidth="1.5" opacity="0.7" />
      <circle cx={cx} cy={cy} r={innerR} fill="#0d0d1a" />
      <circle cx={cx} cy={cy} r={innerR} fill="none" stroke={badge.ring} strokeWidth="1" opacity="0.85" />
      <g transform={`translate(${cx - 12},${cy - 26}) scale(1)`} stroke={badge.color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d={badge.symbol} />
      </g>
      <text x={cx} y={cy + size * 0.12} textAnchor="middle" fill={badge.color} fontSize={size * 0.055} fontFamily="JetBrains Mono,monospace" fontWeight="300" letterSpacing={size * 0.02}>{badge.name}</text>
      <text x={cx} y={cy + size * 0.22} textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize={size * 0.038} fontFamily="JetBrains Mono,monospace" fontWeight="300" letterSpacing={size * 0.008}>{badge.subtitle}</text>
      <text x={cx} y={size - size * 0.07} textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize={size * 0.032} fontFamily="JetBrains Mono,monospace" letterSpacing={size * 0.008}>FOCUS TIMER</text>
    </svg>
  );
}

function downloadBadgePng(badge: BadgeDef) {
  const size = 600;
  const svgEl = document.getElementById(`badge-svg-${badge.id}`);
  if (!svgEl) return;
  const clone = svgEl.cloneNode(true) as SVGElement;
  clone.setAttribute("width", String(size)); clone.setAttribute("height", String(size));
  const svgData = new XMLSerializer().serializeToString(clone);
  const url = URL.createObjectURL(new Blob([svgData], { type: "image/svg+xml;charset=utf-8" }));
  const canvas = document.createElement("canvas");
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const img = new Image();
  img.onload = () => {
    ctx.fillStyle = "#07070f"; ctx.fillRect(0, 0, size, size);
    ctx.drawImage(img, 0, 0, size, size);
    URL.revokeObjectURL(url);
    const link = document.createElement("a");
    link.download = `focus-badge-${badge.id}.png`; link.href = canvas.toDataURL("image/png"); link.click();
  };
  img.src = url;
}

interface BadgesProps { totalMinutes: number; earnedBadgeIds: string[]; newlyUnlocked?: string | null; className?: string; }

export default function Badges({ totalMinutes, earnedBadgeIds, newlyUnlocked, className }: BadgesProps) {
  const [selected, setSelected] = useState<BadgeDef | null>(null);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="grid grid-cols-4 gap-2.5">
        {BADGE_MILESTONES.map((badge) => {
          const earned = earnedBadgeIds.includes(badge.id);
          const isNew  = newlyUnlocked === badge.id;
          const pct    = Math.min(totalMinutes / badge.minutesRequired, 1);

          return (
            <button
              key={badge.id}
              onClick={() => earned && setSelected(badge)}
              disabled={!earned}
              className={cn("flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all duration-300", earned && "cursor-pointer", isNew && "animate-badge-unlock")}
              style={{
                background: earned ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${earned ? badge.ring : "rgba(255,255,255,0.08)"}`,
                boxShadow: earned ? `0 0 14px ${badge.glow}` : "none",
              }}
              data-testid={`badge-${badge.id}`}
            >
              <div className="relative w-10 h-10 flex items-center justify-center">
                {earned ? (
                  <div style={{ transform: "scale(0.36)", transformOrigin: "top left", position: "absolute", top: 0, left: 0 }}>
                    <BadgeSvg badge={badge} size={112} />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <Lock className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.3)" }} />
                  </div>
                )}
              </div>
              <span className="text-center leading-tight" style={{ fontSize: "8px", letterSpacing: "0.1em", fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, color: earned ? badge.color : "rgba(255,255,255,0.35)" }}>
                {badge.name}
              </span>
              {!earned && (
                <div className="w-full h-px rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <div className="h-full rounded-full" style={{ width: `${pct * 100}%`, background: "rgba(255,255,255,0.3)" }} />
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
          style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(14px)" }}
          onClick={() => setSelected(null)}
        >
          <div
            className="animate-scale-in flex flex-col items-center gap-6 p-8 rounded-3xl"
            style={{ background: "rgba(8,8,18,0.97)", border: `1px solid ${selected.glow}`, boxShadow: `0 0 50px ${selected.glow}`, maxWidth: 360, width: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="animate-float"><BadgeSvg badge={selected} size={240} /></div>
            <div className="text-center space-y-1.5">
              <div className="text-lg tracking-[0.22em] font-semibold" style={{ color: selected.color, fontFamily: "'Rajdhani',sans-serif" }}>{selected.name}</div>
              <div className="text-sm" style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 400, color: "rgba(255,255,255,0.6)" }}>{selected.subtitle}</div>
            </div>
            <button
              onClick={() => downloadBadgePng(selected)}
              data-testid={`button-download-badge-${selected.id}`}
              className="flex items-center gap-2.5 px-7 py-3 rounded-full transition-all duration-200 active:scale-95"
              style={{ background: "rgba(255,255,255,0.1)", border: `1px solid ${selected.ring}`, color: selected.color, fontSize: "13px", letterSpacing: "0.15em", fontFamily: "'Rajdhani',sans-serif", fontWeight: 700 }}
            >
              <Download className="w-4 h-4" /> DOWNLOAD BADGE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
