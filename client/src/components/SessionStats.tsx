import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface SessionStatsProps {
  sessionsCompleted: number;
  currentCycle: number;
  totalCycles: number;
  timeSpentToday: number;
  weeklyMinutes?: number;
  weeklyPomodoros?: number;
  className?: string;
}

export default function SessionStats({
  sessionsCompleted,
  currentCycle,
  totalCycles,
  timeSpentToday,
  weeklyMinutes = 0,
  weeklyPomodoros = 0,
  className,
}: SessionStatsProps) {
  const todayStr = useMemo(() => {
    if (timeSpentToday >= 60) {
      return `${Math.floor(timeSpentToday / 60)}h ${timeSpentToday % 60}m`;
    }
    return `${timeSpentToday} min`;
  }, [timeSpentToday]);

  const weekStr = useMemo(() => {
    const hrs = (weeklyMinutes / 60).toFixed(1);
    return `${hrs} hrs`;
  }, [weeklyMinutes]);

  return (
    <div
      className={cn("rounded-2xl p-5", className)}
      style={{
        background: "var(--surface-card)",
        border: "1px solid var(--surface-card-border)",
      }}
    >
      <h3
        className="text-xs font-bold tracking-[0.2em] uppercase mb-4"
        style={{
          fontFamily: "'Rajdhani',sans-serif",
          color: "var(--text-primary)",
        }}
      >
        OVERVIEW
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Today */}
        <div className="space-y-1">
          <div
            className="text-xs font-semibold tracking-[0.15em] uppercase"
            style={{
              fontFamily: "'Rajdhani',sans-serif",
              color: "var(--text-muted)",
            }}
          >
            TODAY
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className="text-2xl font-light"
              style={{
                fontFamily: "'JetBrains Mono',monospace",
                color: "var(--text-primary)",
              }}
            >
              {todayStr}
            </span>
            <span
              className="text-lg font-light"
              style={{
                fontFamily: "'JetBrains Mono',monospace",
                color: "var(--accent-amber)",
              }}
            >
              {sessionsCompleted}
            </span>
          </div>
          <div
            style={{
              fontFamily: "'Space Grotesk',sans-serif",
              fontSize: "10px",
              color: "var(--text-muted)",
            }}
          >
            Focused, {sessionsCompleted} Pomodoros
          </div>
        </div>

        {/* This Week */}
        <div className="space-y-1">
          <div
            className="text-xs font-semibold tracking-[0.15em] uppercase"
            style={{
              fontFamily: "'Rajdhani',sans-serif",
              color: "var(--text-muted)",
            }}
          >
            THIS WEEK
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className="text-2xl font-light"
              style={{
                fontFamily: "'JetBrains Mono',monospace",
                color: "var(--text-primary)",
              }}
            >
              {weekStr}
            </span>
          </div>
          <div
            style={{
              fontFamily: "'Space Grotesk',sans-serif",
              fontSize: "10px",
              color: "var(--text-muted)",
            }}
          >
            {weeklyPomodoros} Pomodoros
          </div>
        </div>
      </div>
    </div>
  );
}
