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
  { 
    id: "genesis",   name: "THE SPARK",   subtitle: "Focus for 1 hour to unlock",   minutesRequired: 60,   
    color: "#60C7D4", glow: "rgba(96,199,212,0.4)",  ring: "rgba(96,199,212,0.8)",
    symbol: "M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
  },
  { 
    id: "momentum",  name: "MOMENTUM",  subtitle: "Focus for 5 hours to unlock",  minutesRequired: 300,  
    color: "#9B7FE8", glow: "rgba(155,127,232,0.4)", ring: "rgba(155,127,232,0.8)",
    symbol: "M13 10V3L4 14H11V21L20 10H13Z" 
  },
  { 
    id: "deepwork",  name: "DEEP DIVER", subtitle: "Focus for 10 hours to unlock",  minutesRequired: 600,  
    color: "#4ECBA8", glow: "rgba(78,203,168,0.4)",  ring: "rgba(78,203,168,0.8)",
    symbol: "M12 2L2 7L12 12L22 7L12 2ZM2 17L12 22L22 17M2 12L12 17L22 12" 
  },
  { 
    id: "unstoppable", name: "UNSTOPPABLE", subtitle: "Focus for 25 hours to unlock", minutesRequired: 1500, 
    color: "#F4A261", glow: "rgba(244,162,97,0.4)",  ring: "rgba(244,162,97,0.8)",
    symbol: "M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM12 6V12L16 14"
  },
  { 
    id: "mastery", name: "MASTER FOCUS", subtitle: "Focus for 50 hours to unlock", minutesRequired: 3000, 
    color: "#E07EA3", glow: "rgba(224,126,163,0.4)", ring: "rgba(224,126,163,0.8)",
    symbol: "M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15ZM12 15V22M12 9V2M15 12H22M9 12H2"
  },
  { 
    id: "monkmode", name: "MONK MODE", subtitle: "Focus for 100 hours to unlock", minutesRequired: 6000, 
    color: "#7B9EF4", glow: "rgba(123,158,244,0.4)", ring: "rgba(123,158,244,0.8)",
    symbol: "M12 3L4 9V21H20V9L12 3ZM12 18C10.3431 18 9 16.6569 9 15C9 13.3431 10.3431 12 12 12C13.6569 12 15 13.3431 15 15C15 16.6569 13.6569 18 12 18Z"
  },
  { 
    id: "marathon",  name: "ELITE VOID",  subtitle: "Focus for 250 hours to unlock", minutesRequired: 15000, 
    color: "#F0C040", glow: "rgba(240,192,64,0.4)",   ring: "rgba(240,192,64,0.8)",
    symbol: "M7 12C7 10.3431 8.34315 9 10 9C11.6569 9 13 10.3431 13 12C13 13.6569 11.6569 15 10 15C8.34315 15 7 13.6569 7 12ZM11 12C11 13.6569 12.3431 15 14 15C15.6569 15 17 13.6569 17 12C17 10.3431 15.6569 9 14 9C12.3431 9 11 10.3431 11 12Z"
  },
  { 
    id: "godmode", name: "FOCUS GOD", subtitle: "Focus for 500 hours to unlock", minutesRequired: 30000, 
    color: "#FFFFFF",  glow: "rgba(255,255,255,0.45)",  ring: "rgba(255,255,255,1)",
    symbol: "M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z"
  },
  { 
    id: "zenith", name: "ZENITH", subtitle: "Focus for 1000 hours to unlock", minutesRequired: 60000, 
    color: "#FFD700",  glow: "rgba(255,215,0,0.5)",  ring: "rgba(255,215,0,1)",
    symbol: "M12 1L9 9L1 12L9 15L12 23L15 15L23 12L15 9L12 1Z"
  }
];

function BadgeSvg({ badge, size = 280, showText = true }: { badge: BadgeDef; size?: number; showText?: boolean }) {
  const cx = size / 2, cy = size / 2;
  const outerR = size * 0.45, innerR = size * 0.38;
  const hours = badge.minutesRequired / 60;

  return (
    <svg id={`badge-svg-${badge.id}`} width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg" style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id={`grad-${badge.id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={badge.color} stopOpacity="0.15" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Outer Glow */}
      <circle cx={cx} cy={cy} r={outerR + 2} fill={`url(#grad-${badge.id})`} opacity="0.6" />
      <circle cx={cx} cy={cy} r={outerR} fill="none" stroke={badge.glow} strokeWidth={size * 0.05} opacity="0.2" filter="url(#glow)" />
      
      {/* Main Ring */}
      <circle cx={cx} cy={cy} r={outerR} fill="none" stroke={badge.ring} strokeWidth={size * 0.008} strokeDasharray={size * 0.02} opacity="0.8" />
      
      {/* Background Plate */}
      <circle cx={cx} cy={cy} r={innerR} fill="#0a0a14" />
      <circle cx={cx} cy={cy} r={innerR - 2} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={size * 0.04} />
      
      {/* Symbol Container */}
      <g transform={`translate(${cx - size * 0.12}, ${cy - size * 0.22}) scale(${size / 100})`} stroke={badge.color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d={badge.symbol} transform="scale(0.4)" />
      </g>

      {showText && (
        <g style={{ fontFamily: "'Rajdhani', sans-serif" }}>
          {/* Badge Name */}
          <text x={cx} y={cy + size * 0.1} textAnchor="middle" fill={badge.color} fontSize={size * 0.07} fontWeight="700" letterSpacing={size * 0.03} style={{ textShadow: `0 0 10px ${badge.glow}` }}>
            {badge.name}
          </text>
          
          {/* Milestone Text */}
          <text x={cx} y={cy + size * 0.18} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize={size * 0.035} fontWeight="500" letterSpacing={size * 0.01}>
            {badge.subtitle.toUpperCase()}
          </text>

          {/* Flexible Stats Label */}
          <g transform={`translate(${cx}, ${cy + size * 0.32})`}>
            <rect x={-size * 0.22} y={-size * 0.04} width={size * 0.44} height={size * 0.08} rx={size * 0.04} fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
            <text textAnchor="middle" y={size * 0.015} fill={badge.color} fontSize={size * 0.03} fontWeight="600" letterSpacing={size * 0.02}>
              VERIFIED FOCUS: {hours >= 1 ? `${hours}H` : `${badge.minutesRequired}M`}
            </text>
          </g>
          
          {/* Brand Tag */}
          <text x={cx} y={size - size * 0.05} textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize={size * 0.028} letterSpacing={size * 0.04}>
            POMOFOCUS TRACK • AUTHENTIC ASSET
          </text>
        </g>
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
                <div className="flex flex-col items-center gap-1.5 w-full mt-1">
                  <div className="h-[3px] w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <div className="h-full transition-all duration-1000" style={{ width: `${pct * 100}%`, background: badge.color, opacity: 0.3 }} />
                  </div>
                  <span className="text-[7px] font-bold tracking-[0.1em] text-white/20 uppercase" style={{ fontFamily: "'Rajdhani',sans-serif" }}>
                    {pct > 0 ? `${Math.round(pct * 100)}% COMPLETE` : `LOCKED`}
                  </span>
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

