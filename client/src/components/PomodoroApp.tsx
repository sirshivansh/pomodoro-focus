import { useState, useEffect, useRef, useCallback } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { BarChart3, Settings, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Timer from "./Timer";
import ControlButtons from "./ControlButtons";
import StreakCounter from "./StreakCounter";
import SessionStats from "./SessionStats";
import Analytics from "./Analytics";
import SettingsPanel from "./SettingsPanel";
import FocusGoal from "./FocusGoal";
import Badges, { BADGE_MILESTONES } from "./Badges";
import { SessionType, TimerConfig, TimerData } from "@shared/schema";

const DEFAULT_CONFIG: TimerConfig = {
  workDuration: 1500,
  shortBreakDuration: 300,
  longBreakDuration: 900,
  sessionsUntilLongBreak: 4,
  soundEnabled: true,
};

// ── localStorage keys ──────────────────────────────────────────────
const LS = {
  totalMins:   "ft_total_mins",
  streak:      "ft_streak",
  today:       "ft_today",
  badges:      "ft_badges",
  focusGoal:   "ft_focus_goal",
  config:      "ft_config",
};

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function loadStreak() {
  try {
    const raw = localStorage.getItem(LS.streak);
    if (raw) return JSON.parse(raw) as { current: number; best: number; lastDate: string };
  } catch {}
  return { current: 0, best: 0, lastDate: "" };
}

function loadToday() {
  try {
    const raw = localStorage.getItem(LS.today);
    if (raw) {
      const parsed = JSON.parse(raw) as { sessions: number; mins: number; date: string };
      if (parsed.date === todayStr()) return parsed;
    }
  } catch {}
  return { sessions: 0, mins: 0, date: todayStr() };
}

function loadTotalMins(): number {
  return parseInt(localStorage.getItem(LS.totalMins) || "0", 10) || 0;
}

function loadBadges(): string[] {
  try {
    const raw = localStorage.getItem(LS.badges);
    if (raw) return JSON.parse(raw) as string[];
  } catch {}
  return [];
}

function loadConfig(): TimerConfig {
  try {
    const raw = localStorage.getItem(LS.config);
    if (raw) return JSON.parse(raw) as TimerConfig;
  } catch {}
  return DEFAULT_CONFIG;
}

// ── Audio ──────────────────────────────────────────────────────────
function playBeep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(528, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1.4);
  } catch (_) {}
}

const SESSION_TABS: { key: SessionType; label: string }[] = [
  { key: "work",        label: "Focus" },
  { key: "short-break", label: "Short Break" },
  { key: "long-break",  label: "Long Break" },
];

