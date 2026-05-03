import { useState, useEffect, useRef, useCallback } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { BarChart3, Settings } from "lucide-react";
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
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.8);
  } catch (_) {}
}

const SESSION_TABS: { key: SessionType; label: string }[] = [
  { key: "work", label: "Focus" },
  { key: "short-break", label: "Short Break" },
  { key: "long-break", label: "Long Break" },
];

const SESSION_ACCENT: Record<SessionType, string> = {
  "work": "hsl(16 88% 65%)",
  "short-break": "hsl(142 71% 55%)",
  "long-break": "hsl(220 80% 68%)",
};

export default function PomodoroApp() {
  const { toast } = useToast();
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

  // Always force dark mode for this neumorphic design
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const handleSessionComplete = useCallback((current: TimerData, cfg: TimerConfig) => {
    const nextSessions = current.currentSession === "work" ? current.sessionsCompleted + 1 : current.sessionsCompleted;
    let nextSession: SessionType;
    let nextDuration: number;

    if (current.currentSession === "work") {
      const isLong = nextSessions % cfg.sessionsUntilLongBreak === 0;
      nextSession = isLong ? "long-break" : "short-break";
      nextDuration = isLong ? cfg.longBreakDuration : cfg.shortBreakDuration;
      toast({ title: "Session complete!", description: `Time for a ${isLong ? "long" : "short"} break.` });
    } else {
      nextSession = "work";
      nextDuration = cfg.workDuration;
      toast({ title: "Break over!", description: "Ready to focus again?" });
    }

    if (cfg.soundEnabled) playBeep();

    // TODO: remove mock data update - replace with real persistence
    setStreakData(prev => ({
      ...prev,
      todaySessions: current.currentSession === "work" ? prev.todaySessions + 1 : prev.todaySessions,
      timeSpentToday: current.currentSession === "work" ? prev.timeSpentToday + Math.floor(cfg.workDuration / 60) : prev.timeSpentToday,
    }));

    setTimerData({ timeRemaining: nextDuration, totalTime: nextDuration, currentSession: nextSession, sessionsCompleted: nextSessions, state: "idle" });
  }, [toast]);

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
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [timerData.state, config, handleSessionComplete]);

  useEffect(() => {
    const m = Math.floor(timerData.timeRemaining / 60).toString().padStart(2, "0");
    const s = (timerData.timeRemaining % 60).toString().padStart(2, "0");
    document.title = timerData.state === "running" ? `${m}:${s} — Focus Timer` : "Focus Timer";
  }, [timerData.timeRemaining, timerData.state]);

  const switchSession = (session: SessionType) => {
    if (timerData.state === "running") return;
    const dur = session === "work" ? config.workDuration : session === "short-break" ? config.shortBreakDuration : config.longBreakDuration;
    setTimerData(prev => ({ ...prev, currentSession: session, timeRemaining: dur, totalTime: dur, state: "idle" }));
  };

  const handleStart = () => setTimerData(prev => ({ ...prev, state: "running" }));
  const handlePause = () => setTimerData(prev => ({ ...prev, state: "paused" }));
  const handleStop = () => setTimerData(prev => ({ ...prev, state: "idle", timeRemaining: prev.totalTime }));
  const handleReset = () => {
    const dur = timerData.currentSession === "work" ? config.workDuration : timerData.currentSession === "short-break" ? config.shortBreakDuration : config.longBreakDuration;
    setTimerData(prev => ({ ...prev, timeRemaining: dur, totalTime: dur, state: "idle" }));
  };
  const handleSaveSettings = (c: TimerConfig) => {
    setConfig(c);
    if (timerData.state === "idle") {
      const dur = timerData.currentSession === "work" ? c.workDuration : timerData.currentSession === "short-break" ? c.shortBreakDuration : c.longBreakDuration;
      setTimerData(prev => ({ ...prev, timeRemaining: dur, totalTime: dur }));
    }
  };

  const accent = SESSION_ACCENT[timerData.currentSession];
  const cycle = Math.floor(timerData.sessionsCompleted / config.sessionsUntilLongBreak) + 1;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "hsl(var(--background))" }}
    >
      {/* Header */}
      <header
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: "1px solid hsl(var(--border))" }}
      >
        <div>
          <h1
            className="text-lg font-bold tracking-wide"
            style={{ color: "hsl(var(--foreground))" }}
          >
            Focus Timer
          </h1>
          <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
            Pomodoro Technique
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Analytics */}
          <button
            onClick={() => setShowAnalytics(true)}
            data-testid="button-analytics"
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-150"
            style={{ background: "hsl(var(--card))", boxShadow: "var(--neu-raised)" }}
          >
            <BarChart3 className="w-4 h-4" style={{ color: "hsl(var(--muted-foreground))" }} />
          </button>

          {/* Settings */}
          <button
            onClick={() => setShowSettings(true)}
            data-testid="button-settings-header"
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-150"
            style={{ background: "hsl(var(--card))", boxShadow: "var(--neu-raised)" }}
          >
            <Settings className="w-4 h-4" style={{ color: "hsl(var(--muted-foreground))" }} />
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 gap-10 max-w-lg mx-auto w-full">

        {/* Session type tabs */}
        <div
          className="flex gap-1 p-1 rounded-full"
          style={{
            background: "hsl(var(--card))",
            boxShadow: "var(--neu-pressed)",
          }}
        >
          {SESSION_TABS.map(({ key, label }) => {
            const active = timerData.currentSession === key;
            return (
              <button
                key={key}
                onClick={() => switchSession(key)}
                data-testid={`button-session-${key}`}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
                style={{
                  color: active ? "white" : "hsl(var(--muted-foreground))",
                  background: active ? SESSION_ACCENT[key] : "transparent",
                  boxShadow: active
                    ? "3px 3px 8px rgba(0,0,0,0.35), -1px -1px 4px rgba(255,255,255,0.06)"
                    : "none",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Timer ring */}
        <Timer
          timeRemaining={timerData.timeRemaining}
          totalTime={timerData.totalTime}
          currentSession={timerData.currentSession}
          state={timerData.state}
        />

        {/* Controls */}
        <ControlButtons
          state={timerData.state}
          onStart={handleStart}
          onPause={handlePause}
          onStop={handleStop}
          onReset={handleReset}
          onSettings={() => setShowSettings(true)}
        />

        {/* Stats */}
        <SessionStats
          sessionsCompleted={timerData.sessionsCompleted}
          currentCycle={cycle}
          totalCycles={config.sessionsUntilLongBreak}
          timeSpentToday={streakData.timeSpentToday}
          className="w-full"
        />

        {/* Streak */}
        <StreakCounter
          currentStreak={streakData.currentStreak}
          longestStreak={streakData.longestStreak}
          todaySessions={streakData.todaySessions}
          dailyGoal={8}
          className="w-full"
        />
      </main>

      {/* Analytics sheet */}
      <Sheet open={showAnalytics} onOpenChange={setShowAnalytics}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-lg overflow-y-auto"
          style={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}
        >
          <SheetHeader>
            <SheetTitle style={{ color: "hsl(var(--foreground))" }}>Analytics</SheetTitle>
            <SheetDescription style={{ color: "hsl(var(--muted-foreground))" }}>
              Your productivity overview.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <Analytics />
          </div>
        </SheetContent>
      </Sheet>

      {/* Settings overlay */}
      {showSettings && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
        >
          <SettingsPanel config={config} onSave={handleSaveSettings} onClose={() => setShowSettings(false)} />
        </div>
      )}
    </div>
  );
}
