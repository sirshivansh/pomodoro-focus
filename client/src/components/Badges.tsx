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

function BadgeSvg({ badge, size = 280, showText = true }: { badge: BadgeDef; size?: number; showText?: boolean }) {
  const cx = size / 2, cy = size / 2;
  const outerR = size * 0.44, innerR = size * 0.36;
  return (
    <svg id={`badge-svg-${badge.id}`} width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg">
      <rect width={size} height={size} fill="#07070f" rx="0" />
      <circle cx={cx} cy={cy} r={outerR + 4} fill="none" stroke={badge.glow} strokeWidth="14" opacity="0.25" />
      <circle cx={cx} cy={cy} r={outerR} fill="none" stroke={badge.ring} strokeWidth="1.5" opacity="0.7" />
      <circle cx={cx} cy={cy} r={innerR} fill="#0d0d1a" />
      <circle cx={cx} cy={cy} r={innerR} fill="none" stroke={badge.ring} strokeWidth="1" opacity="0.85" />
      <g transform={`translate(${cx - 12},${cy - 26}) scale(1)`} stroke={badge.color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d={badge.symbol} />
      </g>
      {showText && (
        <>
          <text x={cx} y={cy + size * 0.12} textAnchor="middle" fill={badge.color} fontSize={size * 0.055} fontFamily="JetBrains Mono,monospace" fontWeight="300" letterSpacing={size * 0.02}>{badge.name}</text>
          <text x={cx} y={cy + size * 0.22} textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize={size * 0.038} fontFamily="JetBrains Mono,monospace" fontWeight="300" letterSpacing={size * 0.008}>{badge.subtitle}</text>
          <text x={cx} y={size - size * 0.07} textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize={size * 0.032} fontFamily="JetBrains Mono,monospace" letterSpacing={size * 0.008}>FOCUS TIMER</text>
        </>
      )}
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
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-4 gap-3">
        {BADGE_MILESTONES.map((badge) => {
          const earned = earnedBadgeIds.includes(badge.id);
          const isNew  = newlyUnlocked === badge.id;
          const pct    = Math.min(totalMinutes / badge.minutesRequired, 1);

          return (
            <button
              key={badge.id}
              onClick={() => earned && setSelected(badge)}
              disabled={!earned}
              className={cn(
                "group relative flex flex-col items-center gap-2 p-3.5 rounded-2xl transition-all duration-500",
                earned ? "cursor-pointer hover:scale-[1.05] active:scale-[0.98]" : "cursor-default opacity-60",
                isNew && "animate-badge-unlock"
              )}
              style={{
                background: earned ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${earned ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)"}`,
                boxShadow: earned ? `0 8px 24px -12px ${badge.glow}` : "none",
              }}
              data-testid={`badge-${badge.id}`}
            >
              <div className="relative w-11 h-11 flex items-center justify-center">
                {earned ? (
                  <div style={{ transform: "scale(0.39)", transformOrigin: "center center", position: "absolute" }}>
                    <BadgeSvg badge={badge} size={112} showText={false} />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 group-hover:bg-white/5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <Lock className="w-4 h-4" style={{ color: "rgba(255,255,255,0.2)" }} />
                  </div>
                )}
                {earned && (
                   <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" 
                        style={{ boxShadow: `0 0 15px ${badge.glow}`, border: `1px solid ${badge.ring}` }} />
                )}
              </div>
              
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-center leading-none" style={{ fontSize: "9px", letterSpacing: "0.12em", fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, color: earned ? badge.color : "rgba(255,255,255,0.3)" }}>
                  {badge.name}
                </span>
                <span className="text-[7px] uppercase tracking-wider opacity-40 font-medium" style={{ fontFamily: "'Space Grotesk',sans-serif", color: earned ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)" }}>
                  {badge.minutesRequired >= 60 ? `${badge.minutesRequired / 60}H` : `${badge.minutesRequired}M`}
                </span>
              </div>

              {!earned && (
                <div className="absolute bottom-2 left-3 right-3 h-[2px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <div className="h-full transition-all duration-1000" style={{ width: `${pct * 100}%`, background: "rgba(255,255,255,0.15)" }} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Badge detail modal */}
      {selected && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300"
          style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(20px)" }}
          onClick={() => setSelected(null)}
        >
          <div
            className="animate-in zoom-in-95 duration-300 flex flex-col items-center gap-8 p-10 rounded-[2.5rem]"
            style={{ 
              background: "rgba(8,8,18,0.98)", 
              border: `1px solid rgba(255,255,255,0.12)`, 
              boxShadow: `0 32px 80px -20px rgba(0,0,0,0.8), 0 0 40px ${selected.glow}`,
              maxWidth: 400, 
              width: "100%" 
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="animate-float"><BadgeSvg badge={selected} size={280} /></div>
            
            <div className="text-center space-y-2">
              <div className="text-2xl tracking-[0.3em] font-bold" style={{ color: selected.color, fontFamily: "'Rajdhani',sans-serif" }}>{selected.name}</div>
              <div className="text-base font-light" style={{ fontFamily: "'Space Grotesk',sans-serif", color: "rgba(255,255,255,0.5)", letterSpacing: "0.02em" }}>{selected.subtitle}</div>
            </div>

            <div className="w-full h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)" }} />

            <button
              onClick={() => downloadBadgePng(selected)}
              className="group flex items-center gap-3 px-10 py-4 rounded-2xl transition-all duration-300 hover:brightness-125 active:scale-95"
              style={{ 
                background: "rgba(255,255,255,0.05)", 
                border: `1px solid ${selected.ring}`, 
                color: selected.color, 
                fontSize: "14px", 
                letterSpacing: "0.18em", 
                fontFamily: "'Rajdhani',sans-serif", 
                fontWeight: 700 
              }}
            >
              <Download className="w-5 h-5 transition-transform group-hover:-translate-y-1" /> DOWNLOAD ASSET
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

