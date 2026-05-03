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
  currentStreak,
  longestStreak,
  todaySessions,
  dailyGoal = 8,
  className,
}: StreakCounterProps) {
  const pct = Math.min((todaySessions / dailyGoal) * 100, 100);
  const done = todaySessions >= dailyGoal;

  return (
    <div
      className={cn("rounded-2xl p-5", className)}
      style={{
        background: "hsl(var(--card))",
        boxShadow: "var(--neu-raised)",
      }}
    >
      <div className="flex items-center justify-between mb-5">
        {/* Streak */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: currentStreak > 0
                ? "linear-gradient(145deg, hsl(38 92% 65%), hsl(16 88% 60%))"
                : "hsl(var(--muted))",
              boxShadow: currentStreak > 0
                ? "3px 3px 8px rgba(0,0,0,0.3), -1px -1px 4px rgba(255,255,255,0.06)"
                : "var(--neu-raised)",
            }}
          >
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <div
              className="text-2xl font-bold font-mono"
              style={{ color: "hsl(var(--foreground))" }}
              data-testid="text-current-streak"
            >
              {currentStreak}
            </div>
            <div className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
              Day Streak
            </div>
          </div>
        </div>

        {/* Best */}
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4" style={{ color: "hsl(var(--muted-foreground))" }} />
          <div className="text-right">
            <div
              className="text-lg font-bold font-mono"
              style={{ color: "hsl(var(--foreground))" }}
              data-testid="text-longest-streak"
            >
              {longestStreak}
            </div>
            <div className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>Best</div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span style={{ color: "hsl(var(--muted-foreground))" }}>Today's Goal</span>
          <span
            className="font-mono font-semibold"
            style={{ color: done ? "hsl(142 71% 55%)" : "hsl(var(--chart-1))" }}
            data-testid="badge-daily-progress"
          >
            {todaySessions}/{dailyGoal}
          </span>
        </div>

        {/* Track */}
        <div
          className="h-2 w-full rounded-full overflow-hidden"
          style={{ boxShadow: "var(--neu-pressed)", background: "hsl(var(--muted))" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: done
                ? "linear-gradient(90deg, hsl(142 71% 50%), hsl(162 71% 55%))"
                : "linear-gradient(90deg, hsl(16 88% 65%), hsl(38 92% 60%))",
            }}
          />
        </div>

        {done && (
          <div className="text-xs font-medium text-center" style={{ color: "hsl(142 71% 55%)" }}>
            Daily goal achieved!
          </div>
        )}
      </div>
    </div>
  );
}
