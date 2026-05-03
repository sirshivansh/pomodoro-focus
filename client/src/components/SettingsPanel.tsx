import { useState } from "react";
import { X, Bell, SkipForward, Volume2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { TimerConfig } from "@shared/schema";

interface SettingsPanelProps {
  config: TimerConfig;
  onSave: (config: TimerConfig) => void;
  onClose: () => void;
}

function GlassInput({ label, value, min, max, onChange, testId }: {
  label: string; value: number; min: number; max: number;
  onChange: (v: number) => void; testId: string;
}) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold tracking-[0.18em] uppercase"
        style={{ fontFamily: "'Rajdhani',sans-serif", color: "rgba(255,255,255,0.55)" }}>
        {label}
      </div>
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
        <button onClick={() => onChange(Math.max(min, value - 1))}
          className="w-7 h-7 rounded-full flex items-center justify-center text-base transition-all active:scale-90"
          style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.75)" }}>
          −
        </button>
        <input type="number" min={min} max={max} value={value}
          onChange={(e) => onChange(Math.min(max, Math.max(min, parseInt(e.target.value) || min)))}
          data-testid={testId}
          className="flex-1 text-center bg-transparent font-mono text-lg font-light outline-none"
          style={{ color: "rgba(255,255,255,0.95)" }} />
        <button onClick={() => onChange(Math.min(max, value + 1))}
          className="w-7 h-7 rounded-full flex items-center justify-center text-base transition-all active:scale-90"
          style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.75)" }}>
          +
        </button>
      </div>
    </div>
  );
}

function ToggleRow({ icon, label, sub, checked, onChange, testId }: {
  icon: React.ReactNode; label: string; sub?: string;
  checked: boolean; onChange: (v: boolean) => void; testId: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.55)" }}>
          {icon}
        </div>
        <div>
          <div className="text-sm font-medium" style={{ fontFamily: "'Space Grotesk',sans-serif", color: "rgba(255,255,255,0.88)" }}>
            {label}
          </div>
          {sub && (
            <div className="text-xs mt-0.5" style={{ fontFamily: "'Space Grotesk',sans-serif", color: "rgba(255,255,255,0.42)" }}>
              {sub}
            </div>
          )}
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} data-testid={testId} />
    </div>
  );
}

export default function SettingsPanel({ config, onSave, onClose }: SettingsPanelProps) {
  const [s, setS] = useState<TimerConfig>(config);
  const update = (k: keyof TimerConfig, v: any) => setS(p => ({ ...p, [k]: v }));

  return (
    <div
      className="w-full max-w-sm rounded-2xl overflow-hidden flex flex-col"
      style={{
        maxHeight: "90vh",
        background: "rgba(8,8,18,0.96)",
        border: "1px solid rgba(255,255,255,0.12)",
        backdropFilter: "blur(40px)",
        WebkitBackdropFilter: "blur(40px)",
        boxShadow: "0 32px 80px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.08)",
      }}
    >
      {/* Scrollable body — scrollbar hidden */}
      <div className="no-scrollbar overflow-y-auto flex-1 p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold tracking-[0.06em]"
              style={{ fontFamily: "'Space Grotesk',sans-serif", color: "rgba(255,255,255,0.95)" }}>
              Settings
            </h2>
            <p className="text-xs font-semibold tracking-[0.2em] uppercase mt-0.5"
              style={{ fontFamily: "'Rajdhani',sans-serif", color: "rgba(255,255,255,0.4)" }}>
              Timer Configuration
            </p>
          </div>
          <button onClick={onClose} data-testid="button-close-settings"
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <X className="w-4 h-4" style={{ color: "rgba(255,255,255,0.6)" }} />
          </button>
        </div>

        {/* Duration inputs */}
        <div className="space-y-3">
          <GlassInput label="Focus (min)" value={Math.floor(s.workDuration / 60)} min={1} max={60}
            onChange={(v) => update("workDuration", v * 60)} testId="input-work-duration" />
          <GlassInput label="Short Break (min)" value={Math.floor(s.shortBreakDuration / 60)} min={1} max={30}
            onChange={(v) => update("shortBreakDuration", v * 60)} testId="input-short-break-duration" />
          <GlassInput label="Long Break (min)" value={Math.floor(s.longBreakDuration / 60)} min={5} max={60}
            onChange={(v) => update("longBreakDuration", v * 60)} testId="input-long-break-duration" />
          <GlassInput label="Cycles until Long Break" value={s.sessionsUntilLongBreak} min={2} max={10}
            onChange={(v) => update("sessionsUntilLongBreak", v)} testId="input-sessions-until-long-break" />
        </div>

        {/* Divider */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }} />

        {/* Toggles */}
        <div className="space-y-1">
          <ToggleRow
            icon={<Volume2 className="w-3.5 h-3.5" />}
            label="Sound" sub="Beep when sessions end"
            checked={s.soundEnabled} onChange={(v) => update("soundEnabled", v)}
            testId="switch-sound-enabled"
          />
          <ToggleRow
            icon={<SkipForward className="w-3.5 h-3.5" />}
            label="Auto-start" sub="Automatically begin next session"
            checked={s.autoStart} onChange={(v) => update("autoStart", v)}
            testId="switch-auto-start"
          />
          <ToggleRow
            icon={<Bell className="w-3.5 h-3.5" />}
            label="Notifications" sub="Browser alert when session ends"
            checked={s.notificationsEnabled} onChange={(v) => update("notificationsEnabled", v)}
            testId="switch-notifications"
          />
        </div>

        {/* Keyboard shortcuts */}
        <div className="rounded-xl px-4 py-3 space-y-2"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="text-xs font-semibold tracking-[0.18em] uppercase mb-3"
            style={{ fontFamily: "'Rajdhani',sans-serif", color: "rgba(255,255,255,0.45)" }}>
            Keyboard Shortcuts
          </div>
          {[
            { key: "Space", label: "Play / Pause" },
            { key: "R",     label: "Reset timer" },
            { key: "N",     label: "Skip to next session" },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <span style={{ fontSize: "12px", fontFamily: "'Space Grotesk',sans-serif", color: "rgba(255,255,255,0.5)" }}>
                {label}
              </span>
              <kbd className="px-2 py-0.5 rounded text-xs"
                style={{ fontFamily: "'JetBrains Mono',monospace", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)", color: "rgba(255,255,255,0.7)" }}>
                {key}
              </kbd>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky footer */}
      <div className="flex gap-3 px-6 py-4 flex-shrink-0"
        style={{ borderTop: "1px solid rgba(255,255,255,0.08)", background: "rgba(8,8,18,0.98)" }}>
        <button onClick={onClose} data-testid="button-cancel-settings"
          className="flex-1 py-3 rounded-xl text-sm font-medium transition-all"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.55)" }}>
          Cancel
        </button>
        <button onClick={() => { onSave(s); onClose(); }} data-testid="button-save-settings"
          className="flex-1 py-3 rounded-xl text-sm font-medium transition-all"
          style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.22)", color: "rgba(255,255,255,0.95)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)" }}>
          Save
        </button>
      </div>
    </div>
  );
}
