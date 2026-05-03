import { Clock, Target, Trash2 } from "lucide-react";
import { PomodoroSession } from "@shared/schema";

// Note: clearHistory and saveHistory removed as they use API now.

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const target = d.toISOString().slice(0, 10);

  if (target === today) return "Today";
  if (target === yesterday) return "Yesterday";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function groupByDate(records: PomodoroSession[]): { date: string; items: PomodoroSession[] }[] {
  const map = new Map<string, PomodoroSession[]>();
  for (const r of records) {
    const dStr = new Date(r.startTime).toISOString().slice(0, 10);
    if (!map.has(dStr)) map.set(dStr, []);
    map.get(dStr)!.push(r);
  }
  return Array.from(map.entries()).map(([date, items]) => ({ date, items }));
}

const SESSION_COLOR: Record<string, string> = {
  "work":         "rgba(255,255,255,0.75)",
  "short-break":  "rgba(100,210,170,0.75)",
  "long-break":   "rgba(140,175,255,0.75)",
};

interface HistoryListProps {
  records: PomodoroSession[];
  onClear: () => void;
}

export default function HistoryList({ records, onClear }: HistoryListProps) {
  if (!records || records.length === 0) {
    return (
      <div
        className="flex flex-col items-center gap-3 py-10 rounded-2xl text-center"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <Clock className="w-8 h-8" style={{ color: "rgba(255,255,255,0.2)" }} />
        <div>
          <p className="text-sm font-medium" style={{ fontFamily: "'Space Grotesk',sans-serif", color: "rgba(255,255,255,0.55)" }}>
            No sessions yet
          </p>
          <p className="text-xs mt-1" style={{ fontFamily: "'Space Grotesk',sans-serif", color: "rgba(255,255,255,0.3)" }}>
            Complete a focus session to see your history
          </p>
        </div>
      </div>
    );
  }

  // Only show work sessions for history usually, but let's show all
  const groups = groupByDate(records);

  return (
    <div className="space-y-5">
      {/* Clear button */}
      <div className="flex justify-end">
        <button
          onClick={onClear}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all hover:bg-white/10"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)", fontFamily: "'Rajdhani',sans-serif", fontWeight: 600, letterSpacing: "0.08em" }}
        >
          <Trash2 className="w-3 h-3" /> CLEAR ALL
        </button>
      </div>

      {groups.map(({ date, items }) => (
        <div key={date} className="space-y-2">
          {/* Date header */}
          <div
            className="text-xs font-semibold tracking-[0.18em] uppercase px-1"
            style={{ fontFamily: "'Rajdhani',sans-serif", color: "rgba(255,255,255,0.5)" }}
          >
            {formatDate(date)}
          </div>

          {items.filter(r => r.type === "work").map((record) => (
            <div
              key={record.id}
              className="flex items-start gap-3 px-4 py-3 rounded-xl"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              {/* Color dot */}
              <div className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: SESSION_COLOR[record.type] }} />

              <div className="flex-1 min-w-0">
                {/* Goal */}
                <p className="text-sm font-medium leading-snug" style={{ fontFamily: "'Space Grotesk',sans-serif", color: "rgba(255,255,255,0.88)" }}>
                  Focus Session
                </p>
                {/* Meta */}
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="flex items-center gap-1 text-xs" style={{ fontFamily: "'JetBrains Mono',monospace", color: "rgba(255,255,255,0.45)" }}>
                    <Clock className="w-3 h-3" /> {new Date(record.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-xs" style={{ fontFamily: "'JetBrains Mono',monospace", color: "rgba(255,255,255,0.45)" }}>
                    {Math.floor(record.duration / 60)}m
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
