import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "@/lib/utils";
import { useSessions } from "@/hooks/use-sessions";

interface AnalyticsProps { className?: string; }
type Period = "daily" | "weekly" | "monthly" | "yearly";
type SessionRecord = any; // We get it from the API now

const fmtTime = (m: number) => { const h = Math.floor(m / 60); return h > 0 ? `${h}h ${m % 60}m` : `${m}m`; };

const GlassPanel = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("rounded-2xl p-5", className)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
    {children}
  </div>
);

function processAnalytics(records: SessionRecord[], period: Period) {
  const now = new Date();
  const msPerDay = 86400000;
  let filtered: SessionRecord[] = [];
  
  const toDateStr = (d: any) => {
    const date = new Date(d);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const todayStr = toDateStr(now);

  if (period === "daily") {
    filtered = records.filter(r => toDateStr(r.startTime) === todayStr);
  } else if (period === "weekly") {
    const weekAgo = new Date(now.getTime() - 7 * msPerDay);
    const weekAgoStr = toDateStr(weekAgo);
    filtered = records.filter(r => toDateStr(r.startTime) >= weekAgoStr);
  } else if (period === "monthly") {
    const monthAgo = new Date(now.getTime() - 30 * msPerDay);
    const monthAgoStr = toDateStr(monthAgo);
    filtered = records.filter(r => toDateStr(r.startTime) >= monthAgoStr);
  } else if (period === "yearly") {
    const yearAgo = new Date(now.getTime() - 365 * msPerDay);
    const yearAgoStr = toDateStr(yearAgo);
    filtered = records.filter(r => toDateStr(r.startTime) >= yearAgoStr);
  }

  const workSessions = filtered.filter(r => r.type === "work");
  const shortBreakSessions = filtered.filter(r => r.type === "short-break");
  const longBreakSessions = filtered.filter(r => r.type === "long-break");

  let total = workSessions.length;
  let focusTime = workSessions.reduce((acc, r) => acc + Math.floor(r.duration / 60), 0);
  let shortBreakTime = shortBreakSessions.reduce((acc, r) => acc + Math.floor(r.duration / 60), 0);
  let longBreakTime = longBreakSessions.reduce((acc, r) => acc + Math.floor(r.duration / 60), 0);

  const totalTime = focusTime + shortBreakTime + longBreakTime;
  
  const workPct = totalTime > 0 ? Math.round((focusTime / totalTime) * 100) : 0;
  const shortPct = totalTime > 0 ? Math.round((shortBreakTime / totalTime) * 100) : 0;
  const longPct = totalTime > 0 ? Math.max(0, 100 - workPct - shortPct) : 0;

  let chart: { name: string; sessions: number }[] = [];
  
  if (period === "daily") {
    const hours = new Array(24).fill(0);
    workSessions.forEach(r => {
      const h = new Date(r.startTime).getHours();
      hours[h]++;
    });
    const blocks = ["12am", "3am", "6am", "9am", "12pm", "3pm", "6pm", "9pm"];
    chart = blocks.map((name, i) => {
      const count = hours[i*3] + hours[i*3+1] + hours[i*3+2];
      return { name, sessions: count };
    });
  } else if (period === "weekly") {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const counts = new Array(7).fill(0);
    workSessions.forEach(r => {
      const d = new Date(r.startTime).getDay();
      counts[d]++;
    });
    // Reorder days to start from today back to 7 days ago if we wanted, but standard week is fine
    chart = days.map((name, i) => ({ name, sessions: counts[i] }));
  } else if (period === "monthly") {
    const counts = [0, 0, 0, 0];
    workSessions.forEach(r => {
      const diff = Math.floor((now.getTime() - new Date(r.startTime).getTime()) / msPerDay);
      if (diff < 7) counts[3]++;
      else if (diff < 14) counts[2]++;
      else if (diff < 21) counts[1]++;
      else if (diff < 28) counts[0]++;
    });
    chart = [
      { name: "Wk 1", sessions: counts[0] },
      { name: "Wk 2", sessions: counts[1] },
      { name: "Wk 3", sessions: counts[2] },
      { name: "Wk 4", sessions: counts[3] }
    ];
  } else if (period === "yearly") {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const counts = new Array(12).fill(0);
    workSessions.forEach(r => {
      const m = new Date(r.startTime).getMonth();
      counts[m]++;
    });
    chart = months.map((name, i) => ({ name, sessions: counts[i] }));
  }

  return {
    chart: chart,
    total,
    time: focusTime,
    breakdown: [
      { label: "Focus", pct: workPct, color: "rgba(255,255,255,0.8)" },
      { label: "Short Break", pct: shortPct, color: "rgba(100,210,170,0.8)" },
      { label: "Long Break", pct: longPct, color: "rgba(140,175,255,0.8)" }
    ]
  };
}

export default function Analytics({ className }: AnalyticsProps) {
  const [period, setPeriod] = useState<Period>("weekly");
  const periods: Period[] = ["daily", "weekly", "monthly", "yearly"];
  
  const { sessions: history } = useSessions();
  const d = useMemo(() => processAnalytics(history || [], period), [history, period]);

  return (
    <div className={cn("space-y-5", className)}>
      {/* Period selector */}
      <div className="flex gap-1 p-1 rounded-full" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
        {periods.map(p => {
          const active = p === period;
          return (
            <button key={p} onClick={() => setPeriod(p)} data-testid={`button-period-${p}`}
              className="flex-1 py-2 rounded-full text-xs font-semibold capitalize transition-all duration-200"
              style={{
                fontFamily: "'Rajdhani',sans-serif", letterSpacing: "0.08em",
                color: active ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.5)",
                background: active ? "rgba(255,255,255,0.12)" : "transparent",
                border: active ? "1px solid rgba(255,255,255,0.18)" : "1px solid transparent",
              }}
            >{p.charAt(0).toUpperCase() + p.slice(1)}</button>
          );
        })}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        {[{ label: "Sessions", value: String(d.total) }, { label: "Focus Time", value: fmtTime(d.time) }].map(({ label, value }) => (
          <GlassPanel key={label} className="text-center">
            <div className="text-2xl font-light" style={{ fontFamily: "'JetBrains Mono',monospace", color: "rgba(255,255,255,0.95)" }}>{value}</div>
            <div className="text-xs font-semibold tracking-[0.18em] uppercase mt-1.5" style={{ fontFamily: "'Rajdhani',sans-serif", color: "rgba(255,255,255,0.5)" }}>{label}</div>
          </GlassPanel>
        ))}
      </div>

      {/* Bar chart */}
      <GlassPanel>
        <div className="text-xs font-semibold tracking-[0.18em] uppercase mb-4" style={{ fontFamily: "'Rajdhani',sans-serif", color: "rgba(255,255,255,0.55)" }}>
          Sessions Over Time
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={d.chart} barSize={16}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)", fontFamily: "'Rajdhani',sans-serif" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "rgba(255,255,255,0.45)", fontFamily: "'Rajdhani',sans-serif" }} axisLine={false} tickLine={false} width={22} />
              <Tooltip
                contentStyle={{ background: "rgba(8,8,18,0.97)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, color: "rgba(255,255,255,0.9)", fontSize: 12 }}
                cursor={{ fill: "rgba(255,255,255,0.04)" }}
              />
              <Bar dataKey="sessions" fill="rgba(255,255,255,0.75)" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassPanel>

      {/* Breakdown */}
      <GlassPanel className="space-y-4">
        <div className="text-xs font-semibold tracking-[0.18em] uppercase" style={{ fontFamily: "'Rajdhani',sans-serif", color: "rgba(255,255,255,0.55)" }}>
          Session Breakdown
        </div>
        {d.breakdown.map(({ label, pct, color }) => (
          <div key={label} className="space-y-2">
            <div className="flex justify-between text-xs font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>
              <span style={{ fontFamily: "'Space Grotesk',sans-serif" }}>{label}</span>
              <span style={{ fontFamily: "'JetBrains Mono',monospace" }}>{pct}%</span>
            </div>
            <div className="h-1 w-full rounded-full" style={{ background: "rgba(255,255,255,0.1)" }}>
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
            </div>
          </div>
        ))}
      </GlassPanel>
    </div>
  );
}
