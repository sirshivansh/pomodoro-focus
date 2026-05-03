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

const SESSION_COLORS: Record<SessionType, string> = {
  "work": "#F4785A",
  "short-break": "#60C7A8",
  "long-break": "#7B9EF4",
};

const SESSION_GLOW: Record<SessionType, string> = {
  "work": "rgba(244,120,90,0.35)",
  "short-break": "rgba(96,199,168,0.3)",
  "long-break": "rgba(123,158,244,0.3)",
};

export default function Timer({ timeRemaining, totalTime, currentSession, state, className }: TimerProps) {
  const [displayed, setDisplayed] = useState(timeRemaining);

  useEffect(() => { setDisplayed(timeRemaining); }, [timeRemaining]);

  const size = 300;
  const strokeWidth = 10;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = totalTime > 0 ? ((totalTime - timeRemaining) / totalTime) : 0;
  const offset = circumference - progress * circumference;

  const mins = Math.floor(displayed / 60).toString().padStart(2, "0");
  const secs = (displayed % 60).toString().padStart(2, "0");

  const color = SESSION_COLORS[currentSession];
  const glow = SESSION_GLOW[currentSession];

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div
        className="relative flex items-center justify-center rounded-full"
        style={{
          width: size,
          height: size,
          boxShadow: `var(--neu-raised-lg), 0 0 40px ${state === "running" ? glow : "transparent"}`,
          background: "hsl(var(--card))",
          transition: "box-shadow 0.6s ease",
        }}
      >
        {/* Outer track ring */}
        <svg
          className="absolute inset-0"
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: "rotate(-90deg)" }}
        >
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={strokeWidth}
          />
          {/* Progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: "stroke-dashoffset 1s linear, stroke 0.5s ease",
              filter: `drop-shadow(0 0 6px ${color})`,
            }}
          />
        </svg>

        {/* Time display */}
        <div className="relative flex flex-col items-center select-none">
          <div
            className="font-mono tracking-wider"
            style={{
              fontSize: "4.5rem",
              fontWeight: 700,
              lineHeight: 1,
              color: "hsl(var(--foreground))",
              letterSpacing: "0.05em",
            }}
            data-testid="text-timer-display"
          >
            {mins}
            <span style={{ color: color, opacity: 0.9 }}>:</span>
            {secs}
          </div>

          <div className="mt-3 text-sm font-medium" style={{ color: color }}>
            {currentSession === "work"
              ? "Focus Time"
              : currentSession === "short-break"
              ? "Short Break"
              : "Long Break"}
          </div>

          <div className="mt-1 text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
            {state === "running" ? "In Progress" : state === "paused" ? "Paused" : "Ready"}
          </div>
        </div>
      </div>
    </div>
  );
}
