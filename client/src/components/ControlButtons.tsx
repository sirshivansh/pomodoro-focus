import { Button } from "@/components/ui/button";
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

export default function ControlButtons({
  state,
  onStart,
  onPause,
  onStop,
  onReset,
  onSettings,
  className
}: ControlButtonsProps) {
  const handleStart = () => {
    console.log('Start timer triggered');
    onStart();
  };

  const handlePause = () => {
    console.log('Pause timer triggered');
    onPause();
  };

  const handleStop = () => {
    console.log('Stop timer triggered');
    onStop();
  };

  const handleReset = () => {
    console.log('Reset timer triggered');
    onReset();
  };

  const handleSettings = () => {
    console.log('Settings triggered');
    onSettings();
  };

  return (
    <div className={cn("flex items-center justify-center gap-4", className)}>
      {/* Main play/pause button */}
      <Button
        size="lg"
        onClick={state === 'running' ? handlePause : handleStart}
        className="h-14 w-14 rounded-full"
        data-testid={state === 'running' ? 'button-pause' : 'button-start'}
      >
        {state === 'running' ? (
          <Pause className="w-6 h-6" />
        ) : (
          <Play className="w-6 h-6" />
        )}
      </Button>

      {/* Stop button */}
      <Button
        variant="outline"
        size="lg"
        onClick={handleStop}
        disabled={state === 'idle'}
        className="h-12 w-12 rounded-full"
        data-testid="button-stop"
      >
        <Square className="w-5 h-5" />
      </Button>

      {/* Reset button */}
      <Button
        variant="outline"
        size="lg"
        onClick={handleReset}
        className="h-12 w-12 rounded-full"
        data-testid="button-reset"
      >
        <RotateCcw className="w-5 h-5" />
      </Button>

      {/* Settings button */}
      <Button
        variant="ghost"
        size="lg"
        onClick={handleSettings}
        className="h-12 w-12 rounded-full"
        data-testid="button-settings"
      >
        <Settings className="w-5 h-5" />
      </Button>
    </div>
  );
}