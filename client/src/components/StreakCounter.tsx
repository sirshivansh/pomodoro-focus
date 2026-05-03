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
      className={cn("rounded-2xl p-5 space-y-4 animate-fade-in-up delay-400", className)}
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(20px)",
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Flame
            className="w-4 h-4"
            style={{ color: currentStreak > 0 ? "rgba(255,165,70,0.9)" : "rgba(255,255,255,0.15)" }}
          />
          <div>
            <div
              className="text-2xl font-light"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(255,255,255,0.88)" }}
              data-testid="text-current-streak"
            >
              {currentStreak}
            </div>
            <div
              className="text-xs tracking-[0.22em] uppercase"
              style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 500, color: "rgba(255,255,255,0.22)" }}
            >
              Day Streak
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Trophy className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.18)" }} />
          <div className="text-right">
            <div
              className="text-xl font-light"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(255,255,255,0.6)" }}
              data-testid="text-longest-streak"
            >
              {longestStreak}
            </div>
            <div
              className="text-xs tracking-widest uppercase"
              style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 500, color: "rgba(255,255,255,0.2)" }}
            >
              Best
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span
            className="text-xs tracking-[0.2em] uppercase"
            style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 500, color: "rgba(255,255,255,0.25)" }}
          >
            Daily Goal
          </span>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "11px",
              color: done ? "rgba(100,220,150,0.9)" : "rgba(255,255,255,0.45)",
            }}
            data-testid="badge-daily-progress"
          >
            {todaySessions} / {dailyGoal}
          </span>
        </div>
        <div className="h-px w-full rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background: done ? "rgba(100,220,150,0.8)" : "rgba(255,255,255,0.55)",
              boxShadow: done ? "0 0 6px rgba(100,220,150,0.5)" : "0 0 4px rgba(255,255,255,0.25)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
