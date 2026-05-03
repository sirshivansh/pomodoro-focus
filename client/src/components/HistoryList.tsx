import { Clock, Target, Trash2 } from "lucide-react";

export interface SessionRecord {
  id: string;
  date: string;       // YYYY-MM-DD
  startTime: string;  // HH:MM
  durationMins: number;
  focusGoal: string;
  sessionType: "work" | "short-break" | "long-break";
}

export const HISTORY_KEY = "ft_history";
const MAX_HISTORY = 150;

export function saveSessionToHistory(record: Omit<SessionRecord, "id">) {
  try {
    const existing: SessionRecord[] = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    const updated = [{ ...record, id: `${Date.now()}` }, ...existing].slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {}
}

export function loadHistory(): SessionRecord[] {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; }
}

export function clearHistory() { localStorage.removeItem(HISTORY_KEY); }

function formatDate(dateStr: string): string {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (dateStr === today) return "Today";
  if (dateStr === yesterday) return "Yesterday";
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function groupByDate(records: SessionRecord[]): { date: string; items: SessionRecord[] }[] {
  const map = new Map<string, SessionRecord[]>();
  for (const r of records) {
    if (!map.has(r.date)) map.set(r.date, []);
    map.get(r.date)!.push(r);
  }
  return Array.from(map.entries()).map(([date, items]) => ({ date, items }));
}

const SESSION_COLOR: Record<string, string> = {
  "work":         "rgba(255,255,255,0.75)",
  "short-break":  "rgba(100,210,170,0.75)",
  "long-break":   "rgba(140,175,255,0.75)",
};

interface HistoryListProps {
  records: SessionRecord[];
  onClear: () => void;
}

export default function HistoryList({ records, onClear }: HistoryListProps) {
  if (records.length === 0) {
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

  const groups = groupByDate(records);

  return (
    <div className="space-y-5">
      {/* Clear button */}
      <div className="flex justify-end">
        <button
          onClick={onClear}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all"
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

          {items.filter(r => r.sessionType === "work").map((record) => (
            <div
              key={record.id}
              className="flex items-start gap-3 px-4 py-3 rounded-xl"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              {/* Color dot */}
              <div className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: SESSION_COLOR[record.sessionType] }} />

              <div className="flex-1 min-w-0">
                {/* Goal */}
                {record.focusGoal ? (
                  <p className="text-sm font-medium leading-snug" style={{ fontFamily: "'Space Grotesk',sans-serif", color: "rgba(255,255,255,0.88)" }}>
                    {record.focusGoal}
                  </p>
                ) : (
                  <p className="text-sm italic" style={{ fontFamily: "'Space Grotesk',sans-serif", color: "rgba(255,255,255,0.4)" }}>
                    No focus goal set
                  </p>
                )}
                {/* Meta */}
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="flex items-center gap-1 text-xs" style={{ fontFamily: "'JetBrains Mono',monospace", color: "rgba(255,255,255,0.45)" }}>
                    <Clock className="w-3 h-3" /> {record.startTime}
                  </span>
                  <span className="text-xs" style={{ fontFamily: "'JetBrains Mono',monospace", color: "rgba(255,255,255,0.45)" }}>
                    {record.durationMins}m
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
