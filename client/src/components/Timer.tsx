import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { TimerState, SessionType } from "@shared/schema";

interface TimerProps {
  timeRemaining: number;
  totalTime: number;
  currentSession: SessionType;
  state: TimerState;
  className?: string;
}

export default function Timer({ 
  timeRemaining, 
  totalTime, 
  currentSession, 
  state,
  className 
}: TimerProps) {
  const [displayTime, setDisplayTime] = useState(timeRemaining);

  useEffect(() => {
    setDisplayTime(timeRemaining);
  }, [timeRemaining]);

  const progress = totalTime > 0 ? ((totalTime - timeRemaining) / totalTime) * 100 : 0;
  const circumference = 2 * Math.PI * 140; // radius = 140
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionColor = () => {
    switch (currentSession) {
      case 'work':
        return 'stroke-primary';
      case 'short-break':
        return 'stroke-chart-3'; // orange
      case 'long-break':
        return 'stroke-chart-2'; // green
      default:
        return 'stroke-primary';
    }
  };

  const getSessionLabel = () => {
    switch (currentSession) {
      case 'work':
        return 'Focus Time';
      case 'short-break':
        return 'Short Break';
      case 'long-break':
        return 'Long Break';
      default:
        return 'Focus Time';
    }
  };

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className="relative w-80 h-80 mb-6">
        <svg
          className="w-full h-full transform -rotate-90"
          viewBox="0 0 320 320"
        >
          {/* Background circle */}
          <circle
            cx="160"
            cy="160"
            r="140"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-muted"
          />
          {/* Progress circle */}
          <circle
            cx="160"
            cy="160"
            r="140"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={cn(
              "transition-all duration-1000 ease-linear",
              getSessionColor()
            )}
          />
        </svg>
        
        {/* Timer display in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-6xl font-bold font-mono text-foreground mb-2">
            {formatTime(displayTime)}
          </div>
          <div className="text-lg font-medium text-muted-foreground">
            {getSessionLabel()}
          </div>
          <div className="text-sm text-muted-foreground mt-1 capitalize">
            {state === 'running' ? 'In Progress' : state === 'paused' ? 'Paused' : 'Ready'}
          </div>
        </div>
      </div>
    </div>
  );
}