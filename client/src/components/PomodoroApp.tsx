import { useState, useEffect, useRef, useCallback } from "react";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { BarChart3, Settings, Flame, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Timer from "./Timer";
import ControlButtons from "./ControlButtons";
import SessionStats from "./SessionStats";
import Analytics from "./Analytics";
import SettingsPanel from "./SettingsPanel";
import FocusGoal from "./FocusGoal";
import StreakCounter from "./StreakCounter";
import Badges, { BADGE_MILESTONES } from "./Badges";
import HistoryList, { saveSessionToHistory, loadHistory, clearHistory, SessionRecord } from "./HistoryList";
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
function nowTime()  { const d = new Date(); return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`; }

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

// Label for sidebar section headings
function SLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs font-semibold tracking-[0.28em] uppercase"
      style={{ fontFamily: "'Rajdhani',sans-serif", color: "rgba(255,255,255,0.5)" }}>
      {children}
    </div>
  );
}

// Sidebar tab button
function SidebarTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 py-2 text-xs font-semibold tracking-[0.1em] uppercase rounded-full transition-all duration-200"
      style={{
        fontFamily: "'Rajdhani',sans-serif",
        color: active ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.45)",
        background: active ? "rgba(255,255,255,0.12)" : "transparent",
        border: active ? "1px solid rgba(255,255,255,0.18)" : "1px solid transparent",
      }}
    >
      {children}
    </button>
  );
}

// Header icon button
function HBtn({ onClick, testId, children }: { onClick: () => void; testId: string; children: React.ReactNode }) {
  return (
    <button onClick={onClick} data-testid={testId}
      className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95"
      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.55)" }}>
      {children}
    </button>
  );
}

export default function PomodoroApp() {
  const { toast } = useToast();

  const [showSidebar,   setShowSidebar]   = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showSettings,  setShowSettings]  = useState(false);
  const [sidebarTab,    setSidebarTab]    = useState<"progress" | "history">("progress");

  const [config,       setConfig]       = useState<TimerConfig>(() => loadConfig());
  const [streak,       setStreak]       = useState(() => loadStreak());
  const [todayData,    setTodayData]    = useState(() => loadToday());
  const [totalMins,    setTotalMins]    = useState(() => loadTotalMins());
  const [earnedBadges, setEarnedBadges] = useState<string[]>(() => loadBadges());
  const [newBadge,     setNewBadge]     = useState<string | null>(null);
  const [focusGoal,    setFocusGoal]    = useState(() => localStorage.getItem(LS.focusGoal) || "");
  const [history,      setHistory]      = useState<SessionRecord[]>(() => loadHistory());

  const [timerData, setTimerData] = useState<TimerData>(() => {
    const cfg = loadConfig();
    return { timeRemaining: cfg.workDuration, totalTime: cfg.workDuration, currentSession: "work", sessionsCompleted: 0, state: "idle" };
  });

  const intervalRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionStartRef = useRef<string>("");

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
      nextSession  = isLong ? "long-break" : "short-break";
      nextDuration = isLong ? cfg.longBreakDuration : cfg.shortBreakDuration;

      const durationMins = Math.floor(cfg.workDuration / 60);

      // Save to history
      const record = {
        date: todayStr(),
        startTime: sessionStartRef.current || nowTime(),
        durationMins,
        focusGoal: localStorage.getItem(LS.focusGoal) || "",
        sessionType: "work" as const,
      };
      saveSessionToHistory(record);
      setHistory(loadHistory());

      toast({ title: "Session complete", description: isLong ? "Long break time." : "Short break." });

      setTodayData(prev => {
        const u = { sessions: prev.sessions + 1, mins: prev.mins + durationMins, date: todayStr() };
        localStorage.setItem(LS.today, JSON.stringify(u)); return u;
      });
      setTotalMins(prev => {
        const u = prev + durationMins;
        localStorage.setItem(LS.totalMins, String(u)); return u;
      });
      setStreak(prev => {
        const today     = todayStr();
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        let cur = prev.current;
        if      (prev.lastDate === today)     { /* same day */ }
        else if (prev.lastDate === yesterday) cur = prev.current + 1;
        else                                  cur = 1;
        const u = { current: cur, best: Math.max(cur, prev.best), lastDate: today };
        localStorage.setItem(LS.streak, JSON.stringify(u)); return u;
      });
    } else {
      nextSession  = "work"; nextDuration = cfg.workDuration;
      toast({ title: "Break over", description: "Back to focus." });
    }

    if (cfg.soundEnabled) playBeep();
    setTimerData({ timeRemaining: nextDuration, totalTime: nextDuration, currentSession: nextSession, sessionsCompleted: nextSessions, state: "idle" });
  }, [toast]);

  useEffect(() => {
    if (timerData.state === "running") {
      if (!sessionStartRef.current) sessionStartRef.current = nowTime();
      intervalRef.current = setInterval(() => {
        setTimerData(prev => {
          if (prev.timeRemaining <= 1) { clearInterval(intervalRef.current!); handleSessionComplete(prev, config); return prev; }
          return { ...prev, timeRemaining: prev.timeRemaining - 1 };
        });
      }, 1000);
    } else {
      if (timerData.state === "idle") sessionStartRef.current = "";
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

  const handleStart = () => setTimerData(p => ({ ...p, state: "running" }));
  const handlePause = () => setTimerData(p => ({ ...p, state: "paused" }));
  const handleStop  = () => setTimerData(p => ({ ...p, state: "idle", timeRemaining: p.totalTime }));
  const handleReset = () => {
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

  const handleClearHistory = () => { clearHistory(); setHistory([]); };

  const cycle = Math.floor(timerData.sessionsCompleted / config.sessionsUntilLongBreak) + 1;

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: "#07070f" }}>

      {/* Atmospheric glow blobs */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: `
          radial-gradient(ellipse 55% 35% at 15% 85%, rgba(255,255,255,0.014) 0%, transparent 60%),
          radial-gradient(ellipse 45% 30% at 85% 15%, rgba(255,255,255,0.01) 0%, transparent 60%)
        `,
      }} />

      {/* ── Header ── */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 animate-fade-in-down"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div>
          <h1 className="text-sm font-semibold tracking-[0.3em] uppercase"
            style={{ fontFamily: "'Rajdhani',sans-serif", color: "rgba(255,255,255,0.92)" }}>
            Focus Timer
          </h1>
          <p className="text-xs tracking-[0.22em] uppercase mt-0.5"
            style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 400, color: "rgba(255,255,255,0.4)" }}>
            Pomodoro
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <HBtn onClick={() => setShowAnalytics(true)} testId="button-analytics"><BarChart3 className="w-4 h-4" /></HBtn>
          <HBtn onClick={() => setShowSettings(true)}  testId="button-settings-header"><Settings className="w-4 h-4" /></HBtn>
          <button
            onClick={() => setShowSidebar(true)}
            data-testid="button-sidebar"
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.85)" }}
          >
            <Flame className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 py-8 gap-8 max-w-lg mx-auto w-full">

        {/* Session tabs */}
        <div className="flex gap-1 p-1 rounded-full animate-fade-in-down delay-100"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
          {SESSION_TABS.map(({ key, label }) => {
            const active = timerData.currentSession === key;
            return (
              <button key={key} onClick={() => switchSession(key)} data-testid={`button-session-${key}`}
                className="px-4 py-2 rounded-full transition-all duration-200"
                style={{
                  fontFamily: "'Rajdhani',sans-serif", fontWeight: 600, fontSize: "12px", letterSpacing: "0.12em",
                  color:      active ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.45)",
                  background: active ? "rgba(255,255,255,0.12)" : "transparent",
                  border:     active ? "1px solid rgba(255,255,255,0.2)" : "1px solid transparent",
                }}>
                {label.toUpperCase()}
              </button>
            );
          })}
        </div>

        {/* Focus goal */}
        <FocusGoal value={focusGoal} onChange={setFocusGoal} />

        {/* Timer */}
        <div className="animate-scale-in delay-200">
          <Timer timeRemaining={timerData.timeRemaining} totalTime={timerData.totalTime}
            currentSession={timerData.currentSession} state={timerData.state} />
        </div>

        {/* Controls */}
        <div className="animate-fade-in-up delay-300">
          <ControlButtons state={timerData.state} onStart={handleStart} onPause={handlePause}
            onStop={handleStop} onReset={handleReset} onSettings={() => setShowSettings(true)} />
        </div>

        {/* Stats */}
        <SessionStats sessionsCompleted={timerData.sessionsCompleted} currentCycle={cycle}
          totalCycles={config.sessionsUntilLongBreak} timeSpentToday={todayData.mins} className="w-full" />
      </main>

      {/* ── Badge unlock toast ── */}
      {newBadge && (() => {
        const b = BADGE_MILESTONES.find(x => x.id === newBadge);
        if (!b) return null;
        return (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-badge-unlock" style={{ pointerEvents: "none" }}>
            <div className="px-6 py-3 rounded-full flex items-center gap-3"
              style={{ background: "rgba(8,8,18,0.97)", border: `1px solid ${b.glow}`, boxShadow: `0 0 24px ${b.glow}`, backdropFilter: "blur(20px)" }}>
              <div className="w-2 h-2 rounded-full" style={{ background: b.color }} />
              <span style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 600, fontSize: 13, letterSpacing: "0.14em", color: b.color }}>
                {b.name} UNLOCKED
              </span>
            </div>
          </div>
        );
      })()}

      {/* ── Sidebar: Streak + Badges + History ── */}
      <Sheet open={showSidebar} onOpenChange={setShowSidebar}>
        <SheetContent side="right"
          className="w-full sm:w-[400px] flex flex-col overflow-hidden border-none p-0"
          style={{
            background: "rgba(5,5,14,0.92)", backdropFilter: "blur(48px)", WebkitBackdropFilter: "blur(48px)",
            borderLeft: "1px solid rgba(255,255,255,0.1)", boxShadow: "-24px 0 64px rgba(0,0,0,0.7)",
          }}>

          {/* Visually hidden title for accessibility */}
          <SheetTitle className="sr-only">Progress — Streaks & Achievements</SheetTitle>
          <SheetDescription className="sr-only">View your focus streaks, achievement badges, and session history.</SheetDescription>

          {/* Sidebar header */}
          <div className="px-6 pt-8 pb-5 flex-shrink-0"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <h2 className="text-sm font-semibold tracking-[0.3em] uppercase"
              style={{ fontFamily: "'Rajdhani',sans-serif", color: "rgba(255,255,255,0.92)" }}>
              Progress
            </h2>
            <p className="text-xs tracking-[0.18em] uppercase mt-1"
              style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 400, color: "rgba(255,255,255,0.45)" }}>
              Streaks & Achievements
            </p>

            {/* Tabs */}
            <div className="flex gap-1 mt-4 p-1 rounded-full"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}>
              <SidebarTab active={sidebarTab === "progress"} onClick={() => setSidebarTab("progress")}>Progress</SidebarTab>
              <SidebarTab active={sidebarTab === "history"}  onClick={() => setSidebarTab("history")}>
                History {history.filter(r => r.sessionType === "work").length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px]"
                    style={{ background: "rgba(255,255,255,0.14)", color: "rgba(255,255,255,0.75)" }}>
                    {history.filter(r => r.sessionType === "work").length}
                  </span>
                )}
              </SidebarTab>
            </div>
          </div>

          {/* Sidebar body */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">

            {sidebarTab === "progress" && (
              <>
                {/* All-time focus */}
                <div className="space-y-3">
                  <SLabel>All-Time Focus</SLabel>
                  <div className="text-center py-6 rounded-2xl"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <div className="text-4xl font-light"
                      style={{ fontFamily: "'JetBrains Mono',monospace", color: "rgba(255,255,255,0.96)" }}>
                      {totalMins >= 60 ? `${Math.floor(totalMins / 60)}h ${totalMins % 60}m` : `${totalMins}m`}
                    </div>
                    <div className="text-xs font-semibold tracking-[0.22em] uppercase mt-2"
                      style={{ fontFamily: "'Rajdhani',sans-serif", color: "rgba(255,255,255,0.5)" }}>
                      Total Focused
                    </div>
                  </div>
                </div>

                {/* Streak */}
                <div className="space-y-3">
                  <SLabel>Streak</SLabel>
                  <StreakCounter currentStreak={streak.current} longestStreak={streak.best}
                    todaySessions={todayData.sessions} dailyGoal={8} />
                </div>

                {/* Badges */}
                <div className="space-y-3">
                  <SLabel>Achievement Badges</SLabel>
                  <p className="text-xs leading-relaxed"
                    style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 400, color: "rgba(255,255,255,0.45)" }}>
                    Tap an unlocked badge to view and download it as an image.
                  </p>
                  <Badges totalMinutes={totalMins} earnedBadgeIds={earnedBadges} newlyUnlocked={newBadge} />

                  {/* Milestone progress list */}
                  <div className="space-y-2 pt-2">
                    {BADGE_MILESTONES.map(b => {
                      const earned = earnedBadges.includes(b.id);
                      const pct    = Math.min((totalMins / b.minutesRequired) * 100, 100);
                      return (
                        <div key={b.id} className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                          style={{
                            background: earned ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)",
                            border: `1px solid ${earned ? b.glow : "rgba(255,255,255,0.08)"}`,
                          }}>
                          <div className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ background: earned ? b.color : "rgba(255,255,255,0.2)" }} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-semibold tracking-[0.1em]"
                                style={{ fontFamily: "'Rajdhani',sans-serif", color: earned ? b.color : "rgba(255,255,255,0.55)" }}>
                                {b.name}
                              </span>
                              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "10px", color: "rgba(255,255,255,0.45)" }}>
                                {b.minutesRequired >= 60 ? `${b.minutesRequired / 60}h` : `${b.minutesRequired}m`}
                              </span>
                            </div>
                            {!earned && (
                              <div className="mt-1.5 h-px w-full rounded-full" style={{ background: "rgba(255,255,255,0.1)" }}>
                                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "rgba(255,255,255,0.35)" }} />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {sidebarTab === "history" && (
              <div className="space-y-3">
                <SLabel>Session History</SLabel>
                <HistoryList records={history} onClear={handleClearHistory} />
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Analytics sheet ── */}
      <Sheet open={showAnalytics} onOpenChange={setShowAnalytics}>
        <SheetContent side="right"
          className="w-full sm:w-[420px] flex flex-col overflow-hidden border-none p-0"
          style={{
            background: "rgba(5,5,14,0.94)", backdropFilter: "blur(48px)", WebkitBackdropFilter: "blur(48px)",
            borderLeft: "1px solid rgba(255,255,255,0.1)", boxShadow: "-24px 0 64px rgba(0,0,0,0.7)",
          }}>

          <SheetTitle className="sr-only">Analytics — Productivity Overview</SheetTitle>
          <SheetDescription className="sr-only">View your focus session analytics and productivity trends.</SheetDescription>

          <div className="px-6 pt-8 pb-5 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <h2 className="text-sm font-semibold tracking-[0.3em] uppercase"
              style={{ fontFamily: "'Rajdhani',sans-serif", color: "rgba(255,255,255,0.92)" }}>Analytics</h2>
            <p className="text-xs tracking-[0.18em] uppercase mt-1"
              style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 400, color: "rgba(255,255,255,0.45)" }}>Productivity Overview</p>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-6"><Analytics /></div>
        </SheetContent>
      </Sheet>

      {/* ── Settings overlay ── */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(14px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowSettings(false); }}>
          <div className="animate-scale-in">
            <SettingsPanel config={config} onSave={handleSaveSettings} onClose={() => setShowSettings(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
