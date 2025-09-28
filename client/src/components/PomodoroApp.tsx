import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Moon, Sun, BarChart3 } from "lucide-react";
import Timer from "./Timer";
import ControlButtons from "./ControlButtons";
import StreakCounter from "./StreakCounter";
import SessionStats from "./SessionStats";
import Analytics from "./Analytics";
import SettingsPanel from "./SettingsPanel";
import { TimerState, SessionType, TimerConfig, TimerData } from "@shared/schema";
import { cn } from "@/lib/utils";

export default function PomodoroApp() {
  const [isDark, setIsDark] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Timer state
  const [timerData, setTimerData] = useState<TimerData>({
    timeRemaining: 1500, // 25 minutes
    totalTime: 1500,
    currentSession: "work",
    sessionsCompleted: 0,
    state: "idle"
  });

  const [config, setConfig] = useState<TimerConfig>({
    workDuration: 1500, // 25 minutes
    shortBreakDuration: 300, // 5 minutes
    longBreakDuration: 900, // 15 minutes
    sessionsUntilLongBreak: 4,
    soundEnabled: true
  });

  // TODO: remove mock data - replace with real data from localStorage/backend
  const [streakData] = useState({
    currentStreak: 7,
    longestStreak: 15,
    todaySessions: 6,
    timeSpentToday: 150 // minutes
  });

  useEffect(() => {
    // Apply theme
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const handleStart = () => {
    setTimerData(prev => ({ ...prev, state: "running" }));
  };

  const handlePause = () => {
    setTimerData(prev => ({ ...prev, state: "paused" }));
  };

  const handleStop = () => {
    setTimerData(prev => ({ 
      ...prev, 
      state: "idle",
      timeRemaining: prev.totalTime 
    }));
  };

  const handleReset = () => {
    const duration = timerData.currentSession === "work" 
      ? config.workDuration 
      : timerData.currentSession === "short-break"
      ? config.shortBreakDuration
      : config.longBreakDuration;
      
    setTimerData(prev => ({
      ...prev,
      timeRemaining: duration,
      totalTime: duration,
      state: "idle"
    }));
  };

  const handleSettings = () => {
    setShowSettings(true);
  };

  const handleSaveSettings = (newConfig: TimerConfig) => {
    setConfig(newConfig);
    // Reset timer with new config if idle
    if (timerData.state === "idle") {
      const duration = timerData.currentSession === "work" 
        ? newConfig.workDuration 
        : timerData.currentSession === "short-break"
        ? newConfig.shortBreakDuration
        : newConfig.longBreakDuration;
        
      setTimerData(prev => ({
        ...prev,
        timeRemaining: duration,
        totalTime: duration
      }));
    }
  };

  const currentCycle = Math.floor(timerData.sessionsCompleted / config.sessionsUntilLongBreak) + 1;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Focus Timer</h1>
            <p className="text-sm text-muted-foreground">Stay productive with Pomodoro</p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Analytics button */}
            <Sheet open={showAnalytics} onOpenChange={setShowAnalytics}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="button-analytics">
                  <BarChart3 className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Analytics</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <Analytics />
                </div>
              </SheetContent>
            </Sheet>

            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDark(!isDark)}
              data-testid="button-theme-toggle"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-8">
          {/* Main timer display */}
          <div className="text-center">
            <Timer
              timeRemaining={timerData.timeRemaining}
              totalTime={timerData.totalTime}
              currentSession={timerData.currentSession}
              state={timerData.state}
            />
            
            <div className="mt-6">
              <ControlButtons
                state={timerData.state}
                onStart={handleStart}
                onPause={handlePause}
                onStop={handleStop}
                onReset={handleReset}
                onSettings={handleSettings}
              />
            </div>
          </div>

          {/* Stats row */}
          <div className="grid gap-4 md:grid-cols-2">
            <SessionStats
              sessionsCompleted={timerData.sessionsCompleted}
              currentCycle={currentCycle}
              totalCycles={config.sessionsUntilLongBreak}
              timeSpentToday={streakData.timeSpentToday}
            />
            
            <StreakCounter
              currentStreak={streakData.currentStreak}
              longestStreak={streakData.longestStreak}
              todaySessions={streakData.todaySessions}
              dailyGoal={8}
            />
          </div>

          {/* Footer info */}
          <Card className="bg-muted/50">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">
                The Pomodoro Technique: 25 minutes of focused work followed by a 5-minute break.
                After 4 cycles, take a longer 15-30 minute break.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Settings modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <SettingsPanel
            config={config}
            onSave={handleSaveSettings}
            onClose={() => setShowSettings(false)}
          />
        </div>
      )}
    </div>
  );
}