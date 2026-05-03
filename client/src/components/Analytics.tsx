import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "@/lib/utils";

interface AnalyticsProps { className?: string; }
type Period = "daily" | "weekly" | "monthly" | "yearly";

// TODO: remove mock data - replace with real analytics from backend/localStorage
const MOCK: Record<Period, { chart: { name: string; sessions: number }[]; total: number; time: number }> = {
  daily: {
    chart: [
      { name: "9am", sessions: 4 }, { name: "11am", sessions: 2 },
      { name: "1pm", sessions: 0 }, { name: "3pm", sessions: 6 },
      { name: "5pm", sessions: 3 }, { name: "7pm", sessions: 1 },
    ],
    total: 16, time: 400,
  },
  weekly: {
    chart: [
      { name: "Mon", sessions: 12 }, { name: "Tue", sessions: 8 },
      { name: "Wed", sessions: 16 }, { name: "Thu", sessions: 14 },
      { name: "Fri", sessions: 10 }, { name: "Sat", sessions: 6 }, { name: "Sun", sessions: 4 },
    ],
    total: 70, time: 1750,
  },
  monthly: {
    chart: [
      { name: "Wk 1", sessions: 45 }, { name: "Wk 2", sessions: 52 },
      { name: "Wk 3", sessions: 38 }, { name: "Wk 4", sessions: 41 },
    ],
    total: 176, time: 4400,
  },
  yearly: {
    chart: [
      { name: "Jan", sessions: 120 }, { name: "Feb", sessions: 110 },
      { name: "Mar", sessions: 140 }, { name: "Apr", sessions: 130 },
      { name: "May", sessions: 150 }, { name: "Jun", sessions: 135 },
    ],
    total: 785, time: 19625,
  },
};

const fmtTime = (m: number) => {
  const h = Math.floor(m / 60);
  return h > 0 ? `${h}h ${m % 60}m` : `${m}m`;
};

const GlassPanel = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div
    className={cn("rounded-2xl p-5", className)}
    style={{
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
    }}
  >
    {children}
  </div>
);

export default function Analytics({ className }: AnalyticsProps) {
  const [period, setPeriod] = useState<Period>("weekly");
  const d = MOCK[period];
  const periods: Period[] = ["daily", "weekly", "monthly", "yearly"];

  return (
    <div className={cn("space-y-5", className)}>
      {/* Period selector */}
      <div
        className="flex gap-1 p-1 rounded-full"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        {periods.map(p => {
          const active = p === period;
          return (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              data-testid={`button-period-${p}`}
              className="flex-1 py-2 rounded-full text-xs font-medium capitalize transition-all duration-200"
              style={{
                color: active ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.35)",
                background: active ? "rgba(255,255,255,0.1)" : "transparent",
                border: active ? "1px solid rgba(255,255,255,0.15)" : "1px solid transparent",
                letterSpacing: "0.05em",
              }}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          );
        })}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <GlassPanel className="text-center">
          <div className="text-2xl font-mono font-light" style={{ color: "rgba(255,255,255,0.9)" }}>{d.total}</div>
          <div className="text-xs tracking-widest uppercase mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>Sessions</div>
        </GlassPanel>
        <GlassPanel className="text-center">
          <div className="text-2xl font-mono font-light" style={{ color: "rgba(255,255,255,0.9)" }}>{fmtTime(d.time)}</div>
          <div className="text-xs tracking-widest uppercase mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>Focus Time</div>
        </GlassPanel>
      </div>

      {/* Bar chart */}
      <GlassPanel>
        <div className="text-xs tracking-widest uppercase mb-4" style={{ color: "rgba(255,255,255,0.35)" }}>
          Sessions Over Time
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={d.chart} barSize={14}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} width={20} />
              <Tooltip
                contentStyle={{
                  background: "rgba(10,10,18,0.95)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10,
                  color: "rgba(255,255,255,0.85)",
                  fontSize: 11,
                  backdropFilter: "blur(20px)",
                }}
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
              />
              <Bar dataKey="sessions" fill="rgba(255,255,255,0.7)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassPanel>

      {/* Breakdown */}
      <GlassPanel className="space-y-4">
        <div className="text-xs tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.35)" }}>
          Session Breakdown
        </div>
        {[
          { label: "Focus",       pct: 75, color: "rgba(255,255,255,0.7)" },
          { label: "Short Break", pct: 20, color: "rgba(130,220,190,0.7)" },
          { label: "Long Break",  pct: 5,  color: "rgba(130,170,255,0.7)" },
        ].map(({ label, pct, color }) => (
          <div key={label} className="space-y-1.5">
            <div className="flex justify-between text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
              <span>{label}</span>
              <span className="font-mono">{pct}%</span>
            </div>
            <div className="h-px w-full rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: color }}
              />
            </div>
          </div>
        ))}
      </GlassPanel>
    </div>
  );
}
