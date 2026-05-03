import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "@/lib/utils";

interface AnalyticsProps { className?: string; }
type Period = "daily" | "weekly" | "monthly" | "yearly";

// TODO: remove mock data - replace with real analytics data from backend/localStorage
const MOCK: Record<Period, { chart: { name: string; sessions: number }[]; total: number; time: number }> = {
  daily: {
    chart: [
      { name: "9am", sessions: 4 }, { name: "11am", sessions: 2 }, { name: "1pm", sessions: 0 },
      { name: "3pm", sessions: 6 }, { name: "5pm", sessions: 3 }, { name: "7pm", sessions: 1 },
    ],
    total: 16, time: 400,
  },
  weekly: {
    chart: [
      { name: "Mon", sessions: 12 }, { name: "Tue", sessions: 8 }, { name: "Wed", sessions: 16 },
      { name: "Thu", sessions: 14 }, { name: "Fri", sessions: 10 }, { name: "Sat", sessions: 6 }, { name: "Sun", sessions: 4 },
    ],
    total: 70, time: 1750,
  },
  monthly: {
    chart: [
      { name: "Wk 1", sessions: 45 }, { name: "Wk 2", sessions: 52 }, { name: "Wk 3", sessions: 38 }, { name: "Wk 4", sessions: 41 },
    ],
    total: 176, time: 4400,
  },
  yearly: {
    chart: [
      { name: "Jan", sessions: 120 }, { name: "Feb", sessions: 110 }, { name: "Mar", sessions: 140 },
      { name: "Apr", sessions: 130 }, { name: "May", sessions: 150 }, { name: "Jun", sessions: 135 },
    ],
    total: 785, time: 19625,
  },
};

const fmtTime = (m: number) => {
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return h > 0 ? `${h}h ${rem}m` : `${m}m`;
};

export default function Analytics({ className }: AnalyticsProps) {
  const [period, setPeriod] = useState<Period>("weekly");
  const data = MOCK[period];

  const periods: Period[] = ["daily", "weekly", "monthly", "yearly"];

  return (
    <div className={cn("space-y-6", className)}>
      {/* Period tabs */}
      <div
        className="flex gap-1 p-1 rounded-full"
        style={{ background: "hsl(var(--card))", boxShadow: "var(--neu-pressed)" }}
      >
        {periods.map(p => {
          const active = p === period;
          return (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              data-testid={`button-period-${p}`}
              className="flex-1 py-2 rounded-full text-sm font-medium capitalize transition-all duration-200"
              style={{
                color: active ? "white" : "hsl(var(--muted-foreground))",
                background: active ? "hsl(16 88% 65%)" : "transparent",
                boxShadow: active ? "3px 3px 8px rgba(0,0,0,0.35)" : "none",
              }}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          );
        })}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Total Sessions", value: String(data.total), color: "hsl(16 88% 65%)" },
          { label: "Total Time", value: fmtTime(data.time), color: "hsl(142 71% 55%)" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="rounded-2xl p-4 text-center"
            style={{ background: "hsl(var(--card))", boxShadow: "var(--neu-raised)" }}
          >
            <div className="text-2xl font-bold font-mono" style={{ color }}>{value}</div>
            <div className="text-xs mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div
        className="rounded-2xl p-5"
        style={{ background: "hsl(var(--card))", boxShadow: "var(--neu-raised)" }}
      >
        <div className="text-sm font-semibold mb-4" style={{ color: "hsl(var(--foreground))" }}>
          Sessions over time
        </div>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.chart} barSize={20}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "hsl(220 15% 50%)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(220 15% 50%)" }}
                axisLine={false}
                tickLine={false}
                width={24}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(223 20% 26%)",
                  border: "1px solid hsl(223 18% 34%)",
                  borderRadius: 10,
                  color: "hsl(220 25% 90%)",
                  fontSize: 12,
                }}
                cursor={{ fill: "rgba(255,255,255,0.04)" }}
              />
              <Bar
                dataKey="sessions"
                fill="hsl(16 88% 65%)"
                radius={[6, 6, 0, 0]}
                opacity={0.9}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Session type breakdown */}
      <div
        className="rounded-2xl p-5 space-y-4"
        style={{ background: "hsl(var(--card))", boxShadow: "var(--neu-raised)" }}
      >
        <div className="text-sm font-semibold" style={{ color: "hsl(var(--foreground))" }}>
          Session Breakdown
        </div>
        {[
          { label: "Focus", pct: 75, color: "hsl(16 88% 65%)" },
          { label: "Short Break", pct: 20, color: "hsl(142 71% 55%)" },
          { label: "Long Break", pct: 5, color: "hsl(220 80% 68%)" },
        ].map(({ label, pct, color }) => (
          <div key={label} className="space-y-1">
            <div className="flex justify-between text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
              <span>{label}</span>
              <span className="font-mono">{pct}%</span>
            </div>
            <div
              className="h-2 w-full rounded-full"
              style={{ background: "hsl(var(--muted))", boxShadow: "var(--neu-pressed)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
