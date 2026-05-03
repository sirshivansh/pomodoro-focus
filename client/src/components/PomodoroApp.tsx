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
    osc.frequency.setValueAtTime(660, ctx.currentTime);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1.2);
  } catch (_) {}
}

const SESSION_TABS: { key: SessionType; label: string }[] = [
  { key: "work", label: "Focus" },
  { key: "short-break", label: "Short Break" },
  { key: "long-break", label: "Long Break" },
];

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

  // TODO: remove mock streak data - replace with localStorage/backend persistence
  const [streakData, setStreakData] = useState({
    currentStreak: 7,
    longestStreak: 15,
    todaySessions: 6,
    timeSpentToday: 150,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Always force dark mode for this glassmorphism design
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
      toast({ title: "Session complete", description: isLong ? "Time for a long break." : "Short break time." });
    } else {
      nextSession = "work";
      nextDuration = cfg.workDuration;
      toast({ title: "Break over", description: "Back to focus." });
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

  const handleStart   = () => setTimerData(prev => ({ ...prev, state: "running" }));
  const handlePause   = () => setTimerData(prev => ({ ...prev, state: "paused" }));
  const handleStop    = () => setTimerData(prev => ({ ...prev, state: "idle", timeRemaining: prev.totalTime }));
  const handleReset   = () => {
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

  const cycle = Math.floor(timerData.sessionsCompleted / config.sessionsUntilLongBreak) + 1;

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: "#07070f" }}
    >
      {/* Atmospheric background blobs */}
      <div
        style={{
          position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
          background: `
            radial-gradient(ellipse 60% 40% at 20% 80%, rgba(255,255,255,0.015) 0%, transparent 60%),
            radial-gradient(ellipse 50% 35% at 80% 20%, rgba(255,255,255,0.012) 0%, transparent 60%),
            radial-gradient(ellipse 80% 60% at 50% 50%, rgba(255,255,255,0.008) 0%, transparent 70%)
          `,
        }}
      />

      {/* Header */}
      <header
        className="relative z-10 flex items-center justify-between px-6 py-5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div>
          <h1 className="text-sm font-medium tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.9)" }}>
            Focus Timer
          </h1>
          <p className="text-xs tracking-widest uppercase mt-0.5" style={{ color: "rgba(255,255,255,0.25)" }}>
            Pomodoro
          </p>
        </div>

        <div className="flex items-center gap-3">
          {[
            { icon: <BarChart3 className="w-4 h-4" />, onClick: () => setShowAnalytics(true), testId: "button-analytics" },
            { icon: <Settings className="w-4 h-4" />,  onClick: () => setShowSettings(true),  testId: "button-settings-header" },
          ].map(({ icon, onClick, testId }) => (
            <button
              key={testId}
              onClick={onClick}
              data-testid={testId}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.45)",
              }}
            >
              {icon}
            </button>
          ))}
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 py-6 gap-8 max-w-md mx-auto w-full">

        {/* Session tabs */}
        <div
          className="flex gap-1 p-1 rounded-full"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {SESSION_TABS.map(({ key, label }) => {
            const active = timerData.currentSession === key;
            return (
              <button
                key={key}
                onClick={() => switchSession(key)}
                data-testid={`button-session-${key}`}
                className="px-4 py-2 rounded-full text-xs font-medium transition-all duration-200"
                style={{
                  color: active ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.3)",
                  background: active ? "rgba(255,255,255,0.1)" : "transparent",
                  border: active ? "1px solid rgba(255,255,255,0.15)" : "1px solid transparent",
                  letterSpacing: "0.03em",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Timer */}
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

        {/* Bottom divider line */}
        <div className="w-16 h-px mx-auto" style={{ background: "rgba(255,255,255,0.08)" }} />
      </main>

      {/* Analytics sheet */}
      <Sheet open={showAnalytics} onOpenChange={setShowAnalytics}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md overflow-y-auto"
          style={{
            background: "rgba(6,6,14,0.97)",
            border: "none",
            borderLeft: "1px solid rgba(255,255,255,0.07)",
            backdropFilter: "blur(40px)",
          }}
        >
          <SheetHeader>
            <SheetTitle style={{ color: "rgba(255,255,255,0.9)", letterSpacing: "0.08em", fontSize: 13, textTransform: "uppercase" }}>
              Analytics
            </SheetTitle>
            <SheetDescription style={{ color: "rgba(255,255,255,0.3)" }}>
              Your productivity overview
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
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(10px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowSettings(false); }}
        >
          <SettingsPanel config={config} onSave={handleSaveSettings} onClose={() => setShowSettings(false)} />
        </div>
      )}
    </div>
  );
}
