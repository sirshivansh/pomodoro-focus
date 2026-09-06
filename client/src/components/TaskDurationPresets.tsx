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
      className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto px-3 py-1.5 rounded-full transition-all"
      style={{
        background: "rgba(15, 16, 25, 0.8)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
      }}
    >
      {/* TAG SELECTOR STRIP */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-[280px] sm:max-w-none">
        <Tag className="w-3.5 h-3.5 text-amber-400/80 ml-1 flex-shrink-0" />
        
        {isEditingCustomTag ? (
          <form onSubmit={handleCustomTagSubmit} className="flex items-center gap-1">
            <input
              type="text"
              value={customTagInput}
              onChange={(e) => setCustomTagInput(e.target.value)}
              placeholder="#tag"
              autoFocus
              className="w-24 px-2 py-0.5 rounded-lg text-xs bg-white/10 border border-white/20 text-white placeholder:text-white/30 outline-none focus:border-amber-400/60"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            />
            <button
              type="submit"
              className="p-1 rounded-lg bg-amber-500/20 text-amber-300 text-xs hover:bg-amber-500/30"
            >
              <Check className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => setIsEditingCustomTag(false)}
              className="text-[10px] text-white/40 hover:text-white/80 px-1"
            >
              ✕
            </button>
          </form>
        ) : (
          <div className="flex items-center gap-1">
            {PRESET_TAGS.map((preset) => {
              const isSelected = activeTag === preset.tag;
              return (
                <button
                  key={preset.tag}
                  onClick={() => handleTagClick(preset)}
                  className={cn(
                    "px-2.5 py-0.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all duration-200 active:scale-95",
                    isSelected
                      ? "bg-amber-500/20 border border-amber-500/50 text-amber-300 shadow-[0_0_10px_rgba(245,166,35,0.25)]"
                      : "bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 hover:text-white/90"
                  )}
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {preset.tag}
                </button>
              );
            })}
            {!PRESET_TAGS.some((p) => p.tag === activeTag) && activeTag && (
              <span
                className="px-2.5 py-0.5 rounded-lg text-[11px] font-medium bg-amber-500/20 border border-amber-500/50 text-amber-300 shadow-[0_0_10px_rgba(245,166,35,0.25)]"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {activeTag}
              </span>
            )}
            <button
              onClick={() => setIsEditingCustomTag(true)}
              className="p-1 rounded-lg text-white/40 hover:text-amber-400 transition-colors ml-0.5"
              title="Custom tag"
            >
              <Edit3 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* DIVIDER */}
      <div className="w-[1px] h-4 bg-white/15 hidden sm:block" />

      {/* DURATION STRIP */}
      <div className="flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5 text-blue-400/80 flex-shrink-0" />
        
        <div className="flex items-center gap-1">
          {DURATION_PRESETS.map((preset) => {
            const isSelected = workDurationMinutes === preset.mins;
            return (
              <button
                key={preset.mins}
                disabled={isTimerRunning}
                onClick={() => onSelectDuration(preset.mins)}
                className={cn(
                  "px-2 py-0.5 rounded-md text-[11px] font-mono font-medium transition-all duration-200",
                  isSelected
                    ? "bg-blue-500/25 border border-blue-400/50 text-blue-300 shadow-[0_0_8px_rgba(96,165,250,0.3)]"
                    : "bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 hover:text-white/90",
                  isTimerRunning && "opacity-50 cursor-not-allowed"
                )}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* STEPPER (- / +) */}
        <div className="flex items-center gap-1 ml-0.5">
          <button
            disabled={isTimerRunning || workDurationMinutes <= 5}
            onClick={() => onSelectDuration(Math.max(5, workDurationMinutes - 5))}
            className="p-1 rounded-md bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed active:scale-90"
            title="Decrease 5 mins"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="text-[11px] font-mono font-bold text-white/90 min-w-[28px] text-center">
            {workDurationMinutes}m
          </span>
          <button
            disabled={isTimerRunning || workDurationMinutes >= 180}
            onClick={() => onSelectDuration(Math.min(180, workDurationMinutes + 5))}
            className="p-1 rounded-md bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed active:scale-90"
            title="Increase 5 mins"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
