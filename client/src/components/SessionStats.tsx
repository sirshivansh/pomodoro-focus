import { CheckCircle, Target, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface SessionStatsProps {
  sessionsCompleted: number;
  currentCycle: number;
  totalCycles: number;
  timeSpentToday: number;
  className?: string;
}

interface StatPillProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  color: string;
}

function StatPill({ icon, value, label, color }: StatPillProps) {
  return (
    <div
      className="flex-1 flex flex-col items-center gap-2 py-4 rounded-xl"
      style={{
        background: "hsl(var(--card))",
        boxShadow: "var(--neu-raised)",
      }}
    >
      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ color }}>
        {icon}
      </div>
      <div className="text-xl font-bold font-mono" style={{ color: "hsl(var(--foreground))" }}>
        {value}
      </div>
      <div className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{label}</div>
    </div>
  );
}

export default function SessionStats({
  sessionsCompleted,
  currentCycle,
  totalCycles,
  timeSpentToday,
  className,
}: SessionStatsProps) {
  const formatTime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h${m > 0 ? ` ${m}m` : ""}` : `${m}m`;
  };

  return (
    <div className={cn("flex gap-3", className)}>
      <StatPill
        icon={<CheckCircle className="w-5 h-5" />}
        value={String(sessionsCompleted)}
        label="Sessions"
        color="hsl(142 71% 55%)"
        data-testid="text-sessions-completed"
      />
      <StatPill
        icon={<Target className="w-5 h-5" />}
        value={`${currentCycle}/${totalCycles}`}
        label="Cycle"
        color="hsl(16 88% 65%)"
        data-testid="badge-current-cycle"
      />
      <StatPill
        icon={<Clock className="w-5 h-5" />}
        value={formatTime(timeSpentToday)}
        label="Today"
        color="hsl(38 92% 60%)"
        data-testid="text-time-today"
      />
    </div>
  );
}
