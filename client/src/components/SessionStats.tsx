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
      className="flex-1 flex flex-col items-center gap-1.5 py-5 rounded-xl"
      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
    >
      <div className="text-2xl font-light" style={{ fontFamily: "'JetBrains Mono',monospace", color: "rgba(255,255,255,0.95)" }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>
          {sub}
        </div>
      )}
      <div className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ fontFamily: "'Rajdhani',sans-serif", color: "rgba(255,255,255,0.5)" }}>
        {label}
      </div>
    </div>
  );
}

export default function SessionStats({ sessionsCompleted, currentCycle, totalCycles, timeSpentToday, className }: SessionStatsProps) {
  const h = Math.floor(timeSpentToday / 60);
  const m = timeSpentToday % 60;
  const timeStr = h > 0 ? `${h}h ${m}m` : `${m} min`;

  return (
    <div className={cn("flex gap-3", className)}>
      <StatItem label="Sessions" value={String(sessionsCompleted)} />
      <StatItem label="Cycle" value={String(currentCycle)} sub={`/ ${totalCycles}`} />
      <StatItem label="Today" value={timeStr} />
    </div>
  );
}
