import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { TimerState, SessionType } from "@shared/schema";

interface TimerProps {
  timeRemaining: number;
  totalTime: number;
  currentSession: SessionType;
  state: TimerState;
  className?: string;
}

const SESSION_ARC: Record<SessionType, string> = {
  "work":         "rgba(255,255,255,0.92)",
  "short-break":  "rgba(100,210,170,0.88)",
  "long-break":   "rgba(140,175,255,0.85)",
};
const SESSION_GLOW: Record<SessionType, string> = {
  "work":         "rgba(255,255,255,0.22)",
  "short-break":  "rgba(100,210,170,0.22)",
  "long-break":   "rgba(120,160,240,0.2)",
};

export default function Timer({ timeRemaining, totalTime, currentSession, state, className }: TimerProps) {
  const [displayed, setDisplayed] = useState(timeRemaining);

  useEffect(() => { setDisplayed(timeRemaining); }, [timeRemaining]);

  const SIZE  = 240;
  const CX    = SIZE / 2;
  const CY    = SIZE / 2;
  const TRACK = 112;
  const INNER = 93;

  const circ    = 2 * Math.PI * TRACK;
  const progress = totalTime > 0 ? (totalTime - displayed) / totalTime : 0;
  const offset   = circ - progress * circ;

  const mins = Math.floor(displayed / 60).toString().padStart(2, "0");
  const secs = (displayed % 60).toString().padStart(2, "0");

  const arcColor  = SESSION_ARC[currentSession];
  const glowColor = SESSION_GLOW[currentSession];
  const isRunning = state === "running";

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* Ambient glow behind the orb */}
      <div style={{
        position: "absolute",
        width: SIZE * 0.9, height: SIZE * 0.9,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
        filter: "blur(28px)",
        opacity: isRunning ? 1 : 0.5,
        transition: "opacity 1.4s ease",
        pointerEvents: "none",
        animation: "liquidAmbient 8s ease-in-out infinite",
      }} />

      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ overflow: "visible" }}>
        <defs>
          {/* Liquid displacement filter */}
          <filter id="liquid-filter" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="turbulence"
              baseFrequency="0.012 0.018"
              numOctaves="3"
              seed="2"
              result="turb"
            >
              <animate attributeName="seed" values="2;5;8;3;6;2" dur="12s" repeatCount="indefinite" />
              <animate attributeName="baseFrequency" values="0.012 0.018;0.015 0.014;0.01 0.02;0.016 0.012;0.012 0.018" dur="18s" repeatCount="indefinite" />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="turb" scale="5" xChannelSelector="R" yChannelSelector="G" />
          </filter>

          {/* Sphere gradient */}
          <radialGradient id="sphere-bg" cx="36%" cy="30%" r="70%">
            <stop offset="0%"   stopColor="#1c1c28" />
            <stop offset="60%"  stopColor="#0f0f18" />
            <stop offset="100%" stopColor="#050508" />
          </radialGradient>

          {/* Rim light */}
          <radialGradient id="rim-light" cx="50%" cy="50%" r="50%">
            <stop offset="68%" stopColor="transparent" />
            <stop offset="100%" stopColor={glowColor} stopOpacity="0.7" />
          </radialGradient>

          {/* Orbiting inner highlight */}
          <radialGradient id="highlight-orb" cx="35%" cy="28%" r="40%">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.18)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>

          {/* Arc glow */}
          <filter id="arc-glow">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>

          {/* Clip to sphere */}
          <clipPath id="sphere-clip">
            <circle cx={CX} cy={CY} r={INNER} />
          </clipPath>
        </defs>

        {/* Track ring */}
        <circle cx={CX} cy={CY} r={TRACK} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1.5" />

        {/* Progress arc */}
        <circle
          cx={CX} cy={CY} r={TRACK}
          fill="none" stroke={arcColor}
          strokeWidth="2" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          transform={`rotate(-90 ${CX} ${CY})`}
          filter="url(#arc-glow)"
          style={{ transition: "stroke-dashoffset 1s linear, stroke 0.8s ease" }}
        />

        {/* ── Liquid sphere group ── */}
        <g filter="url(#liquid-filter)">
          {/* Base sphere */}
          <circle cx={CX} cy={CY} r={INNER} fill="url(#sphere-bg)" />

          {/* Liquid light layer 1 — slow orbit */}
          <circle cx={CX} cy={CY} r={INNER} fill="url(#highlight-orb)" clipPath="url(#sphere-clip)">
            <animateTransform
              attributeName="transform"
              type="rotate"
              values={`0 ${CX} ${CY};360 ${CX} ${CY}`}
              dur="22s"
              repeatCount="indefinite"
            />
          </circle>

          {/* Liquid light layer 2 — counter-orbit, slower */}
          <ellipse cx={CX - 14} cy={CY - 10} rx={34} ry={22} fill="rgba(255,255,255,0.06)" clipPath="url(#sphere-clip)">
            <animateTransform
              attributeName="transform"
              type="rotate"
              values={`0 ${CX} ${CY};-360 ${CX} ${CY}`}
              dur="31s"
              repeatCount="indefinite"
            />
            <animate attributeName="rx" values="34;38;30;36;34" dur="9s" repeatCount="indefinite" />
            <animate attributeName="ry" values="22;18;26;20;22" dur="11s" repeatCount="indefinite" />
          </ellipse>

          {/* Rim light */}
          <circle cx={CX} cy={CY} r={INNER} fill="url(#rim-light)" />
        </g>

        {/* ── Text on top (no filter) ── */}
        {/* Minutes */}
        <text
          x={CX - 10} y={CY - 4}
          textAnchor="end" dominantBaseline="middle"
          style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "42px", fontWeight: 300, fill: "rgba(255,255,255,0.96)", letterSpacing: "1px" }}
          data-testid="text-timer-display"
        >{mins}</text>

        {/* Colon */}
        <text
          x={CX} y={CY - 8}
          textAnchor="middle" dominantBaseline="middle"
          style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "32px", fontWeight: 200, fill: arcColor }}
        >
          <animate attributeName="opacity" values="1;0.2;1" dur="1.8s" repeatCount={isRunning ? "indefinite" : "1"} />
          :
        </text>

        {/* Seconds */}
        <text
          x={CX + 10} y={CY - 4}
          textAnchor="start" dominantBaseline="middle"
          style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "42px", fontWeight: 300, fill: "rgba(255,255,255,0.96)", letterSpacing: "1px" }}
        >{secs}</text>

        {/* Session label */}
        <text
          x={CX} y={CY + 36}
          textAnchor="middle"
          style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: "10px", fontWeight: 600, fill: "rgba(255,255,255,0.5)", letterSpacing: "5px" }}
        >
          {currentSession === "work" ? "FOCUS" : currentSession === "short-break" ? "SHORT" : "LONG BREAK"}
        </text>
      </svg>
    </div>
  );
}
