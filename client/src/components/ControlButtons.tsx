import { Play, Pause, Square, RotateCcw } from "lucide-react";
import { TimerState } from "@shared/schema";
import { cn } from "@/lib/utils";

interface ControlButtonsProps {
  state: TimerState;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  onReset: () => void;
  onSettings: () => void;
  className?: string;
}

const GlassBtn = ({
  onClick,
  children,
  large = false,
  bright = false,
  disabled = false,
  "data-testid": testId,
}: {
  onClick: () => void;
  children: React.ReactNode;
  large?: boolean;
  bright?: boolean;
  disabled?: boolean;
  "data-testid"?: string;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    data-testid={testId}
    className={cn(
      "rounded-full flex items-center justify-center transition-all duration-200",
      "active:scale-95",
      disabled && "opacity-30 cursor-not-allowed",
      large ? "w-16 h-16" : "w-12 h-12"
    )}
    style={{
      background: bright
        ? "rgba(255,255,255,0.12)"
        : "rgba(255,255,255,0.05)",
      border: `1px solid ${bright ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.1)"}`,
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      boxShadow: bright
        ? "0 0 20px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.2)"
        : "inset 0 1px 0 rgba(255,255,255,0.08)",
    }}
  >
    {children}
  </button>
);

export default function ControlButtons({
  state, onStart, onPause, onStop, onReset, onSettings, className,
}: ControlButtonsProps) {
  return (
    <div className={cn("flex items-center justify-center gap-5", className)}>
      {/* Stop */}
      <GlassBtn onClick={onStop} disabled={state === "idle"} data-testid="button-stop">
        <Square
          className="w-4 h-4 fill-current"
          style={{ color: "rgba(255,255,255,0.55)" }}
        />
      </GlassBtn>

      {/* Play / Pause — main action */}
      <GlassBtn
        onClick={state === "running" ? onPause : onStart}
        large
        bright
        data-testid={state === "running" ? "button-pause" : "button-start"}
      >
        {state === "running" ? (
          <Pause className="w-6 h-6" style={{ color: "rgba(255,255,255,0.95)" }} />
        ) : (
          <Play className="w-6 h-6 translate-x-0.5" style={{ color: "rgba(255,255,255,0.95)" }} />
        )}
      </GlassBtn>

      {/* Reset */}
      <GlassBtn onClick={onReset} data-testid="button-reset">
        <RotateCcw className="w-4 h-4" style={{ color: "rgba(255,255,255,0.55)" }} />
      </GlassBtn>
    </div>
  );
}
