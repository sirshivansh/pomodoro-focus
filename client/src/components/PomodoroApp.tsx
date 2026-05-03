import { useState, useEffect, useRef, useCallback } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { BarChart3, Settings, LayoutGrid, Flame } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Timer from "./Timer";
import ControlButtons from "./ControlButtons";
import SessionStats from "./SessionStats";
import Analytics from "./Analytics";
import SettingsPanel from "./SettingsPanel";
import FocusGoal from "./FocusGoal";
import StreakCounter from "./StreakCounter";
import Badges, { BADGE_MILESTONES } from "./Badges";
import { SessionType, TimerConfig, TimerData } from "@shared/schema";

const DEFAULT_CONFIG: TimerConfig = {
  workDuration: 1500,
  shortBreakDuration: 300,
  longBreakDuration: 900,
  sessionsUntilLongBreak: 4,
  soundEnabled: true,
};

const LS = {
  totalMins: "ft_total_mins",
  streak:    "ft_streak",
  today:     "ft_today",
  badges:    "ft_badges",
  focusGoal: "ft_focus_goal",
  config:    "ft_config",
};

function todayStr() { return new Date().toISOString().slice(0, 10); }

function loadStreak() {
  try { const r = localStorage.getItem(LS.streak); if (r) return JSON.parse(r); } catch {}
  return { current: 0, best: 0, lastDate: "" };
}
function loadToday() {
  try {
    const r = localStorage.getItem(LS.today);
    if (r) { const p = JSON.parse(r); if (p.date === todayStr()) return p; }
  } catch {}
  return { sessions: 0, mins: 0, date: todayStr() };
}
function loadTotalMins() { return parseInt(localStorage.getItem(LS.totalMins) || "0", 10) || 0; }
function loadBadges(): string[] {
  try { const r = localStorage.getItem(LS.badges); if (r) return JSON.parse(r); } catch {}
  return [];
}
function loadConfig(): TimerConfig {
  try { const r = localStorage.getItem(LS.config); if (r) return JSON.parse(r); } catch {}
  return DEFAULT_CONFIG;
}

function playBeep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(528, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.4);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 1.4);
  } catch (_) {}
}

const SESSION_TABS: { key: SessionType; label: string }[] = [
  { key: "work",        label: "Focus" },
  { key: "short-break", label: "Short Break" },
  { key: "long-break",  label: "Long Break" },
];

// ── Sidebar section header ─────────────────────────────────────────
function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div
        className="text-xs tracking-[0.28em] uppercase"
        style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 600, color: "rgba(255,255,255,0.28)" }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

