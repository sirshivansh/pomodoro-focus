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

function NeuInput({ label, value, min, max, onChange, testId }: NeuInputProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>
        {label}
      </label>
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl"
        style={{ background: "hsl(var(--card))", boxShadow: "var(--neu-pressed)" }}
      >
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-7 h-7 rounded-full flex items-center justify-center text-lg font-bold transition-all"
          style={{ background: "hsl(var(--background))", boxShadow: "var(--neu-raised)", color: "hsl(var(--muted-foreground))" }}
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
          className="flex-1 text-center bg-transparent font-mono text-lg font-bold outline-none"
          style={{ color: "hsl(var(--foreground))" }}
        />
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-7 h-7 rounded-full flex items-center justify-center text-lg font-bold transition-all"
          style={{ background: "hsl(var(--background))", boxShadow: "var(--neu-raised)", color: "hsl(var(--muted-foreground))" }}
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
      style={{ background: "hsl(var(--background))", boxShadow: "var(--neu-raised-lg)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold" style={{ color: "hsl(var(--foreground))" }}>Timer Settings</h2>
        <button
          onClick={onClose}
          data-testid="button-close-settings"
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: "hsl(var(--card))", boxShadow: "var(--neu-raised)" }}
        >
          <X className="w-4 h-4" style={{ color: "hsl(var(--muted-foreground))" }} />
        </button>
      </div>

      {/* Inputs */}
      <div className="space-y-4">
        <NeuInput
          label="Focus Duration (min)"
          value={Math.floor(s.workDuration / 60)}
          min={1} max={60}
          onChange={(v) => update("workDuration", v * 60)}
          testId="input-work-duration"
        />
        <NeuInput
          label="Short Break (min)"
          value={Math.floor(s.shortBreakDuration / 60)}
          min={1} max={30}
          onChange={(v) => update("shortBreakDuration", v * 60)}
          testId="input-short-break-duration"
        />
        <NeuInput
          label="Long Break (min)"
          value={Math.floor(s.longBreakDuration / 60)}
          min={5} max={60}
          onChange={(v) => update("longBreakDuration", v * 60)}
          testId="input-long-break-duration"
        />
        <NeuInput
          label="Sessions until Long Break"
          value={s.sessionsUntilLongBreak}
          min={2} max={10}
          onChange={(v) => update("sessionsUntilLongBreak", v)}
          testId="input-sessions-until-long-break"
        />
      </div>

      {/* Sound toggle */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium" style={{ color: "hsl(var(--foreground))" }}>Sound Notifications</span>
        <Switch
          checked={s.soundEnabled}
          onCheckedChange={(v) => update("soundEnabled", v)}
          data-testid="switch-sound-enabled"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onClose}
          data-testid="button-cancel-settings"
          className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: "hsl(var(--card))",
            boxShadow: "var(--neu-raised)",
            color: "hsl(var(--muted-foreground))",
          }}
        >
          Cancel
        </button>
        <button
          onClick={() => { onSave(s); onClose(); }}
          data-testid="button-save-settings"
          className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all text-white"
          style={{
            background: "linear-gradient(145deg, hsl(16 88% 70%), hsl(16 88% 58%))",
            boxShadow: "4px 4px 10px rgba(244,120,90,0.4), -1px -1px 6px rgba(255,255,255,0.06)",
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
}
