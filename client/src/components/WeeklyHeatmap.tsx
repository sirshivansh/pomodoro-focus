import { useMemo } from "react";
interface WeeklyHeatmapProps {
  history: any[];
}

function getLastNDays(n: number): string[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i));
    return d.toISOString().slice(0, 10);
  });
}

function dayLabel(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, { weekday: "short" }).slice(0, 1);
}

function weekLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const DAYS_TOTAL = 7 * 7; // 7 weeks × 7 days

export default function WeeklyHeatmap({ history }: WeeklyHeatmapProps) {
  const days = useMemo(() => getLastNDays(DAYS_TOTAL), []);

  const countByDate = useMemo(() => {
    const map: Record<string, number> = {};
    for (const r of history) {
      if (r.type === "work") {
        const dateStr = new Date(r.startTime).toISOString().slice(0, 10);
        map[dateStr] = (map[dateStr] || 0) + 1;
      }
    }
    return map;
  }, [history]);

  const maxCount = useMemo(() => Math.max(1, ...Object.values(countByDate)), [countByDate]);

  // Group into weeks (columns of 7)
  const weeks: string[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  // Week labels (first day of each week)
  const weekLabels = weeks.map(w => weekLabel(w[0]));

  // Day-of-week labels
  const dowLabels = ["M", "T", "W", "T", "F", "S", "S"];

  function cellColor(count: number): string {
    if (count === 0) return "rgba(255,255,255,0.05)";
    const intensity = Math.min(count / maxCount, 1);
    if (intensity < 0.25) return "rgba(255,255,255,0.15)";
    if (intensity < 0.5)  return "rgba(255,255,255,0.35)";
    if (intensity < 0.75) return "rgba(255,255,255,0.58)";
    return "rgba(255,255,255,0.88)";
  }

  function cellBorder(count: number): string {
    return count > 0 ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.06)";
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-3">
      {/* Week labels */}
      <div className="flex gap-1.5 pl-5">
        {weekLabels.map((label, i) => (
          <div key={i} className="flex-1 text-center" style={{
            fontSize: "8px", fontFamily: "'Rajdhani',sans-serif", fontWeight: 600,
            color: "rgba(255,255,255,0.3)", letterSpacing: "0.04em",
          }}>
            {i % 2 === 0 ? label : ""}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="flex gap-1.5">
        {/* Day labels */}
        <div className="flex flex-col gap-1.5 justify-between" style={{ paddingTop: 2 }}>
          {dowLabels.map((d, i) => (
            <div key={i} style={{ fontSize: "8px", fontFamily: "'Rajdhani',sans-serif", fontWeight: 600, color: "rgba(255,255,255,0.3)", width: 10, textAlign: "right" }}>
              {i % 2 === 0 ? d : ""}
            </div>
          ))}
        </div>

        {/* Columns */}
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1.5 flex-1">
            {week.map((date, di) => {
              const count = countByDate[date] || 0;
              const isToday = date === today;
              return (
                <div
                  key={di}
                  title={`${date}: ${count} session${count !== 1 ? "s" : ""}`}
                  style={{
                    height: 10, borderRadius: 2,
                    background: cellColor(count),
                    border: isToday ? "1px solid rgba(255,255,255,0.5)" : `1px solid ${cellBorder(count)}`,
                    transition: "background 0.3s",
                    boxShadow: isToday ? "0 0 4px rgba(255,255,255,0.3)" : "none",
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1.5">
        <span style={{ fontSize: "8px", fontFamily: "'Rajdhani',sans-serif", color: "rgba(255,255,255,0.3)" }}>Less</span>
        {[0, 0.25, 0.5, 0.75, 1].map((v, i) => (
          <div key={i} style={{ width: 9, height: 9, borderRadius: 2, background: cellColor(Math.round(v * maxCount)), border: `1px solid ${cellBorder(Math.round(v * maxCount))}` }} />
        ))}
        <span style={{ fontSize: "8px", fontFamily: "'Rajdhani',sans-serif", color: "rgba(255,255,255,0.3)" }}>More</span>
      </div>
    </div>
  );
}
