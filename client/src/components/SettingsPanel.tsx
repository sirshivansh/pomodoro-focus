import { useState } from "react";
import { X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { TimerConfig } from "@shared/schema";

interface SettingsPanelProps {
  config: TimerConfig;
  onSave: (config: TimerConfig) => void;
  onClose: () => void;
}

interface NeuInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  testId: string;
}

function GlassInput({ label, value, min, max, onChange, testId }: NeuInputProps) {
  return (
    <div className="space-y-2">
      <div className="text-xs tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.3)" }}>
        {label}
      </div>
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-7 h-7 rounded-full flex items-center justify-center text-base transition-all"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.6)",
          }}
        >
          −
        </button>
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Math.min(max, Math.max(min, parseInt(e.target.value) || min)))}
          data-testid={testId}
          className="flex-1 text-center bg-transparent font-mono text-lg font-light outline-none"
          style={{ color: "rgba(255,255,255,0.9)" }}
        />
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-7 h-7 rounded-full flex items-center justify-center text-base transition-all"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.6)",
          }}
        >
          +
        </button>
      </div>
    </div>
  );
}

export default function SettingsPanel({ config, onSave, onClose }: SettingsPanelProps) {
  const [s, setS] = useState<TimerConfig>(config);
  const update = (k: keyof TimerConfig, v: any) => setS(p => ({ ...p, [k]: v }));

  return (
    <div
      className="w-full max-w-sm rounded-2xl p-6 space-y-6"
      style={{
        background: "rgba(8,8,16,0.88)",
        border: "1px solid rgba(255,255,255,0.1)",
        backdropFilter: "blur(40px)",
        WebkitBackdropFilter: "blur(40px)",
        boxShadow: "0 24px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)",
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-medium" style={{ color: "rgba(255,255,255,0.9)" }}>Settings</h2>
          <p className="text-xs tracking-widest uppercase mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>Timer Configuration</p>
        </div>
        <button
          onClick={onClose}
          data-testid="button-close-settings"
          className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <X className="w-4 h-4" style={{ color: "rgba(255,255,255,0.5)" }} />
        </button>
      </div>

      <div className="space-y-4">
        <GlassInput label="Focus (min)" value={Math.floor(s.workDuration / 60)} min={1} max={60} onChange={(v) => update("workDuration", v * 60)} testId="input-work-duration" />
        <GlassInput label="Short Break (min)" value={Math.floor(s.shortBreakDuration / 60)} min={1} max={30} onChange={(v) => update("shortBreakDuration", v * 60)} testId="input-short-break-duration" />
        <GlassInput label="Long Break (min)" value={Math.floor(s.longBreakDuration / 60)} min={5} max={60} onChange={(v) => update("longBreakDuration", v * 60)} testId="input-long-break-duration" />
        <GlassInput label="Cycles until Long Break" value={s.sessionsUntilLongBreak} min={2} max={10} onChange={(v) => update("sessionsUntilLongBreak", v)} testId="input-sessions-until-long-break" />
      </div>

      <div className="flex items-center justify-between py-1">
        <span className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>Sound</span>
        <Switch checked={s.soundEnabled} onCheckedChange={(v) => update("soundEnabled", v)} data-testid="switch-sound-enabled" />
      </div>

      <div className="flex gap-3">
        <button
          onClick={onClose}
          data-testid="button-cancel-settings"
          className="flex-1 py-3 rounded-xl text-sm font-medium transition-all"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.5)",
          }}
        >
          Cancel
        </button>
        <button
          onClick={() => { onSave(s); onClose(); }}
          data-testid="button-save-settings"
          className="flex-1 py-3 rounded-xl text-sm font-medium transition-all"
          style={{
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "rgba(255,255,255,0.92)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15)",
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
}