// ── Main component ─────────────────────────────────────────────────
export default function PomodoroApp() {
  const { toast } = useToast();

  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showSettings,  setShowSettings]  = useState(false);
  const [showBadges,    setShowBadges]     = useState(false);

  const [config, setConfig] = useState<TimerConfig>(() => loadConfig());

  const [timerData, setTimerData] = useState<TimerData>(() => ({
    timeRemaining: loadConfig().workDuration,
    totalTime:     loadConfig().workDuration,
    currentSession: "work",
    sessionsCompleted: 0,
    state: "idle",
  }));

  const [streak,     setStreak]     = useState(() => loadStreak());
  const [todayData,  setTodayData]  = useState(() => loadToday());
  const [totalMins,  setTotalMins]  = useState(() => loadTotalMins());
  const [earnedBadges, setEarnedBadges] = useState<string[]>(() => loadBadges());
  const [newBadge,   setNewBadge]   = useState<string | null>(null);
  const [focusGoal,  setFocusGoal]  = useState(() => localStorage.getItem(LS.focusGoal) || "");

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Always dark
  useEffect(() => { document.documentElement.classList.add("dark"); }, []);

  // Persist focusGoal
  useEffect(() => { localStorage.setItem(LS.focusGoal, focusGoal); }, [focusGoal]);

  // Persist config
  useEffect(() => { localStorage.setItem(LS.config, JSON.stringify(config)); }, [config]);

  // Check badges whenever totalMins changes
  useEffect(() => {
    const newlyEarned = BADGE_MILESTONES.filter(b =>
      totalMins >= b.minutesRequired && !earnedBadges.includes(b.id)
    );
    if (newlyEarned.length > 0) {
      const ids = newlyEarned.map(b => b.id);
      const updated = [...earnedBadges, ...ids];
      setEarnedBadges(updated);
      localStorage.setItem(LS.badges, JSON.stringify(updated));
      // Show first newly earned badge
      const latestBadge = newlyEarned[newlyEarned.length - 1];
      setNewBadge(latestBadge.id);
      toast({
        title: `Badge Unlocked — ${latestBadge.name}`,
        description: latestBadge.subtitle,
      });
      setTimeout(() => setNewBadge(null), 4000);
    }
  }, [totalMins]);

  // Session complete handler
  const handleSessionComplete = useCallback((current: TimerData, cfg: TimerConfig) => {
    const isWork = current.currentSession === "work";
    const nextSessions = isWork ? current.sessionsCompleted + 1 : current.sessionsCompleted;

    let nextSession: SessionType;
    let nextDuration: number;

    if (isWork) {
      const isLong = nextSessions % cfg.sessionsUntilLongBreak === 0;
      nextSession  = isLong ? "long-break" : "short-break";
      nextDuration = isLong ? cfg.longBreakDuration : cfg.shortBreakDuration;
      toast({ title: "Session complete", description: isLong ? "Long break time." : "Short break time." });

      // Update today
      setTodayData(prev => {
        const addedMins = Math.floor(cfg.workDuration / 60);
        const updated = { sessions: prev.sessions + 1, mins: prev.mins + addedMins, date: todayStr() };
        localStorage.setItem(LS.today, JSON.stringify(updated));
        return updated;
      });

      // Update total mins
      setTotalMins(prev => {
        const addedMins = Math.floor(cfg.workDuration / 60);
        const updated = prev + addedMins;
        localStorage.setItem(LS.totalMins, String(updated));
        return updated;
      });

      // Update streak
      setStreak(prev => {
        const today = todayStr();
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        let current = prev.current;
        if (prev.lastDate === today) {
          // Already recorded today — no change
        } else if (prev.lastDate === yesterday) {
          current = prev.current + 1;
        } else if (prev.lastDate !== today) {
          current = 1; // reset
        }
        const best = Math.max(current, prev.best);
        const updated = { current, best, lastDate: today };
        localStorage.setItem(LS.streak, JSON.stringify(updated));
        return updated;
      });
    } else {
      nextSession  = "work";
      nextDuration = cfg.workDuration;
      toast({ title: "Break over", description: "Back to focus." });
    }

    if (cfg.soundEnabled) playBeep();

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
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [timerData.state, config, handleSessionComplete]);

  // Tab title
  useEffect(() => {
    const m = Math.floor(timerData.timeRemaining / 60).toString().padStart(2, "0");
    const s = (timerData.timeRemaining % 60).toString().padStart(2, "0");
    document.title = timerData.state === "running" ? `${m}:${s} — Focus Timer` : "Focus Timer";
  }, [timerData.timeRemaining, timerData.state]);

  const switchSession = (session: SessionType) => {
    if (timerData.state === "running") return;
    const dur = session === "work" ? config.workDuration
      : session === "short-break" ? config.shortBreakDuration
      : config.longBreakDuration;
    setTimerData(prev => ({ ...prev, currentSession: session, timeRemaining: dur, totalTime: dur, state: "idle" }));
  };

  const handleStart  = () => setTimerData(prev => ({ ...prev, state: "running" }));
  const handlePause  = () => setTimerData(prev => ({ ...prev, state: "paused" }));
  const handleStop   = () => setTimerData(prev => ({ ...prev, state: "idle", timeRemaining: prev.totalTime }));
  const handleReset  = () => {
    const dur = timerData.currentSession === "work" ? config.workDuration
      : timerData.currentSession === "short-break" ? config.shortBreakDuration
      : config.longBreakDuration;
    setTimerData(prev => ({ ...prev, timeRemaining: dur, totalTime: dur, state: "idle" }));
  };
  const handleSaveSettings = (c: TimerConfig) => {
    setConfig(c);
    if (timerData.state === "idle") {
      const dur = timerData.currentSession === "work" ? c.workDuration
        : timerData.currentSession === "short-break" ? c.shortBreakDuration
        : c.longBreakDuration;
      setTimerData(prev => ({ ...prev, timeRemaining: dur, totalTime: dur }));
    }
  };

  const cycle = Math.floor(timerData.sessionsCompleted / config.sessionsUntilLongBreak) + 1;

  // ── Render ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: "#07070f" }}>

      {/* Atmospheric background */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: `
          radial-gradient(ellipse 55% 35% at 15% 85%, rgba(255,255,255,0.012) 0%, transparent 60%),
          radial-gradient(ellipse 45% 30% at 85% 15%, rgba(255,255,255,0.01) 0%, transparent 60%)
        `,
      }} />

      {/* ── Header ── */}
      <header
        className="relative z-10 flex items-center justify-between px-6 py-5 animate-fade-in-down"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div>
          <h1
            className="text-sm font-semibold tracking-[0.28em] uppercase"
            style={{ fontFamily: "'Rajdhani', sans-serif", color: "rgba(255,255,255,0.85)" }}
          >
            Focus Timer
          </h1>
          <p
            className="text-xs tracking-[0.2em] uppercase mt-0.5"
            style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 400, color: "rgba(255,255,255,0.22)" }}
          >
            Pomodoro
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {[
            { icon: <BarChart3 className="w-4 h-4" />, onClick: () => setShowAnalytics(true), testId: "button-analytics" },
            { icon: <Award className="w-4 h-4" />,     onClick: () => setShowBadges(true),    testId: "button-badges" },
            { icon: <Settings className="w-4 h-4" />,  onClick: () => setShowSettings(true),  testId: "button-settings-header" },
          ].map(({ icon, onClick, testId }) => (
            <button
              key={testId}
              onClick={onClick}
              data-testid={testId}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.4)",
              }}
            >
              {icon}
            </button>
          ))}
        </div>
      </header>

      {/* ── Main ── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 py-6 gap-7 max-w-md mx-auto w-full">

        {/* Session tabs */}
        <div
          className="flex gap-1 p-1 rounded-full animate-fade-in-down delay-100"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          {SESSION_TABS.map(({ key, label }) => {
            const active = timerData.currentSession === key;
            return (
              <button
                key={key}
                onClick={() => switchSession(key)}
                data-testid={`button-session-${key}`}
                className="px-4 py-2 rounded-full transition-all duration-200"
                style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontWeight: 600,
                  fontSize: "12px",
                  letterSpacing: "0.12em",
                  color: active ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.28)",
                  background: active ? "rgba(255,255,255,0.1)" : "transparent",
                  border: active ? "1px solid rgba(255,255,255,0.14)" : "1px solid transparent",
                }}
              >
                {label.toUpperCase()}
              </button>
            );
          })}
        </div>

        {/* Focus goal input */}
        <FocusGoal value={focusGoal} onChange={setFocusGoal} />

        {/* Timer */}
        <div className="animate-scale-in delay-200">
          <Timer
            timeRemaining={timerData.timeRemaining}
            totalTime={timerData.totalTime}
            currentSession={timerData.currentSession}
            state={timerData.state}
          />
        </div>

        {/* Controls */}
        <div className="animate-fade-in-up delay-300">
          <ControlButtons
            state={timerData.state}
            onStart={handleStart}
            onPause={handlePause}
            onStop={handleStop}
            onReset={handleReset}
            onSettings={() => setShowSettings(true)}
          />
        </div>

        {/* Stats */}
        <SessionStats
          sessionsCompleted={timerData.sessionsCompleted}
          currentCycle={cycle}
          totalCycles={config.sessionsUntilLongBreak}
          timeSpentToday={todayData.mins}
          className="w-full"
        />

        {/* Streak */}
        <StreakCounter
          currentStreak={streak.current}
          longestStreak={streak.best}
          todaySessions={todayData.sessions}
          dailyGoal={8}
          className="w-full"
        />

        {/* Badges strip */}
        <div className="w-full animate-fade-in-up delay-500">
          <Badges
            totalMinutes={totalMins}
            earnedBadgeIds={earnedBadges}
            newlyUnlocked={newBadge}
          />
        </div>
      </main>

      {/* ── Badge unlock flash ── */}
      {newBadge && (() => {
        const b = BADGE_MILESTONES.find(x => x.id === newBadge);
        if (!b) return null;
        return (
          <div
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-badge-unlock"
            style={{ pointerEvents: "none" }}
          >
            <div
              className="px-6 py-3 rounded-full flex items-center gap-3"
              style={{
                background: "rgba(8,8,18,0.9)",
                border: `1px solid ${b.glow}`,
                boxShadow: `0 0 24px ${b.glow}`,
                backdropFilter: "blur(20px)",
              }}
            >
              <Award className="w-4 h-4" style={{ color: b.color }} />
              <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 600, fontSize: 13, letterSpacing: "0.15em", color: b.color }}>
                {b.name} UNLOCKED
              </span>
            </div>
          </div>
        );
      })()}

      {/* ── Analytics sheet ── */}
      <Sheet open={showAnalytics} onOpenChange={setShowAnalytics}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md overflow-y-auto"
          style={{ background: "rgba(5,5,14,0.98)", borderLeft: "1px solid rgba(255,255,255,0.07)" }}
        >
          <SheetHeader>
            <SheetTitle
              style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 600, letterSpacing: "0.2em", fontSize: 14, color: "rgba(255,255,255,0.85)" }}
            >
              ANALYTICS
            </SheetTitle>
            <SheetDescription style={{ color: "rgba(255,255,255,0.28)" }}>
              Your productivity overview
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6"><Analytics /></div>
        </SheetContent>
      </Sheet>

      {/* ── Badges sheet ── */}
      <Sheet open={showBadges} onOpenChange={setShowBadges}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md overflow-y-auto"
          style={{ background: "rgba(5,5,14,0.98)", borderLeft: "1px solid rgba(255,255,255,0.07)" }}
        >
          <SheetHeader>
            <SheetTitle
              style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 600, letterSpacing: "0.2em", fontSize: 14, color: "rgba(255,255,255,0.85)" }}
            >
              BADGES
            </SheetTitle>
            <SheetDescription style={{ color: "rgba(255,255,255,0.28)" }}>
              Earn badges by hitting focus milestones. Tap any unlocked badge to download it.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            {/* Total time stat */}
            <div
              className="text-center py-5 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div
                className="text-4xl font-light"
                style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(255,255,255,0.88)" }}
              >
                {totalMins >= 60 ? `${Math.floor(totalMins / 60)}h ${totalMins % 60}m` : `${totalMins}m`}
              </div>
              <div
                className="text-xs tracking-[0.22em] uppercase mt-1"
                style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 500, color: "rgba(255,255,255,0.25)" }}
              >
                Total Focus Time
              </div>
            </div>

            {/* Badge grid */}
            <Badges
              totalMinutes={totalMins}
              earnedBadgeIds={earnedBadges}
              newlyUnlocked={newBadge}
            />

            {/* Milestone list */}
            <div className="space-y-2">
              {BADGE_MILESTONES.map(b => {
                const earned = earnedBadges.includes(b.id);
                const pct = Math.min((totalMins / b.minutesRequired) * 100, 100);
                return (
                  <div
                    key={b.id}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl"
                    style={{
                      background: earned ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)",
                      border: `1px solid ${earned ? b.glow : "rgba(255,255,255,0.05)"}`,
                    }}
                  >
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: earned ? b.color : "rgba(255,255,255,0.15)" }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className="text-xs tracking-widest"
                          style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 600, color: earned ? b.color : "rgba(255,255,255,0.4)" }}
                        >
                          {b.name}
                        </span>
                        <span
                          className="text-xs flex-shrink-0"
                          style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 300, color: "rgba(255,255,255,0.3)" }}
                        >
                          {b.minutesRequired >= 60 ? `${b.minutesRequired / 60}h` : `${b.minutesRequired}m`}
                        </span>
                      </div>
                      {!earned && (
                        <div className="mt-1.5 h-px w-full rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: "rgba(255,255,255,0.2)" }} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Settings overlay ── */}
      {showSettings && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowSettings(false); }}
        >
          <div className="animate-scale-in">
            <SettingsPanel config={config} onSave={handleSaveSettings} onClose={() => setShowSettings(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
