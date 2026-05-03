import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { Moon, Sun, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Timer from "./Timer";
import ControlButtons from "./ControlButtons";
import StreakCounter from "./StreakCounter";
import SessionStats from "./SessionStats";
import Analytics from "./Analytics";
import SettingsPanel from "./SettingsPanel";
import { SessionType, TimerConfig, TimerData } from "@shared/schema";

const DEFAULT_CONFIG: TimerConfig = {
  workDuration: 1500,
  shortBreakDuration: 300,
  longBreakDuration: 900,
  sessionsUntilLongBreak: 4,
  soundEnabled: true,
};

function playBeep() {
  try {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.8);
  } catch (_) {}
}

export default function PomodoroApp() {
  const { toast } = useToast();
  const [isDark, setIsDark] = useState(() => {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [config, setConfig] = useState<TimerConfig>(DEFAULT_CONFIG);

  const [timerData, setTimerData] = useState<TimerData>({
    timeRemaining: DEFAULT_CONFIG.workDuration,
    totalTime: DEFAULT_CONFIG.workDuration,
    currentSession: "work",
    sessionsCompleted: 0,
    state: "idle",
  });

  // TODO: remove mock streak data - replace with localStorage/backend
  const [streakData, setStreakData] = useState({
    currentStreak: 7,
    longestStreak: 15,
    todaySessions: 6,
    timeSpentToday: 150,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const handleSessionComplete = useCallback((current: TimerData, cfg: TimerConfig) => {
    const nextSessions = current.currentSession === "work"
      ? current.sessionsCompleted + 1
      : current.sessionsCompleted;

    let nextSession: SessionType;
    let nextDuration: number;

    if (current.currentSession === "work") {
      const isLongBreak = nextSessions % cfg.sessionsUntilLongBreak === 0;
      nextSession = isLongBreak ? "long-break" : "short-break";
      nextDuration = isLongBreak ? cfg.longBreakDuration : cfg.shortBreakDuration;
      toast({
        title: "Focus session complete!",
        description: `Time for a ${isLongBreak ? "long" : "short"} break. Well done!`,
      });
    } else {
      nextSession = "work";
      nextDuration = cfg.workDuration;
      toast({
        title: "Break over!",
        description: "Ready to focus again? Let's go!",
      });
    }

    if (cfg.soundEnabled) playBeep();

    // TODO: remove mock data update - replace with real data persistence
    setStreakData(prev => ({
      ...prev,
      todaySessions: current.currentSession === "work" ? prev.todaySessions + 1 : prev.todaySessions,
      timeSpentToday: current.currentSession === "work"
        ? prev.timeSpentToday + Math.floor(cfg.workDuration / 60)
        : prev.timeSpentToday,
    }));

    setTimerData({
      timeRemaining: nextDuration,
      totalTime: nextDuration,
      currentSession: nextSession,
      sessionsCompleted: nextSessions,
      state: "idle",
    });
  }, [toast]);

  // Countdown interval
  useEffect(() => {
    if (timerData.state === "running") {
      intervalRef.current = setInterval(() => {
        setTimerData(prev => {
          if (prev.timeRemaining <= 1) {
            clearInterval(intervalRef.current!);
            handleSessionComplete(prev, config);
            return prev;
          }
          return { ...prev, timeRemaining: prev.timeRemaining - 1 };
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerData.state, config, handleSessionComplete]);

  // Update document title with time remaining
  useEffect(() => {
    const mins = Math.floor(timerData.timeRemaining / 60).toString().padStart(2, "0");
    const secs = (timerData.timeRemaining % 60).toString().padStart(2, "0");
    const label = timerData.currentSession === "work" ? "Focus" : "Break";
    document.title = timerData.state === "running"
      ? `${mins}:${secs} — ${label} | Focus Timer`
      : "Focus Timer";
  }, [timerData.timeRemaining, timerData.state, timerData.currentSession]);

  const handleStart = () => setTimerData(prev => ({ ...prev, state: "running" }));
  const handlePause = () => setTimerData(prev => ({ ...prev, state: "paused" }));
  const handleStop = () => setTimerData(prev => ({
    ...prev, state: "idle", timeRemaining: prev.totalTime,
  }));

  const handleReset = () => {
    const duration = timerData.currentSession === "work"
      ? config.workDuration
      : timerData.currentSession === "short-break"
      ? config.shortBreakDuration
      : config.longBreakDuration;
    setTimerData(prev => ({
      ...prev, timeRemaining: duration, totalTime: duration, state: "idle",
    }));
  };

  const handleSaveSettings = (newConfig: TimerConfig) => {
    setConfig(newConfig);
    if (timerData.state === "idle") {
      const duration = timerData.currentSession === "work"
        ? newConfig.workDuration
        : timerData.currentSession === "short-break"
        ? newConfig.shortBreakDuration
        : newConfig.longBreakDuration;
      setTimerData(prev => ({ ...prev, timeRemaining: duration, totalTime: duration }));
    }
  };

  const currentCycle = Math.floor(timerData.sessionsCompleted / config.sessionsUntilLongBreak) + 1;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold">Focus Timer</h1>
            <p className="text-sm text-muted-foreground">Stay productive with Pomodoro</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Analytics */}
            <Sheet open={showAnalytics} onOpenChange={setShowAnalytics}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="button-analytics">
                  <BarChart3 className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Analytics</SheetTitle>
                  <SheetDescription>Your productivity overview across time periods.</SheetDescription>
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
              onClick={() => setIsDark(d => !d)}
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
          {/* Timer */}
          <div className="text-center">
            <Timer
              timeRemaining={timerData.timeRemaining}
              totalTime={timerData.totalTime}
              currentSession={timerData.currentSession}
              state={timerData.state}
            />
            <div className="mt-4">
              <ControlButtons
                state={timerData.state}
                onStart={handleStart}
                onPause={handlePause}
                onStop={handleStop}
                onReset={handleReset}
                onSettings={() => setShowSettings(true)}
              />
            </div>
          </div>

          {/* Stats */}
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

          {/* Info footer */}
          <Card className="bg-muted/40">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">
                25 minutes of deep work, then a short break. After 4 cycles, take a long break and recharge.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Settings overlay */}
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
