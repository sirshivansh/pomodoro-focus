import { Play, Pause, SkipForward } from "lucide-react";
import { TimerState } from "@shared/schema";
import { cn } from "@/lib/utils";

interface ControlButtonsProps {
  state: TimerState;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  onReset: () => void;
  onSkip?: () => void;
  onSettings: () => void;
  className?: string;
}

export default function ControlButtons({
  state, onStart, onPause, onStop, onReset, onSkip, onSettings, className,
}: ControlButtonsProps) {
  const isRunning = state === "running";
  const isIdle = state === "idle";

  return (
    <div className={cn("flex items-center justify-center gap-4", className)}>
      {/* START / PAUSE button */}
      <button
        onClick={isRunning ? onPause : onStart}
        data-testid={isRunning ? "button-pause" : "button-start"}
        className="flex items-center gap-2.5 px-8 py-3 rounded-full transition-all duration-300 active:scale-95 hover:brightness-110"
        style={{
          background: isRunning
            ? "transparent"
            : "linear-gradient(135deg, #f5a623 0%, #e8941a 100%)",
          border: isRunning
            ? "1.5px solid rgba(245,166,35,0.5)"
            : "1.5px solid rgba(245,166,35,0.8)",
          color: isRunning ? "#f5a623" : "#0a0a12",
          boxShadow: isRunning
            ? "none"
            : "0 4px 20px rgba(245,166,35,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
          fontFamily: "'Rajdhani',sans-serif",
          fontWeight: 700,
          fontSize: "14px",
          letterSpacing: "0.15em",
        }}
      >
        {isRunning ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4 translate-x-0.5" />
        )}
        {isRunning ? "PAUSE" : "START"}
      </button>

      {/* STOP button (only when running or paused) */}
      {!isIdle && (
        <button
          onClick={onStop}
          data-testid="button-stop"
          className="flex items-center gap-2.5 px-6 py-3 rounded-full transition-all duration-300 active:scale-95 hover:border-amber-400/60"
          style={{
            background: "transparent",
            border: "1.5px solid rgba(255,255,255,0.15)",
            color: "rgba(255,255,255,0.65)",
            fontFamily: "'Rajdhani',sans-serif",
            fontWeight: 700,
            fontSize: "14px",
            letterSpacing: "0.15em",
          }}
        >
          STOP
        </button>
      )}

      {/* SKIP button */}
      <button
        onClick={onSkip || (() => {})}
        data-testid="button-skip"
        className="flex items-center gap-2.5 px-6 py-3 rounded-full transition-all duration-300 active:scale-95 hover:border-amber-400/40"
        style={{
          background: "transparent",
          border: "1.5px solid rgba(255,255,255,0.15)",
          color: "rgba(245,166,35,0.75)",
          fontFamily: "'Rajdhani',sans-serif",
          fontWeight: 700,
          fontSize: "14px",
          letterSpacing: "0.15em",
        }}
      >
        <SkipForward className="w-4 h-4" />
        SKIP
      </button>
    </div>
  );
}
