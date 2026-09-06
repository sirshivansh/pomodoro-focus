import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakCounterProps {
  currentStreak: number;
  longestStreak: number;
  todaySessions: number;
  dailyGoal: number;
  className?: string;
}

export default function StreakCounter({
  currentStreak,
  longestStreak,
  todaySessions,
  dailyGoal = 8,
  className,
}: StreakCounterProps) {
  return (
    <div
      className={cn("rounded-2xl p-5 space-y-3", className)}
      style={{
        background: "var(--surface-card)",
        border: "1px solid var(--surface-card-border)",
      }}
    >
      <h3
        className="text-xs font-bold tracking-[0.2em] uppercase"
        style={{
          fontFamily: "'Rajdhani',sans-serif",
          color: "var(--text-primary)",
        }}
      >
        FOCUS STREAK
      </h3>

      <div className="flex items-center gap-3">
        <div className="flex items-baseline gap-1.5" data-testid="text-current-streak">
          <span
            className="text-4xl font-light"
            style={{
              fontFamily: "'JetBrains Mono',monospace",
              color: "var(--text-primary)",
            }}
          >
            {currentStreak}
          </span>
          <span
            className="text-lg font-semibold tracking-[0.1em] uppercase"
            style={{
              fontFamily: "'Rajdhani',sans-serif",
              color: "var(--text-secondary)",
            }}
          >
            Days
          </span>
        </div>

        <div className="flex gap-1 ml-2">
          <Flame
            className="w-6 h-6"
            style={{
              color: currentStreak > 0 ? "#f5a623" : "rgba(255,255,255,0.2)",
              filter: currentStreak > 0 ? "drop-shadow(0 0 6px rgba(245,166,35,0.5))" : "none",
            }}
          />
          {currentStreak >= 7 && (
            <Flame
              className="w-7 h-7"
              style={{
                color: "#ff8c00",
                filter: "drop-shadow(0 0 8px rgba(255,140,0,0.5))",
              }}
            />
          )}
        </div>
      </div>

      <div
        className="flex items-center gap-2"
        style={{
          fontFamily: "'Space Grotesk',sans-serif",
          fontSize: "11px",
          color: "var(--text-muted)",
        }}
      >
        <span>Current Streak: {currentStreak} Days</span>
        <span style={{ color: "rgba(255,255,255,0.15)" }}>|</span>
        <span data-testid="text-longest-streak">Longest: {longestStreak} Days</span>
      </div>
    </div>
  );
}