export default function PomodoroApp() {
  const { toast } = useToast();

  const [showSidebar,   setShowSidebar]   = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showSettings,  setShowSettings]  = useState(false);

  const [config,       setConfig]       = useState<TimerConfig>(() => loadConfig());
  const [streak,       setStreak]       = useState(() => loadStreak());
  const [todayData,    setTodayData]    = useState(() => loadToday());
  const [totalMins,    setTotalMins]    = useState(() => loadTotalMins());
  const [earnedBadges, setEarnedBadges] = useState<string[]>(() => loadBadges());
  const [newBadge,     setNewBadge]     = useState<string | null>(null);
  const [focusGoal,    setFocusGoal]    = useState(() => localStorage.getItem(LS.focusGoal) || "");

  const [timerData, setTimerData] = useState<TimerData>(() => {
    const cfg = loadConfig();
    return { timeRemaining: cfg.workDuration, totalTime: cfg.workDuration, currentSession: "work", sessionsCompleted: 0, state: "idle" };
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { document.documentElement.classList.add("dark"); }, []);
  useEffect(() => { localStorage.setItem(LS.focusGoal, focusGoal); }, [focusGoal]);
  useEffect(() => { localStorage.setItem(LS.config, JSON.stringify(config)); }, [config]);

  // Badge check
  useEffect(() => {
    const newlyEarned = BADGE_MILESTONES.filter(b => totalMins >= b.minutesRequired && !earnedBadges.includes(b.id));
    if (newlyEarned.length > 0) {
      const updated = [...earnedBadges, ...newlyEarned.map(b => b.id)];
      setEarnedBadges(updated);
      localStorage.setItem(LS.badges, JSON.stringify(updated));
      const latest = newlyEarned[newlyEarned.length - 1];
      setNewBadge(latest.id);
      toast({ title: `Badge Unlocked — ${latest.name}`, description: latest.subtitle });
      setTimeout(() => setNewBadge(null), 4000);
    }
  }, [totalMins]);

  const handleSessionComplete = useCallback((current: TimerData, cfg: TimerConfig) => {
    const isWork = current.currentSession === "work";
    const nextSessions = isWork ? current.sessionsCompleted + 1 : current.sessionsCompleted;
    let nextSession: SessionType, nextDuration: number;

    if (isWork) {
      const isLong = nextSessions % cfg.sessionsUntilLongBreak === 0;
      nextSession = isLong ? "long-break" : "short-break";
      nextDuration = isLong ? cfg.longBreakDuration : cfg.shortBreakDuration;
      toast({ title: "Session complete", description: isLong ? "Long break time." : "Short break." });

      setTodayData(prev => {
        const u = { sessions: prev.sessions + 1, mins: prev.mins + Math.floor(cfg.workDuration / 60), date: todayStr() };
        localStorage.setItem(LS.today, JSON.stringify(u)); return u;
      });
      setTotalMins(prev => {
        const u = prev + Math.floor(cfg.workDuration / 60);
        localStorage.setItem(LS.totalMins, String(u)); return u;
      });
      setStreak(prev => {
        const today = todayStr();
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        let cur = prev.current;
        if (prev.lastDate === today) { /* same day */ }
        else if (prev.lastDate === yesterday) cur = prev.current + 1;
        else cur = 1;
        const u = { current: cur, best: Math.max(cur, prev.best), lastDate: today };
        localStorage.setItem(LS.streak, JSON.stringify(u)); return u;
      });
    } else {
      nextSession = "work"; nextDuration = cfg.workDuration;
      toast({ title: "Break over", description: "Back to focus." });
    }

    if (cfg.soundEnabled) playBeep();
    setTimerData({ timeRemaining: nextDuration, totalTime: nextDuration, currentSession: nextSession, sessionsCompleted: nextSessions, state: "idle" });
  }, [toast]);

  useEffect(() => {
    if (timerData.state === "running") {
      intervalRef.current = setInterval(() => {
        setTimerData(prev => {
          if (prev.timeRemaining <= 1) { clearInterval(intervalRef.current!); handleSessionComplete(prev, config); return prev; }
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

  const handleStart  = () => setTimerData(p => ({ ...p, state: "running" }));
  const handlePause  = () => setTimerData(p => ({ ...p, state: "paused" }));
  const handleStop   = () => setTimerData(p => ({ ...p, state: "idle", timeRemaining: p.totalTime }));
  const handleReset  = () => {
    const dur = timerData.currentSession === "work" ? config.workDuration : timerData.currentSession === "short-break" ? config.shortBreakDuration : config.longBreakDuration;
    setTimerData(p => ({ ...p, timeRemaining: dur, totalTime: dur, state: "idle" }));
  };
  const handleSaveSettings = (c: TimerConfig) => {
    setConfig(c);
    if (timerData.state === "idle") {
      const dur = timerData.currentSession === "work" ? c.workDuration : timerData.currentSession === "short-break" ? c.shortBreakDuration : c.longBreakDuration;
      setTimerData(p => ({ ...p, timeRemaining: dur, totalTime: dur }));
    }
  };

  const cycle = Math.floor(timerData.sessionsCompleted / config.sessionsUntilLongBreak) + 1;

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: "#07070f" }}>

      {/* Atmospheric blobs */}
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
            className="text-sm font-semibold tracking-[0.3em] uppercase"
            style={{ fontFamily: "'Rajdhani', sans-serif", color: "rgba(255,255,255,0.82)" }}
          >
            Focus Timer
          </h1>
          <p
            className="text-xs tracking-[0.22em] uppercase mt-0.5"
            style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 400, color: "rgba(255,255,255,0.2)" }}
          >
            Pomodoro
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Analytics */}
          <button
            onClick={() => setShowAnalytics(true)}
            data-testid="button-analytics"
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.38)" }}
          >
            <BarChart3 className="w-4 h-4" />
          </button>
          {/* Settings */}
          <button
            onClick={() => setShowSettings(true)}
            data-testid="button-settings-header"
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.38)" }}
          >
            <Settings className="w-4 h-4" />
          </button>
          {/* Sidebar toggle */}
          <button
            onClick={() => setShowSidebar(true)}
            data-testid="button-sidebar"
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.65)",
            }}
          >
            <Flame className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ── Main — Timer only ── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 py-8 gap-8 max-w-lg mx-auto w-full">

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
                  color: active ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.26)",
                  background: active ? "rgba(255,255,255,0.1)" : "transparent",
                  border: active ? "1px solid rgba(255,255,255,0.14)" : "1px solid transparent",
                }}
              >
                {label.toUpperCase()}
              </button>
            );
          })}
        </div>

        {/* Focus goal */}
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

        {/* Session stats */}
        <SessionStats
          sessionsCompleted={timerData.sessionsCompleted}
          currentCycle={cycle}
          totalCycles={config.sessionsUntilLongBreak}
          timeSpentToday={todayData.mins}
          className="w-full"
        />
      </main>

      {/* ── Badge unlock toast ── */}
      {newBadge && (() => {
        const b = BADGE_MILESTONES.find(x => x.id === newBadge);
        if (!b) return null;
        return (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-badge-unlock" style={{ pointerEvents: "none" }}>
            <div
              className="px-6 py-3 rounded-full flex items-center gap-3"
              style={{
                background: "rgba(8,8,18,0.92)",
                border: `1px solid ${b.glow}`,
                boxShadow: `0 0 24px ${b.glow}`,
                backdropFilter: "blur(20px)",
              }}
            >
              <div className="w-2 h-2 rounded-full" style={{ background: b.color }} />
              <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 600, fontSize: 13, letterSpacing: "0.14em", color: b.color }}>
                {b.name} UNLOCKED
              </span>
            </div>
          </div>
        );
      })()}

      {/* ── Glassmorphic Sidebar: Streak + Badges ── */}
      <Sheet open={showSidebar} onOpenChange={setShowSidebar}>
        <SheetContent
          side="right"
          className="w-full sm:w-[380px] overflow-y-auto border-none p-0"
          style={{
            background: "rgba(5,5,14,0.88)",
            backdropFilter: "blur(48px)",
            WebkitBackdropFilter: "blur(48px)",
            borderLeft: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "-20px 0 60px rgba(0,0,0,0.6)",
          }}
        >
          {/* Sidebar header */}
          <div
            className="px-6 pt-8 pb-5"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <h2
              className="text-sm font-semibold tracking-[0.3em] uppercase"
              style={{ fontFamily: "'Rajdhani', sans-serif", color: "rgba(255,255,255,0.75)" }}
            >
              Progress
            </h2>
            <p
              className="text-xs tracking-[0.18em] uppercase mt-1"
              style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 400, color: "rgba(255,255,255,0.2)" }}
            >
              Streaks & Achievements
            </p>
          </div>

          {/* Sidebar content */}
          <div className="px-6 py-6 space-y-8">

            {/* Total time stat */}
            <SidebarSection title="All-Time Focus">
              <div
                className="text-center py-6 rounded-2xl"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div
                  className="text-4xl font-light"
                  style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(255,255,255,0.88)" }}
                >
                  {totalMins >= 60 ? `${Math.floor(totalMins / 60)}h ${totalMins % 60}m` : `${totalMins}m`}
                </div>
                <div
                  className="text-xs tracking-[0.22em] uppercase mt-2"
                  style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 500, color: "rgba(255,255,255,0.22)" }}
                >
                  Total Focused
                </div>
              </div>
            </SidebarSection>

            {/* Streak */}
            <SidebarSection title="Streak">
              <StreakCounter
                currentStreak={streak.current}
                longestStreak={streak.best}
                todaySessions={todayData.sessions}
                dailyGoal={8}
              />
            </SidebarSection>

            {/* Badges */}
            <SidebarSection title="Achievement Badges">
              <p
                className="text-xs leading-relaxed mb-4"
                style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 300, color: "rgba(255,255,255,0.3)" }}
              >
                Earn badges by accumulating focus time. Tap an unlocked badge to download it as an image.
              </p>
              <Badges
                totalMinutes={totalMins}
                earnedBadgeIds={earnedBadges}
                newlyUnlocked={newBadge}
              />

              {/* Milestone progress list */}
              <div className="mt-6 space-y-2">
                {BADGE_MILESTONES.map(b => {
                  const earned = earnedBadges.includes(b.id);
                  const pct = Math.min((totalMins / b.minutesRequired) * 100, 100);
                  return (
                    <div
                      key={b.id}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                      style={{
                        background: earned ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)",
                        border: `1px solid ${earned ? b.glow : "rgba(255,255,255,0.05)"}`,
                      }}
                    >
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: earned ? b.color : "rgba(255,255,255,0.12)" }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className="text-xs tracking-[0.1em]"
                            style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 600, color: earned ? b.color : "rgba(255,255,255,0.35)" }}
                          >
                            {b.name}
                          </span>
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "rgba(255,255,255,0.25)" }}>
                            {b.minutesRequired >= 60 ? `${b.minutesRequired / 60}h` : `${b.minutesRequired}m`}
                          </span>
                        </div>
                        {!earned && (
                          <div className="mt-1.5 h-px w-full rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "rgba(255,255,255,0.18)" }} />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </SidebarSection>
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Analytics sheet ── */}
      <Sheet open={showAnalytics} onOpenChange={setShowAnalytics}>
        <SheetContent
          side="right"
          className="w-full sm:w-[400px] overflow-y-auto border-none p-0"
          style={{
            background: "rgba(5,5,14,0.92)",
            backdropFilter: "blur(48px)",
            WebkitBackdropFilter: "blur(48px)",
            borderLeft: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "-20px 0 60px rgba(0,0,0,0.6)",
          }}
        >
          <div className="px-6 pt-8 pb-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <h2 className="text-sm font-semibold tracking-[0.3em] uppercase" style={{ fontFamily: "'Rajdhani', sans-serif", color: "rgba(255,255,255,0.75)" }}>
              Analytics
            </h2>
            <p className="text-xs tracking-[0.18em] uppercase mt-1" style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 400, color: "rgba(255,255,255,0.2)" }}>
              Productivity Overview
            </p>
          </div>
          <div className="px-6 py-6"><Analytics /></div>
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
