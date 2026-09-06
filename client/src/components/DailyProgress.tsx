import { cn } from "@/lib/utils";

interface DailyProgressProps {
  completed: number;
  goal: number;
  className?: string;
}

export default function DailyProgress({ completed, goal, className }: DailyProgressProps) {
  const dots = Array.from({ length: goal }, (_, i) => i < completed);

  return (
    <div
      className={cn("rounded-2xl p-5 space-y-3", className)}
      style={{
        background: "var(--surface-card)",
        border: "1px solid var(--surface-card-border)",
      }}
    >
      <div className="flex items-center justify-between">
        <h3
          className="text-xs font-bold tracking-[0.2em] uppercase"
          style={{
            fontFamily: "'Rajdhani',sans-serif",
            color: "var(--text-primary)",
          }}
        >
          DAILY PROGRESS
        </h3>
        <span
          style={{
            fontFamily: "'JetBrains Mono',monospace",
            fontSize: "11px",
            color: "var(--text-secondary)",
          }}
        >
          {completed}/{goal}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <span
          className="mr-2"
          style={{
            fontFamily: "'Rajdhani',sans-serif",
            fontWeight: 700,
            fontSize: "14px",
            color: "var(--text-primary)",
            letterSpacing: "0.08em",
          }}
        >
          {goal} Pomodoro
        </span>
        {dots.map((filled, i) => (
          <div
            key={i}
            className="transition-all duration-500"
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: filled
                ? "var(--accent-amber)"
                : "rgba(255,255,255,0.08)",
              border: filled
                ? "1px solid rgba(245,166,35,0.6)"
                : "1px solid rgba(255,255,255,0.1)",
              boxShadow: filled
                ? "0 0 8px rgba(245,166,35,0.35)"
                : "none",
              animationDelay: filled ? `${i * 50}ms` : undefined,
            }}
          />
        ))}
      </div>
    </div>
  );
}
