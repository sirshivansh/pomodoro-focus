import { useEffect, useState } from "react";
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
  "work":         "rgba(255,255,255,0.25)",
  "short-break":  "rgba(130,220,190,0.25)",
  "long-break":   "rgba(130,170,255,0.22)",
};

const SESSION_ARC: Record<SessionType, string> = {
  "work":         "rgba(255,255,255,0.92)",
  "short-break":  "rgba(130,220,190,0.85)",
  "long-break":   "rgba(130,170,255,0.80)",
};

export default function Timer({ timeRemaining, totalTime, currentSession, state, className }: TimerProps) {
  const [displayed, setDisplayed] = useState(timeRemaining);
  useEffect(() => { setDisplayed(timeRemaining); }, [timeRemaining]);

  const SIZE = 320;
  const TRACK_R = 148;    // outer progress ring
  const INNER_R = 126;    // inner dark sphere radius
  const STROKE = 1.5;

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
      {/* Ambient glow behind the circle */}
      <div
        style={{
          position: "absolute",
          width: SIZE * 0.8,
          height: SIZE * 0.8,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
          filter: "blur(40px)",
          opacity: isRunning ? 1 : 0.4,
          transition: "opacity 1s ease, background 1s ease",
          pointerEvents: "none",
        }}
      />

      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ overflow: "visible" }}>
        <defs>
          {/* Inner sphere gradient */}
          <radialGradient id="sphere-grad" cx="40%" cy="35%" r="65%">
            <stop offset="0%"   stopColor="#1c1c28" />
            <stop offset="100%" stopColor="#050508" />
          </radialGradient>

          {/* Rim-light around sphere edge */}
          <radialGradient id="rim-grad" cx="50%" cy="50%" r="50%">
            <stop offset="78%" stopColor="transparent" />
            <stop offset="100%" stopColor={glowColor} />
          </radialGradient>

          {/* Glow filter for progress arc */}
          <filter id="arc-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer faint track circle */}
        <circle
          cx={SIZE / 2} cy={SIZE / 2} r={TRACK_R}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={STROKE}
        />

        {/* Progress arc */}
        <circle
          cx={SIZE / 2} cy={SIZE / 2} r={TRACK_R}
          fill="none"
          stroke={arcColor}
          strokeWidth={STROKE + 0.5}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          filter="url(#arc-glow)"
          style={{ transition: "stroke-dashoffset 1s linear, stroke 0.8s ease" }}
        />

        {/* Inner dark sphere */}
        <circle
          cx={SIZE / 2} cy={SIZE / 2} r={INNER_R}
          fill="url(#sphere-grad)"
        />

        {/* Rim light overlay */}
        <circle
          cx={SIZE / 2} cy={SIZE / 2} r={INNER_R}
          fill="url(#rim-grad)"
          style={{ transition: "fill 1s ease" }}
        />

        {/* Time text */}
        <text
          x={SIZE / 2} y={SIZE / 2 - 10}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "58px",
            fontWeight: 300,
            fill: "rgba(255,255,255,0.95)",
            letterSpacing: "4px",
          }}
          data-testid="text-timer-display"
        >
          {mins}:{secs}
        </text>

        {/* Session label */}
        <text
          x={SIZE / 2} y={SIZE / 2 + 38}
          textAnchor="middle"
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "11px",
            fontWeight: 400,
            fill: "rgba(255,255,255,0.35)",
            letterSpacing: "3px",
            textTransform: "uppercase",
          }}
        >
          {currentSession === "work" ? "FOCUS" : currentSession === "short-break" ? "SHORT BREAK" : "LONG BREAK"}
        </text>

        {/* State dot */}
        {isRunning && (
          <circle cx={SIZE / 2} cy={SIZE / 2 + 60} r={3} fill={arcColor} opacity={0.8}>
            <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite" />
          </circle>
        )}
      </svg>
    </div>
  );
}
