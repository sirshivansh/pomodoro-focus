import { Flame, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakCounterProps {
  currentStreak: number;
  longestStreak: number;
  todaySessions: number;
  dailyGoal: number;
  className?: string;
}

export default function StreakCounter({
  currentStreak, longestStreak, todaySessions, dailyGoal = 8, className,
}: StreakCounterProps) {
  const pct = Math.min((todaySessions / dailyGoal) * 100, 100);
  const done = todaySessions >= dailyGoal;

  return (
    <div
      className={cn("rounded-2xl p-5 space-y-4", className)}
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <div className="flex items-center justify-between">
        {/* Streak counter */}
        <div className="flex items-center gap-3">
          <Flame
            className="w-5 h-5"
            style={{ color: currentStreak > 0 ? "rgba(255,180,80,0.9)" : "rgba(255,255,255,0.2)" }}
          />
          <div>
            <div
              className="text-2xl font-mono font-light"
              style={{ color: "rgba(255,255,255,0.9)" }}
              data-testid="text-current-streak"
            >
              {currentStreak}
            </div>
            <div className="text-xs tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.3)" }}>
              Day Streak
            </div>
          </div>
        </div>

        {/* Best */}
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4" style={{ color: "rgba(255,255,255,0.2)" }} />
          <div className="text-right">
            <div className="text-xl font-mono font-light" style={{ color: "rgba(255,255,255,0.7)" }} data-testid="text-longest-streak">
              {longestStreak}
            </div>
            <div className="text-xs tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.25)" }}>Best</div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.3)" }}>Today</span>
          <span className="font-mono text-xs" style={{ color: done ? "rgba(130,220,160,0.9)" : "rgba(255,255,255,0.55)" }} data-testid="badge-daily-progress">
            {todaySessions} / {dailyGoal}
          </span>
        </div>
        <div
          className="h-px w-full rounded-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.08)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background: done
                ? "linear-gradient(90deg, rgba(130,220,160,0.8), rgba(160,240,200,0.9))"
                : "rgba(255,255,255,0.6)",
              boxShadow: done ? "0 0 8px rgba(130,220,160,0.5)" : "0 0 8px rgba(255,255,255,0.3)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
