import { Flame, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakCounterProps {
  currentStreak: number;
  longestStreak: number;
  todaySessions: number;
  dailyGoal: number;
  className?: string;
}

export default function StreakCounter({ currentStreak, longestStreak, todaySessions, dailyGoal = 8, className }: StreakCounterProps) {
  const pct = Math.min((todaySessions / dailyGoal) * 100, 100);
  const done = todaySessions >= dailyGoal;

  return (
    <div
      className={cn("rounded-2xl p-5 space-y-4", className)}
      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
    >
      <div className="flex items-center justify-between">
        {/* Current streak */}
        <div className="flex items-center gap-3">
          <Flame className="w-5 h-5" style={{ color: currentStreak > 0 ? "rgba(255,165,70,1)" : "rgba(255,255,255,0.3)" }} />
          <div>
            <div className="text-3xl font-light" style={{ fontFamily: "'JetBrains Mono',monospace", color: "rgba(255,255,255,0.95)" }} data-testid="text-current-streak">
              {currentStreak}
            </div>
            <div className="text-xs font-semibold tracking-[0.22em] uppercase mt-0.5" style={{ fontFamily: "'Rajdhani',sans-serif", color: "rgba(255,255,255,0.55)" }}>
              Day Streak
            </div>
          </div>
        </div>

        {/* Best streak */}
        <div className="flex items-center gap-2.5">
          <Trophy className="w-4 h-4" style={{ color: "rgba(255,255,255,0.4)" }} />
          <div className="text-right">
            <div className="text-2xl font-light" style={{ fontFamily: "'JetBrains Mono',monospace", color: "rgba(255,255,255,0.75)" }} data-testid="text-longest-streak">
              {longestStreak}
            </div>
            <div className="text-xs font-semibold tracking-widest uppercase" style={{ fontFamily: "'Rajdhani',sans-serif", color: "rgba(255,255,255,0.45)" }}>
              Best
            </div>
          </div>
        </div>
      </div>

      {/* Daily goal */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold tracking-[0.18em] uppercase" style={{ fontFamily: "'Rajdhani',sans-serif", color: "rgba(255,255,255,0.5)" }}>
            Daily Goal
          </span>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "12px", color: done ? "rgba(100,220,150,1)" : "rgba(255,255,255,0.7)" }} data-testid="badge-daily-progress">
            {todaySessions} / {dailyGoal}
          </span>
        </div>
        <div className="h-1 w-full rounded-full" style={{ background: "rgba(255,255,255,0.1)" }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background: done ? "rgba(100,220,150,0.9)" : "rgba(255,255,255,0.7)",
              boxShadow: done ? "0 0 8px rgba(100,220,150,0.6)" : "0 0 6px rgba(255,255,255,0.4)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
