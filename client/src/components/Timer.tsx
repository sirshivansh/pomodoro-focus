import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { TimerState, SessionType } from "@shared/schema";

interface TimerProps {
  timeRemaining: number;
  totalTime: number;
  currentSession: SessionType;
  state: TimerState;
  sessionsCompleted?: number;
  sessionsUntilLongBreak?: number;
  className?: string;
}

const SESSION_ARC: Record<SessionType, string> = {
  "work": "#f5a623",
  "short-break": "rgba(100,210,170,0.88)",
  "long-break": "rgba(140,175,255,0.85)",
};

const SESSION_GLOW: Record<SessionType, string> = {
  "work": "rgba(245,166,35,0.25)",
  "short-break": "rgba(100,210,170,0.16)",
  "long-break": "rgba(120,160,240,0.15)",
};

const SESSION_LABEL: Record<SessionType, string> = {
  "work": "FOCUS MODE",
  "short-break": "SHORT BREAK",
  "long-break": "LONG BREAK",
};

export default function Timer({
  timeRemaining,
  totalTime,
  currentSession,
  state,
  sessionsCompleted = 0,
  sessionsUntilLongBreak = 4,
  className,
}: TimerProps) {
  const [displayed, setDisplayed] = useState(timeRemaining);

  useEffect(() => {
    setDisplayed(timeRemaining);
  }, [timeRemaining]);

  const SIZE = 280;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const TRACK = 128;
  const INNER = 108;

  const circ = 2 * Math.PI * TRACK;
  const progress = totalTime > 0 ? (totalTime - displayed) / totalTime : 0;
  const offset = circ - progress * circ;

  const mins = Math.floor(displayed / 60).toString().padStart(2, "0");
  const secs = (displayed % 60).toString().padStart(2, "0");

  const arcColor = SESSION_ARC[currentSession];
  const glowColor = SESSION_GLOW[currentSession];
  const isRunning = state === "running";
  const sessionNum = (sessionsCompleted % sessionsUntilLongBreak) + 1;

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* Ambient glow */}
      <div
        style={{
          position: "absolute",
          width: SIZE * 1.1,
          height: SIZE * 1.1,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${glowColor} 0%, transparent 68%)`,
          filter: "blur(40px)",
          opacity: isRunning ? 1 : 0.35,
          pointerEvents: "none",
          animation: "liquidAmbient 18s ease-in-out infinite",
          transition: "opacity 0.8s ease",
        }}
      />

      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ overflow: "visible" }}>
        <defs>
          <filter id="liquid-filter" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.005 0.008"
              numOctaves="2"
              seed="3"
              result="noise"
            >
              <animate attributeName="baseFrequency" values="0.005 0.008;0.006 0.009;0.005 0.007;0.004 0.008;0.005 0.008" dur="30s" repeatCount="indefinite" />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.8" xChannelSelector="R" yChannelSelector="G" />
          </filter>

          <radialGradient id="sphere-bg" cx="36%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#1a1a28" />
            <stop offset="62%" stopColor="#0f0f18" />
            <stop offset="100%" stopColor="#050508" />
          </radialGradient>

          <radialGradient id="rim-light" cx="50%" cy="50%" r="50%">
            <stop offset="68%" stopColor="transparent" />
            <stop offset="100%" stopColor={glowColor} stopOpacity="0.5" />
          </radialGradient>

          <radialGradient id="highlight-orb" cx="35%" cy="28%" r="40%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>

          <filter id="arc-glow">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <clipPath id="sphere-clip">
            <circle cx={CX} cy={CY} r={INNER} />
          </clipPath>
        </defs>

        {/* Track ring */}
        <circle cx={CX} cy={CY} r={TRACK} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />

        {/* Outer glass ring */}
        <circle cx={CX} cy={CY} r={TRACK + 6} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

        {/* Progress arc */}
        <circle
          cx={CX}
          cy={CY}
          r={TRACK}
          fill="none"
          stroke={arcColor}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${CX} ${CY})`}
          filter="url(#arc-glow)"
          style={{ transition: "stroke-dashoffset 1s linear, stroke 0.8s ease" }}
        />

        {/* Glass sphere */}
        <g filter="url(#liquid-filter)">
          <circle cx={CX} cy={CY} r={INNER} fill="url(#sphere-bg)" />

          <circle cx={CX} cy={CY} r={INNER} fill="url(#highlight-orb)" clipPath="url(#sphere-clip)">
            <animateTransform
              attributeName="transform"
              type="rotate"
              values={`0 ${CX} ${CY};360 ${CX} ${CY}`}
              dur="44s"
              repeatCount="indefinite"
            />
          </circle>

          <ellipse cx={CX - 12} cy={CY - 8} rx={34} ry={22} fill="rgba(255,255,255,0.03)" clipPath="url(#sphere-clip)">
            <animateTransform
              attributeName="transform"
              type="rotate"
              values={`0 ${CX} ${CY};-360 ${CX} ${CY}`}
              dur="58s"
              repeatCount="indefinite"
            />
            <animate attributeName="rx" values="34;36;33;35;34" dur="24s" repeatCount="indefinite" />
            <animate attributeName="ry" values="22;21;23;20;22" dur="26s" repeatCount="indefinite" />
          </ellipse>

          <circle cx={CX} cy={CY} r={INNER} fill="url(#rim-light)" />
        </g>

        {/* Time display */}
        <text
          x={CX}
          y={CY - 8}
          textAnchor="middle"
          dominantBaseline="middle"
          data-testid="text-timer-display"
          style={{
            fontFamily: "'JetBrains Mono',monospace",
            fontSize: "52px",
            fontWeight: 300,
            fill: "rgba(255,255,255,0.96)",
            letterSpacing: "2px",
          }}
        >
          {mins}
          <tspan
            style={{
              fontSize: "40px",
              fontWeight: 200,
              fill: arcColor,
            }}
          >
            :
          </tspan>
          {secs}
        </text>

        {/* Session label */}
        <text
          x={CX}
          y={CY + 32}
          textAnchor="middle"
          style={{
            fontFamily: "'Rajdhani',sans-serif",
            fontSize: "11px",
            fontWeight: 700,
            fill: arcColor,
            letterSpacing: "4px",
          }}
        >
          {SESSION_LABEL[currentSession]}
        </text>

        {/* Session counter */}
        <text
          x={CX}
          y={CY + 48}
          textAnchor="middle"
          style={{
            fontFamily: "'Rajdhani',sans-serif",
            fontSize: "9px",
            fontWeight: 600,
            fill: "rgba(255,255,255,0.35)",
            letterSpacing: "3px",
          }}
        >
          SESSION {sessionNum} / {sessionsUntilLongBreak}
        </text>
      </svg>
    </div>
  );
}
