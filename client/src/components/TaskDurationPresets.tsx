import React, { useState } from "react";
import { Tag, Clock, Plus, Minus, Edit3, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PresetTask {
  tag: string;
  label: string;
  defaultDurationMinutes: number;
}

export const PRESET_TAGS: PresetTask[] = [
  { tag: "#coding", label: "Coding", defaultDurationMinutes: 45 },
  { tag: "#reading", label: "Reading", defaultDurationMinutes: 25 },
  { tag: "#writing", label: "Writing", defaultDurationMinutes: 30 },
  { tag: "#design", label: "Design", defaultDurationMinutes: 45 },
  { tag: "#deep-work", label: "Deep Work", defaultDurationMinutes: 60 },
  { tag: "#sprint", label: "Quick Sprint", defaultDurationMinutes: 15 },
];

export const DURATION_PRESETS = [
  { mins: 15, label: "15m" },
  { mins: 25, label: "25m" },
  { mins: 45, label: "45m" },
  { mins: 60, label: "60m" },
  { mins: 90, label: "90m" },
];

interface TaskDurationPresetsProps {
  activeTag: string;
  onSelectTag: (tag: string) => void;
  workDurationMinutes: number;
  onSelectDuration: (mins: number) => void;
  isTimerRunning: boolean;
}

export default function TaskDurationPresets({
  activeTag,
  onSelectTag,
  workDurationMinutes,
  onSelectDuration,
  isTimerRunning,
}: TaskDurationPresetsProps) {
  const [isEditingCustomTag, setIsEditingCustomTag] = useState(false);
  const [customTagInput, setCustomTagInput] = useState("");

  const handleCustomTagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTagInput.trim()) {
      let formatted = customTagInput.trim();
      if (!formatted.startsWith("#") && !formatted.includes(" ")) {
        formatted = `#${formatted}`;
      }
      onSelectTag(formatted);
      setIsEditingCustomTag(false);
      setCustomTagInput("");
    }
  };

  const handleTagClick = (preset: PresetTask) => {
    onSelectTag(preset.tag);
    if (!isTimerRunning) {
      onSelectDuration(preset.defaultDurationMinutes);
    }
  };

  return (
    <div
      className="w-full max-w-xl mx-auto rounded-2xl p-3.5 sm:p-4 space-y-3 transition-all"
      style={{
        background: "rgba(15, 16, 25, 0.72)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: "0 12px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
      }}
    >
      {/* TASK & PROJECT LABEL ROW */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em]"
            style={{ fontFamily: "'Rajdhani', sans-serif", color: "rgba(255, 255, 255, 0.55)" }}>
            <Tag className="w-3.5 h-3.5 text-amber-400/80" />
            <span>Task & Project Tag</span>
          </div>

          {isEditingCustomTag ? (
            <button
              onClick={() => setIsEditingCustomTag(false)}
              className="text-[11px] text-white/40 hover:text-white/80 transition-colors"
            >
              Cancel
            </button>
          ) : (
            <button
              onClick={() => setIsEditingCustomTag(true)}
              className="flex items-center gap-1 text-[11px] font-medium text-amber-400/90 hover:text-amber-300 transition-colors"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <Edit3 className="w-3 h-3" /> Custom Tag
            </button>
          )}
        </div>

        {isEditingCustomTag ? (
          <form onSubmit={handleCustomTagSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={customTagInput}
              onChange={(e) => setCustomTagInput(e.target.value)}
              placeholder="e.g. #refactor-ui or Client Project"
              autoFocus
              className="flex-1 px-3 py-1.5 rounded-xl text-xs bg-white/5 border border-white/15 text-white placeholder:text-white/30 outline-none focus:border-amber-400/60 transition-colors"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-medium hover:bg-amber-500/30 transition-all flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" /> Save
            </button>
          </form>
        ) : (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {PRESET_TAGS.map((preset) => {
              const isSelected = activeTag === preset.tag;
              return (
                <button
                  key={preset.tag}
                  onClick={() => handleTagClick(preset)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 active:scale-95",
                    isSelected
                      ? "bg-amber-500/20 border border-amber-500/50 text-amber-300 shadow-[0_0_12px_rgba(245,166,35,0.25)]"
                      : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white/90"
                  )}
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  <span className="opacity-60">{preset.tag}</span>
                </button>
              );
            })}
            {!PRESET_TAGS.some((p) => p.tag === activeTag) && activeTag && (
              <div
                className="px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap bg-amber-500/20 border border-amber-500/50 text-amber-300 shadow-[0_0_12px_rgba(245,166,35,0.25)] flex items-center gap-1"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                <span>{activeTag}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* DURATION PRESET & ADJUSTMENT ROW */}
      <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] mr-1"
            style={{ fontFamily: "'Rajdhani', sans-serif", color: "rgba(255, 255, 255, 0.55)" }}>
            <Clock className="w-3.5 h-3.5 text-blue-400/80" />
            <span>Duration:</span>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {DURATION_PRESETS.map((preset) => {
              const isSelected = workDurationMinutes === preset.mins;
              return (
                <button
                  key={preset.mins}
                  disabled={isTimerRunning}
                  onClick={() => onSelectDuration(preset.mins)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all duration-200",
                    isSelected
                      ? "bg-blue-500/25 border border-blue-400/50 text-blue-300 shadow-[0_0_10px_rgba(96,165,250,0.3)]"
                      : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white/90",
                    isTimerRunning && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* FINE ADJUSTMENT BUTTONS (+5m / -5m) */}
        <div className="flex items-center gap-1.5">
          <button
            disabled={isTimerRunning || workDurationMinutes <= 5}
            onClick={() => onSelectDuration(Math.max(5, workDurationMinutes - 5))}
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-90"
            title="Decrease 5 mins"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-mono font-bold text-white/90 min-w-[32px] text-center">
            {workDurationMinutes}m
          </span>
          <button
            disabled={isTimerRunning || workDurationMinutes >= 180}
            onClick={() => onSelectDuration(Math.min(180, workDurationMinutes + 5))}
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-90"
            title="Increase 5 mins"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
