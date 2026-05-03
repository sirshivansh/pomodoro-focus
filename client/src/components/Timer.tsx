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

const SESSION_ARC: Record<SessionType, string> = {
  "work": "rgba(255,255,255,0.92)",
  "short-break": "rgba(100,210,170,0.88)",
  "long-break": "rgba(140,175,255,0.85)",
};

const SESSION_GLOW: Record<SessionType, string> = {
  "work": "rgba(255,255,255,0.18)",
  "short-break": "rgba(100,210,170,0.16)",
  "long-break": "rgba(120,160,240,0.15)",
};

export default function Timer({ timeRemaining, totalTime, currentSession, state, className }: TimerProps) {
  const [displayed, setDisplayed] = useState(timeRemaining);

  useEffect(() => {
    setDisplayed(timeRemaining);
  }, [timeRemaining]);

  const SIZE = 240;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const TRACK = 112;
  const INNER = 93;

  const circ = 2 * Math.PI * TRACK;
  const progress = totalTime > 0 ? (totalTime - displayed) / totalTime : 0;
  const offset = circ - progress * circ;

  const mins = Math.floor(displayed / 60).toString().padStart(2, "0");
  const secs = (displayed % 60).toString().padStart(2, "0");

  const arcColor = SESSION_ARC[currentSession];
  const glowColor = SESSION_GLOW[currentSession];
  const isRunning = state === "running";

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <div
        style={{
          position: "absolute",
          width: SIZE * 0.95,
          height: SIZE * 0.95,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${glowColor} 0%, transparent 68%)`,
          filter: "blur(32px)",
          opacity: isRunning ? 1 : 0.45,
          pointerEvents: "none",
          animation: "liquidAmbient 18s ease-in-out infinite",
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
            <stop offset="0%" stopColor="#1d1d2a" />
            <stop offset="62%" stopColor="#0f0f18" />
            <stop offset="100%" stopColor="#050508" />
          </radialGradient>

          <radialGradient id="rim-light" cx="50%" cy="50%" r="50%">
            <stop offset="68%" stopColor="transparent" />
            <stop offset="100%" stopColor={glowColor} stopOpacity="0.45" />
          </radialGradient>

          <radialGradient id="highlight-orb" cx="35%" cy="28%" r="40%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>

          <filter id="arc-glow">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <clipPath id="sphere-clip">
            <circle cx={CX} cy={CY} r={INNER} />
          </clipPath>
        </defs>

        <circle cx={CX} cy={CY} r={TRACK} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1.5" />

        <circle
          cx={CX}
          cy={CY}
          r={TRACK}
          fill="none"
          stroke={arcColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${CX} ${CY})`}
          filter="url(#arc-glow)"
          style={{ transition: "stroke-dashoffset 1s linear, stroke 0.8s ease" }}
        />

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

          <ellipse cx={CX - 12} cy={CY - 8} rx={34} ry={22} fill="rgba(255,255,255,0.035)" clipPath="url(#sphere-clip)">
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

        <text
          x={CX - 10}
          y={CY - 4}
          textAnchor="end"
          dominantBaseline="middle"
          style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "42px", fontWeight: 300, fill: "rgba(255,255,255,0.96)", letterSpacing: "1px" }}
          data-testid="text-timer-display"
        >
          {mins}
        </text>

        <text
          x={CX}
          y={CY - 8}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "32px", fontWeight: 200, fill: arcColor }}
        >
          <animate attributeName="opacity" values="1;0.35;1" dur="3.6s" repeatCount={isRunning ? "indefinite" : "1"} />
          :
        </text>

        <text
          x={CX + 10}
          y={CY - 4}
          textAnchor="start"
          dominantBaseline="middle"
          style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "42px", fontWeight: 300, fill: "rgba(255,255,255,0.96)", letterSpacing: "1px" }}
        >
          {secs}
        </text>

        <text
          x={CX}
          y={CY + 36}
          textAnchor="middle"
          style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: "10px", fontWeight: 600, fill: "rgba(255,255,255,0.5)", letterSpacing: "5px" }}
        >
          {currentSession === "work" ? "FOCUS" : currentSession === "short-break" ? "SHORT" : "LONG BREAK"}
        </text>
      </svg>
    </div>
  );
}
