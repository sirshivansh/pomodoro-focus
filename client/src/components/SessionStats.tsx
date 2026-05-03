import { cn } from "@/lib/utils";

interface SessionStatsProps {
  sessionsCompleted: number;
  currentCycle: number;
  totalCycles: number;
  timeSpentToday: number;
  className?: string;
}

interface StatItemProps {
  label: string;
  value: string;
  subValue?: string;
}

function StatItem({ label, value, subValue }: StatItemProps) {
  return (
    <div
      className="flex-1 flex flex-col items-center gap-1 py-4 rounded-xl"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div
        className="text-2xl font-mono font-light"
        style={{ color: "rgba(255,255,255,0.88)" }}
      >
        {value}
      </div>
      {subValue && (
        <div className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.35)" }}>
          {subValue}
        </div>
      )}
      <div className="text-xs tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.25)" }}>
        {label}
      </div>
    </div>
  );
}

export default function SessionStats({
  sessionsCompleted, currentCycle, totalCycles, timeSpentToday, className,
}: SessionStatsProps) {
  const h = Math.floor(timeSpentToday / 60);
  const m = timeSpentToday % 60;
  const timeStr = h > 0 ? `${h}h ${m}m` : `${m}m`;

  return (
    <div className={cn("flex gap-3", className)}>
      <StatItem label="Sessions" value={String(sessionsCompleted)} data-testid="text-sessions-completed" />
      <StatItem label="Cycle" value={`${currentCycle}`} subValue={`of ${totalCycles}`} data-testid="badge-current-cycle" />
      <StatItem label="Today" value={timeStr} data-testid="text-time-today" />
    </div>
  );
}
