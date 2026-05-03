import { cn } from "@/lib/utils";

interface SessionStatsProps {
  sessionsCompleted: number;
  currentCycle: number;
  totalCycles: number;
  timeSpentToday: number;
  className?: string;
}

function StatItem({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div
      className="flex-1 flex flex-col items-center gap-1 py-4 rounded-xl animate-fade-in-up"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        className="text-2xl font-light"
        style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(255,255,255,0.88)" }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>
          {sub}
        </div>
      )}
      <div
        className="text-xs tracking-[0.22em] uppercase"
        style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 500, color: "rgba(255,255,255,0.22)" }}
      >
        {label}
      </div>
    </div>
  );
}

export default function SessionStats({ sessionsCompleted, currentCycle, totalCycles, timeSpentToday, className }: SessionStatsProps) {
  const h = Math.floor(timeSpentToday / 60);
  const m = timeSpentToday % 60;
  const timeStr = h > 0 ? `${h}h ${m}m` : `${m}m`;

  return (
    <div className={cn("flex gap-2.5", className)}>
      <StatItem label="Sessions" value={String(sessionsCompleted)} data-testid="text-sessions-completed" />
      <StatItem label="Cycle" value={String(currentCycle)} sub={`/ ${totalCycles}`} data-testid="badge-current-cycle" />
      <StatItem label="Today" value={timeStr} data-testid="text-time-today" />
    </div>
  );
}
