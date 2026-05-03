import { Play, Pause, Square, RotateCcw, Settings } from "lucide-react";
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

const NeuButton = ({
  onClick,
  children,
  className,
  size = "md",
  pressed = false,
  "data-testid": testId,
  disabled = false,
}: {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
  pressed?: boolean;
  "data-testid"?: string;
  disabled?: boolean;
}) => {
  const dims = size === "lg" ? "w-20 h-20" : size === "md" ? "w-14 h-14" : "w-10 h-10";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
      className={cn(
        "rounded-full flex items-center justify-center transition-all duration-150 active:scale-95",
        dims,
        disabled && "opacity-40 cursor-not-allowed",
        className
      )}
      style={{
        background: "hsl(var(--card))",
        boxShadow: pressed ? "var(--neu-pressed)" : "var(--neu-raised)",
        border: "none",
        outline: "none",
      }}
      onMouseDown={(e) => {
        if (!disabled) (e.currentTarget as HTMLButtonElement).style.boxShadow = "var(--neu-pressed)";
      }}
      onMouseUp={(e) => {
        if (!disabled) (e.currentTarget as HTMLButtonElement).style.boxShadow = "var(--neu-raised)";
      }}
      onMouseLeave={(e) => {
        if (!disabled) (e.currentTarget as HTMLButtonElement).style.boxShadow = "var(--neu-raised)";
      }}
    >
      {children}
    </button>
  );
};

export default function ControlButtons({
  state,
  onStart,
  onPause,
  onStop,
  onReset,
  onSettings,
  className,
}: ControlButtonsProps) {
  return (
    <div className={cn("flex items-center justify-center gap-6", className)}>
      {/* Settings */}
      <NeuButton
        size="md"
        onClick={onSettings}
        data-testid="button-settings"
      >
        <Settings className="w-5 h-5" style={{ color: "hsl(var(--muted-foreground))" }} />
      </NeuButton>

      {/* Play / Pause — coral, larger */}
      <button
        onClick={state === "running" ? onPause : onStart}
        data-testid={state === "running" ? "button-pause" : "button-start"}
        className="w-20 h-20 rounded-full flex items-center justify-center transition-all duration-150 active:scale-95"
        style={{
          background: "linear-gradient(145deg, hsl(16 88% 70%), hsl(16 88% 58%))",
          boxShadow: "6px 6px 16px rgba(244,120,90,0.45), -2px -2px 8px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.2)",
          border: "none",
          outline: "none",
        }}
      >
        {state === "running" ? (
          <Pause className="w-7 h-7 text-white" />
        ) : (
          <Play className="w-7 h-7 text-white translate-x-0.5" />
        )}
      </button>

      {/* Stop */}
      <NeuButton
        size="md"
        onClick={onStop}
        disabled={state === "idle"}
        data-testid="button-stop"
      >
        <Square className="w-5 h-5 fill-current" style={{ color: "hsl(var(--muted-foreground))" }} />
      </NeuButton>

      {/* Reset */}
      <NeuButton
        size="md"
        onClick={onReset}
        data-testid="button-reset"
      >
        <RotateCcw className="w-5 h-5" style={{ color: "hsl(var(--muted-foreground))" }} />
      </NeuButton>
    </div>
  );
}
