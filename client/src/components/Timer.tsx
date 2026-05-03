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

const SESSION_GLOW: Record<SessionType, string> = {
  "work":         "rgba(255,255,255,0.28)",
  "short-break":  "rgba(100,210,170,0.28)",
  "long-break":   "rgba(120,160,240,0.25)",
};
const SESSION_ARC: Record<SessionType, string> = {
  "work":         "rgba(255,255,255,0.92)",
  "short-break":  "rgba(100,210,170,0.88)",
  "long-break":   "rgba(140,175,255,0.85)",
};

export default function Timer({ timeRemaining, totalTime, currentSession, state, className }: TimerProps) {
  const [displayed, setDisplayed] = useState(timeRemaining);
  const prevTime = useRef(timeRemaining);

  useEffect(() => {
    setDisplayed(timeRemaining);
    prevTime.current = timeRemaining;
  }, [timeRemaining]);

  const SIZE = 300;
  const TRACK_R = 140;
  const INNER_R = 118;
  const STROKE = 2;

  const circ = 2 * Math.PI * TRACK_R;
  const progress = totalTime > 0 ? (totalTime - timeRemaining) / totalTime : 0;
  const offset = circ - progress * circ;

  const mins = Math.floor(displayed / 60).toString().padStart(2, "0");
  const secs = (displayed % 60).toString().padStart(2, "0");

  const arcColor  = SESSION_ARC[currentSession];
  const glowColor = SESSION_GLOW[currentSession];
  const isRunning = state === "running";

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* Ambient glow */}
      <div
        style={{
          position: "absolute",
          width: SIZE * 0.85, height: SIZE * 0.85,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
          filter: "blur(35px)",
          opacity: isRunning ? 1 : 0.4,
          transition: "opacity 1.2s ease, background 1s ease",
          pointerEvents: "none",
        }}
        className={isRunning ? "animate-glow-pulse" : ""}
      />

      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ overflow: "visible" }}>
        <defs>
          <radialGradient id="sphere-dark" cx="38%" cy="32%" r="70%">
            <stop offset="0%" stopColor="#1e1e2e" />
            <stop offset="100%" stopColor="#050508" />
          </radialGradient>
          <radialGradient id="rim-light" cx="50%" cy="50%" r="50%">
            <stop offset="72%" stopColor="transparent" />
            <stop offset="100%" stopColor={glowColor} />
          </radialGradient>
          <filter id="arc-glow">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Track */}
        <circle cx={SIZE/2} cy={SIZE/2} r={TRACK_R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={STROKE} />

        {/* Progress arc */}
        <circle
          cx={SIZE/2} cy={SIZE/2} r={TRACK_R}
          fill="none" stroke={arcColor}
          strokeWidth={STROKE + 1} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          transform={`rotate(-90 ${SIZE/2} ${SIZE/2})`}
          filter="url(#arc-glow)"
          style={{ transition: "stroke-dashoffset 1s linear, stroke 0.8s ease" }}
          className={isRunning ? "animate-ring-pulse" : ""}
        />

        {/* Sphere */}
        <circle cx={SIZE/2} cy={SIZE/2} r={INNER_R} fill="url(#sphere-dark)" />
        <circle cx={SIZE/2} cy={SIZE/2} r={INNER_R} fill="url(#rim-light)" style={{ transition: "fill 1s ease" }} />

        {/* Digits */}
        <text
          x={SIZE/2 - 12} y={SIZE/2 - 6}
          textAnchor="end" dominantBaseline="middle"
          style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "54px", fontWeight: 300, fill: "rgba(255,255,255,0.96)", letterSpacing: "2px" }}
          data-testid="text-timer-display"
        >{mins}</text>

        <text
          x={SIZE/2} y={SIZE/2 - 10}
          textAnchor="middle" dominantBaseline="middle"
          style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "40px", fontWeight: 200, fill: arcColor }}
          className={isRunning ? "animate-ring-pulse" : ""}
        >:</text>

        <text
          x={SIZE/2 + 12} y={SIZE/2 - 6}
          textAnchor="start" dominantBaseline="middle"
          style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "54px", fontWeight: 300, fill: "rgba(255,255,255,0.96)", letterSpacing: "2px" }}
        >{secs}</text>

        {/* Label */}
        <text
          x={SIZE/2} y={SIZE/2 + 44}
          textAnchor="middle"
          style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: "12px", fontWeight: 600, fill: "rgba(255,255,255,0.5)", letterSpacing: "5px" }}
        >
          {currentSession === "work" ? "FOCUS" : currentSession === "short-break" ? "SHORT BREAK" : "LONG BREAK"}
        </text>

        {isRunning && (
          <circle cx={SIZE/2} cy={SIZE/2 + 64} r={2.5} fill={arcColor} opacity={0.8}>
            <animate attributeName="opacity" values="0.8;0.15;0.8" dur="1.8s" repeatCount="indefinite" />
          </circle>
        )}
      </svg>
    </div>
  );
}
