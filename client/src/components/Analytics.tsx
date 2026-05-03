import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "@/lib/utils";

interface AnalyticsProps { className?: string; }
type Period = "daily" | "weekly" | "monthly" | "yearly";

const MOCK: Record<Period, { chart: { name: string; sessions: number }[]; total: number; time: number }> = {
  daily:   { chart: [{ name: "9am", sessions: 4 },{ name: "11am", sessions: 2 },{ name: "1pm", sessions: 0 },{ name: "3pm", sessions: 6 },{ name: "5pm", sessions: 3 },{ name: "7pm", sessions: 1 }], total: 16, time: 400 },
  weekly:  { chart: [{ name: "Mon", sessions: 12 },{ name: "Tue", sessions: 8 },{ name: "Wed", sessions: 16 },{ name: "Thu", sessions: 14 },{ name: "Fri", sessions: 10 },{ name: "Sat", sessions: 6 },{ name: "Sun", sessions: 4 }], total: 70, time: 1750 },
  monthly: { chart: [{ name: "Wk 1", sessions: 45 },{ name: "Wk 2", sessions: 52 },{ name: "Wk 3", sessions: 38 },{ name: "Wk 4", sessions: 41 }], total: 176, time: 4400 },
  yearly:  { chart: [{ name: "Jan", sessions: 120 },{ name: "Feb", sessions: 110 },{ name: "Mar", sessions: 140 },{ name: "Apr", sessions: 130 },{ name: "May", sessions: 150 },{ name: "Jun", sessions: 135 }], total: 785, time: 19625 },
};

const fmtTime = (m: number) => { const h = Math.floor(m / 60); return h > 0 ? `${h}h ${m % 60}m` : `${m}m`; };

const GlassPanel = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("rounded-2xl p-5", className)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
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
              <YAxis tick={{ fontSize: 11, fill: "rgba(255,255,255,0.45)", fontFamily: "'Rajdhani',sans-serif" }} axisLine={false} tickLine={false} width={22} />
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
        {[
          { label: "Focus",       pct: 75, color: "rgba(255,255,255,0.8)" },
          { label: "Short Break", pct: 20, color: "rgba(100,210,170,0.8)" },
          { label: "Long Break",  pct: 5,  color: "rgba(140,175,255,0.8)" },
        ].map(({ label, pct, color }) => (
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
