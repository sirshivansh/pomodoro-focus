import { useState, useEffect, useRef, useCallback } from "react";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { BarChart3, Settings, Flame, LogOut, User as UserIcon, Book } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Timer from "./Timer";
import ControlButtons from "./ControlButtons";
import SessionStats from "./SessionStats";
import Analytics from "./Analytics";
import SettingsPanel from "./SettingsPanel";
import ProfilePanel from "./ProfilePanel";
import FocusGoal from "./FocusGoal";
import StreakCounter from "./StreakCounter";
import Badges, { BADGE_MILESTONES } from "./Badges";
import HistoryList from "./HistoryList";
import { useSessions } from "@/hooks/use-sessions";
import { useAuth } from "@/hooks/use-auth";
import QuoteDisplay from "./QuoteDisplay";
import WeeklyHeatmap from "./WeeklyHeatmap";
import { SessionType, TimerConfig, TimerData } from "@shared/schema";

const DEFAULT_CONFIG: TimerConfig = {
  workDuration: 1500,
  shortBreakDuration: 300,
  longBreakDuration: 900,
  sessionsUntilLongBreak: 4,
  soundEnabled: true,
  autoStart: false,
  notificationsEnabled: false,
};

const LS = {
  totalMins: "ft_total_mins",
  streak: "ft_streak",
  today: "ft_today",
  badges: "ft_badges",
  focusGoal: "ft_focus_goal",
  config: "ft_config",
};

function todayStr() { return new Date().toISOString().slice(0, 10); }
function nowTime() { const d = new Date(); return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; }

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
  try {
    const r = localStorage.getItem(LS.config);
    if (r) return { ...DEFAULT_CONFIG, ...JSON.parse(r) };
  } catch {}
  return DEFAULT_CONFIG;
}

function playBeep(type: "work" | "break") {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = "sine";
    if (type === "work") {
      osc.frequency.setValueAtTime(528, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.3);
    } else {
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(330, ctx.currentTime + 0.3);
    }
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.4);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 1.4);
  } catch (_) {}
}

function sendNotification(title: string, body: string) {
  try {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body, icon: "/favicon.ico" });
    }
  } catch (_) {}
}

async function requestNotificationPermission() {
  try {
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
  } catch (_) {}
}

function announce(text: string) {
  try {
    const msg = new SpeechSynthesisUtterance(text);
    msg.rate = 0.9;
    msg.pitch = 1.1;
    msg.volume = 0.8;
    window.speechSynthesis.speak(msg);
  } catch (_) {}
}

function playClockSound(type: "start" | "tick") {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "start") {
      // Modern startup chime
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.8);
    } else {
      // Subtle tick
      osc.type = "square";
      osc.frequency.setValueAtTime(100, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);
    }
  } catch (_) {}
}

const SESSION_TABS: { key: SessionType; label: string }[] = [
  { key: "work", label: "Focus" },
  { key: "short-break", label: "Short Break" },
  { key: "long-break", label: "Long Break" },
];

function SLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-xs font-semibold tracking-[0.28em] uppercase" style={{ fontFamily: "'Rajdhani',sans-serif", color: "rgba(255,255,255,0.5)" }}>{children}</div>;
}

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

function HBtn({ onClick, testId, highlighted, children }: { onClick: () => void; testId: string; highlighted?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      data-testid={testId}
      className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95"
      style={{
        background: highlighted ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)",
        border: `1px solid ${highlighted ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)"}`,
        color: highlighted ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.55)",
      }}
    >
      {children}
    </button>
  );
}

export default function PomodoroApp() {
  const { toast } = useToast();

  const [showSidebar, setShowSidebar] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<"progress" | "history">("progress");

  const [config, setConfig] = useState<TimerConfig>(() => loadConfig());
  const [streak, setStreak] = useState(() => loadStreak());
  const [todayData, setTodayData] = useState(() => loadToday());
  const [totalMins, setTotalMins] = useState(() => loadTotalMins());
  const [earnedBadges, setEarnedBadges] = useState<string[]>(() => loadBadges());
  const [newBadge, setNewBadge] = useState<string | null>(null);
  const [focusGoal, setFocusGoal] = useState(() => localStorage.getItem(LS.focusGoal) || "");
  const { sessions: history, createSession } = useSessions();
  const { logoutMutation, user } = useAuth();
  const [completedCount, setCompletedCount] = useState(0);

  const [timerData, setTimerData] = useState<TimerData>(() => {
    const cfg = loadConfig();
    return { timeRemaining: cfg.workDuration, totalTime: cfg.workDuration, currentSession: "work", sessionsCompleted: 0, state: "idle" };
  });

  const [sessionCompleted, setSessionCompleted] = useState<{ type: SessionType, next: SessionType } | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const expectedEndTimeRef = useRef<number | null>(null);
  const sessionStartRef = useRef<string>("");
  const autoStartRef = useRef(config.autoStart);
  const channelRef = useRef<BroadcastChannel | null>(null);

  const timerDataRef = useRef(timerData);
  useEffect(() => { timerDataRef.current = timerData; }, [timerData]);

  useEffect(() => {
    channelRef.current = new BroadcastChannel("pomodoro_sync");
    channelRef.current.onmessage = (event) => {
      if (event.data.type === "REQUEST_STATE") {
        channelRef.current?.postMessage({ type: "STATE_UPDATE", payload: timerDataRef.current });
      } else if (event.data.type === "COMMAND") {
        const { action } = event.data;
        // Using window functions directly to avoid dependency on state/props
        if (action === "START") {
          const btn = document.querySelector('[data-testid="button-start"]') as HTMLButtonElement;
          btn?.click();
        } else if (action === "PAUSE") {
          const btn = document.querySelector('[data-testid="button-pause"]') as HTMLButtonElement;
          btn?.click();
        } else if (action === "RESET") {
          const btn = document.querySelector('[data-testid="button-reset"]') as HTMLButtonElement;
          btn?.click();
        }
      }
    };
    return () => channelRef.current?.close();
  }, []); // Only run once

  useEffect(() => {
    if (channelRef.current) {
      channelRef.current.postMessage({ type: "TICK", payload: timerData });
    }
  }, [timerData]);

  useEffect(() => { autoStartRef.current = config.autoStart; }, [config.autoStart]);
  useEffect(() => { document.documentElement.classList.add("dark"); }, []);
  useEffect(() => { localStorage.setItem(LS.focusGoal, focusGoal); }, [focusGoal]);
  useEffect(() => { localStorage.setItem(LS.config, JSON.stringify(config)); }, [config]);
  useEffect(() => { if (config.notificationsEnabled) requestNotificationPermission(); }, [config.notificationsEnabled]);

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

  const skipToNext = useCallback((current: TimerData, cfg: TimerConfig, completed: boolean) => {
    const isWork = current.currentSession === "work";
    const nextSessions = (isWork && completed) ? current.sessionsCompleted + 1 : current.sessionsCompleted;
    let nextSession: SessionType, nextDuration: number;

    if (isWork) {
      const isLong = nextSessions % cfg.sessionsUntilLongBreak === 0;
      nextSession = isLong ? "long-break" : "short-break";
      nextDuration = isLong ? cfg.longBreakDuration : cfg.shortBreakDuration;

      if (completed) {
        const durationMins = Math.floor(cfg.workDuration / 60);
        const startTimeStr = new Date(Date.now() - cfg.workDuration * 1000).toISOString();
        
        console.log(`[Sync] Attempting to save focus session: ${durationMins}m, started at ${startTimeStr}`);
        
        const record = {
          type: "work" as const,
          duration: cfg.workDuration,
          completed: true,
          startTime: startTimeStr,
        };

        createSession.mutate(record as any, {
          onError: (err) => {
            console.error("[Sync] Failed to save work session:", err);
            toast({ 
              title: "Cloud Sync Failed", 
              description: "Your session was saved locally but couldn't be synced to the cloud. Please check your connection.", 
              variant: "destructive" 
            });
          },
          onSuccess: (data) => {
            console.log("[Sync] Work session saved successfully:", data);
            toast({ 
              title: "Session Synced ✨", 
              description: `Successfully saved your ${durationMins}m focus session.`,
            });
          }
        });
        
        setCompletedCount(c => c + 1);

        setTodayData(prev => {
          const u = { sessions: prev.sessions + 1, mins: prev.mins + durationMins, date: todayStr() };
          localStorage.setItem(LS.today, JSON.stringify(u)); return u;
        });
        setTotalMins(prev => {
          const u = prev + durationMins;
          localStorage.setItem(LS.totalMins, String(u)); return u;
        });
        setStreak(prev => {
          const today = todayStr();
          const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
          let cur = prev.current;
          if (prev.lastDate === today) {}
          else if (prev.lastDate === yesterday) cur = prev.current + 1;
          else cur = 1;
          const u = { current: cur, best: Math.max(cur, prev.best), lastDate: today };
          localStorage.setItem(LS.streak, JSON.stringify(u)); return u;
        });

        if (cfg.soundEnabled) playBeep("work");
        if (cfg.notificationsEnabled) sendNotification("Focus session complete!", isLong ? "Time for a long break." : "Take a short break.");
        toast({ title: "Focus session complete", description: isLong ? "Next: Long break" : "Next: Short break" });
        setSessionCompleted({ type: "work", next: nextSession });
      }
    } else {
      nextSession = "work"; 
      nextDuration = cfg.workDuration;
      if (completed) {
        const startTimeStr = new Date(Date.now() - current.totalTime * 1000).toISOString();
        const record = {
          type: current.currentSession,
          duration: current.totalTime,
          completed: true,
          startTime: startTimeStr,
        };
        createSession.mutate(record as any, {
          onError: (err) => {
            console.error("[Sync] Failed to save break session:", err);
          },
          onSuccess: (data) => {
            console.log("[Sync] Break session saved successfully:", data);
          }
        });

        if (cfg.soundEnabled) playBeep("break");
        if (cfg.notificationsEnabled) sendNotification("Break over!", "Ready to focus again?");
        toast({ title: "Break complete", description: "Next: Focus session" });
        setSessionCompleted({ type: current.currentSession, next: "work" });
      }
    }

    const nextState = autoStartRef.current && completed ? "running" : "idle";
    if (nextState === "running") {
      sessionStartRef.current = nowTime();
      if (cfg.soundEnabled) {
        playClockSound("start");
        announce(nextSession === "work" ? "Focus session started" : "Break time started");
      }
    } else {
      sessionStartRef.current = "";
    }

    setTimerData({ timeRemaining: nextDuration, totalTime: nextDuration, currentSession: nextSession, sessionsCompleted: nextSessions, state: nextState });
  }, [createSession, toast]);

  useEffect(() => {
    if (timerData.state === "running") {
      if (!sessionStartRef.current) sessionStartRef.current = nowTime();
      
      // Calculate the absolute end time if it's not already set
      if (expectedEndTimeRef.current === null) {
        expectedEndTimeRef.current = Date.now() + (timerData.timeRemaining * 1000);
      }

      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((expectedEndTimeRef.current! - now) / 1000));
        
        setTimerData(prev => {
          if (remaining <= 0) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            expectedEndTimeRef.current = null;
            skipToNext(prev, config, true);
            return prev;
          }
          
          // Only update if the second has actually changed to prevent jitter
          if (remaining !== prev.timeRemaining) {
            return { ...prev, timeRemaining: remaining };
          }
          return prev;
        });
      }, 100); // 10Hz check for high precision
    } else {
      // Clear tracking refs when not running
      expectedEndTimeRef.current = null;
      if (timerData.state === "idle") sessionStartRef.current = "";
      if (intervalRef.current) { 
        clearInterval(intervalRef.current); 
        intervalRef.current = null; 
      }
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [timerData.state, timerData.currentSession, config, skipToNext]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        setTimerData(p => ({ ...p, state: p.state === "running" ? "paused" : "running" }));
      } else if (e.key === "r" || e.key === "R") {
        setTimerData(p => ({ ...p, timeRemaining: p.totalTime, state: "idle" }));
      } else if (e.key === "n" || e.key === "N") {
        skipToNext(timerDataRef.current, config, false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [config, skipToNext]);

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

  const handleStart = () => {
    setTimerData(p => ({ ...p, state: "running" }));
    if (config.soundEnabled) {
      playClockSound("start");
      announce(timerData.currentSession === "work" ? "Focus session started" : "Break time started");
    }
  };
  const handlePause = () => setTimerData(p => ({ ...p, state: "paused" }));
  const handleStop = () => setTimerData(p => ({ ...p, state: "idle", timeRemaining: p.totalTime }));
  const handleReset = () => setTimerData(p => ({ ...p, timeRemaining: p.totalTime, state: "idle" }));
  const handleSaveSettings = (c: TimerConfig) => {
    setConfig(c);
    if (timerData.state === "idle") {
      const dur = timerData.currentSession === "work" ? c.workDuration : timerData.currentSession === "short-break" ? c.shortBreakDuration : c.longBreakDuration;
      setTimerData(p => ({ ...p, timeRemaining: dur, totalTime: dur }));
    }
  };

  const closeCompletion = () => setSessionCompleted(null);

  const handleClearHistory = () => { /* API clear to be added */ };
  const cycle = Math.floor(timerData.sessionsCompleted / config.sessionsUntilLongBreak) + 1;
  const hasHistory = history.length > 0;

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: "#07070f" }}>
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: `
          radial-gradient(ellipse 55% 35% at 15% 85%, rgba(255,255,255,0.012) 0%, transparent 60%),
          radial-gradient(ellipse 45% 30% at 85% 15%, rgba(255,255,255,0.009) 0%, transparent 60%)
        `,
      }} />

      <header className="relative z-10 flex items-center justify-between px-6 py-3 animate-fade-in-down" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div>
          <h1 className="text-sm font-semibold tracking-[0.3em] uppercase" style={{ fontFamily: "'Rajdhani',sans-serif", color: "rgba(255,255,255,0.92)" }}>Focus Timer</h1>
          <p className="text-xs tracking-[0.22em] uppercase mt-0.5" style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 400, color: "rgba(255,255,255,0.4)" }}>Pomodoro</p>
        </div>
        <div className="flex items-center gap-2.5">
          <a href="/docs.html" target="_blank" rel="noreferrer" className="flex items-center justify-center w-9 h-9 rounded-full transition-all hover:bg-white/10" style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)" }} title="View Documentation">
            <Book className="w-4 h-4" />
          </a>
          <HBtn onClick={() => setShowAnalytics(true)} testId="button-analytics"><BarChart3 className="w-4 h-4" /></HBtn>
          <HBtn onClick={() => setShowSettings(true)} testId="button-settings-header"><Settings className="w-4 h-4" /></HBtn>
          <HBtn onClick={() => setShowSidebar(true)} testId="button-sidebar" highlighted><Flame className="w-4 h-4" /></HBtn>
          <button 
            onClick={() => {
              const w = 320;
              const h = 380;
              const left = (window.screen.width / 2) - (w / 2);
              const top = (window.screen.height / 2) - (h / 2);
              window.open("/mini", "PomoTimer", `width=${w},height=${h},left=${left},top=${top},resizable=no,scrollbars=no,status=no,location=no,toolbar=no,menubar=no`);
            }}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:bg-white/10"
            style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)" }}
            title="Open Mini Window"
          >
            <div className="w-4 h-4 border-2 border-current rounded-sm flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
            </div>
          </button>
          <button onClick={() => setShowProfile(true)} className="w-9 h-9 ml-2 rounded-full flex items-center justify-center transition-all hover:bg-white/10" style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)" }}>
            <UserIcon className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-between px-6 py-5 max-w-5xl mx-auto w-full gap-4">
        <div className="w-full flex flex-col items-center gap-4">
          <div className="flex gap-1 p-1 rounded-full animate-fade-in-down delay-100" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
            {SESSION_TABS.map(({ key, label }) => {
              const active = timerData.currentSession === key;
              return (
                <button key={key} onClick={() => switchSession(key)} data-testid={`button-session-${key}`}
                  className="px-4 py-2 rounded-full transition-all duration-200"
                  style={{
                    fontFamily: "'Rajdhani',sans-serif", fontWeight: 600, fontSize: "12px", letterSpacing: "0.12em",
                    color: active ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.45)",
                    background: active ? "rgba(255,255,255,0.12)" : "transparent",
                    border: active ? "1px solid rgba(255,255,255,0.2)" : "1px solid transparent",
                  }}>
                  {label.toUpperCase()}
                </button>
              );
            })}
          </div>

          <FocusGoal value={focusGoal} onChange={setFocusGoal} />
        </div>

        <div className="w-full grid place-items-center gap-4">
          <div className="animate-scale-in delay-200">
            <Timer timeRemaining={timerData.timeRemaining} totalTime={timerData.totalTime} currentSession={timerData.currentSession} state={timerData.state} />
          </div>
          <div className="w-full max-w-md transition-all duration-500" style={{ opacity: timerData.state === "running" ? 1 : 0.4 }}>
            <QuoteDisplay running={timerData.state === "running"} sessionIndex={completedCount} />
          </div>
        </div>

        <div className="w-full flex flex-col items-center gap-3">
          <div className="animate-fade-in-up delay-300">
            <ControlButtons state={timerData.state} onStart={handleStart} onPause={handlePause} onStop={handleStop} onReset={handleReset} onSettings={() => setShowSettings(true)} />
          </div>

          <SessionStats sessionsCompleted={timerData.sessionsCompleted} currentCycle={cycle} totalCycles={config.sessionsUntilLongBreak} timeSpentToday={todayData.mins} className="w-full max-w-3xl" />

          <div className="flex items-center justify-center gap-4 flex-wrap">
            {[["Space", "Play/Pause"], ["R", "Reset"], ["N", "Skip"]].map(([key, label]) => (
              <div key={key} className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 rounded text-xs" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "9px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}>{key}</kbd>
                <span style={{ fontSize: "10px", fontFamily: "'Space Grotesk',sans-serif", color: "rgba(255,255,255,0.28)" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {newBadge && (() => {
        const b = BADGE_MILESTONES.find(x => x.id === newBadge);
        if (!b) return null;
        return (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-badge-unlock" style={{ pointerEvents: "none" }}>
            <div className="px-6 py-3 rounded-full flex items-center gap-3" style={{ background: "rgba(8,8,18,0.97)", border: `1px solid ${b.glow}`, boxShadow: `0 0 24px ${b.glow}`, backdropFilter: "blur(20px)" }}>
              <div className="w-2 h-2 rounded-full" style={{ background: b.color }} />
              <span style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 600, fontSize: 13, letterSpacing: "0.14em", color: b.color }}>{b.name} UNLOCKED</span>
            </div>
          </div>
        );
      })()}

      <Sheet open={showSidebar} onOpenChange={setShowSidebar}>
        <SheetContent side="right" className="w-full sm:w-[400px] flex flex-col overflow-hidden border-none p-0" style={{ background: "rgba(5,5,14,0.92)", backdropFilter: "blur(48px)", WebkitBackdropFilter: "blur(48px)", borderLeft: "1px solid rgba(255,255,255,0.1)", boxShadow: "-24px 0 64px rgba(0,0,0,0.7)" }}>
          <SheetTitle className="sr-only">Progress — Streaks & Achievements</SheetTitle>
          <SheetDescription className="sr-only">View your focus streaks, achievement badges, and session history.</SheetDescription>
          <div className="px-6 pt-8 pb-5 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <h2 className="text-sm font-semibold tracking-[0.3em] uppercase" style={{ fontFamily: "'Rajdhani',sans-serif", color: "rgba(255,255,255,0.92)" }}>Progress</h2>
            <p className="text-xs tracking-[0.18em] uppercase mt-1" style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 400, color: "rgba(255,255,255,0.45)" }}>Streaks & Achievements</p>
            <div className="flex gap-1 mt-4 p-1 rounded-full" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}>
              <SidebarTab active={sidebarTab === "progress"} onClick={() => setSidebarTab("progress")}>Progress</SidebarTab>
              <SidebarTab active={sidebarTab === "history"} onClick={() => setSidebarTab("history")}>History{hasHistory && <span className="ml-1 px-1.5 py-0.5 rounded-full" style={{ fontSize: "9px", background: "rgba(255,255,255,0.14)", color: "rgba(255,255,255,0.75)" }}>{history.filter((r: any) => r.type === "work").length}</span>}</SidebarTab>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-7 no-scrollbar">
            {sidebarTab === "progress" && (
              <>
                <div className="space-y-3">
                  <SLabel>All-Time Focus</SLabel>
                  <div className="text-center py-6 rounded-2xl" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <div className="text-4xl font-light" style={{ fontFamily: "'JetBrains Mono',monospace", color: "rgba(255,255,255,0.96)" }}>{totalMins >= 60 ? `${Math.floor(totalMins / 60)}h ${totalMins % 60}m` : `${totalMins}m`}</div>
                    <div className="text-xs font-semibold tracking-[0.22em] uppercase mt-2" style={{ fontFamily: "'Rajdhani',sans-serif", color: "rgba(255,255,255,0.5)" }}>Total Focused</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <SLabel>Streak</SLabel>
                  <StreakCounter currentStreak={streak.current} longestStreak={streak.best} todaySessions={todayData.sessions} dailyGoal={8} />
                </div>

                <div className="space-y-3">
                  <SLabel>Activity — Last 7 Weeks</SLabel>
                  <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <WeeklyHeatmap history={history} />
                  </div>
                </div>

                <div className="space-y-3">
                  <SLabel>Achievement Badges</SLabel>
                  <p className="text-xs leading-relaxed" style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 400, color: "rgba(255,255,255,0.45)" }}>Tap an unlocked badge to view and download it.</p>
                  <Badges totalMinutes={totalMins} earnedBadgeIds={earnedBadges} newlyUnlocked={newBadge} />
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

      <Sheet open={showAnalytics} onOpenChange={setShowAnalytics}>
        <SheetContent side="right" className="w-full sm:w-[420px] flex flex-col overflow-hidden border-none p-0" style={{ background: "rgba(5,5,14,0.94)", backdropFilter: "blur(48px)", WebkitBackdropFilter: "blur(48px)", borderLeft: "1px solid rgba(255,255,255,0.1)", boxShadow: "-24px 0 64px rgba(0,0,0,0.7)" }}>
          <SheetTitle className="sr-only">Analytics — Productivity Overview</SheetTitle>
          <SheetDescription className="sr-only">Focus session analytics and productivity trends.</SheetDescription>
          <div className="px-6 pt-8 pb-5 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <h2 className="text-sm font-semibold tracking-[0.3em] uppercase" style={{ fontFamily: "'Rajdhani',sans-serif", color: "rgba(255,255,255,0.92)" }}>Analytics</h2>
            <p className="text-xs tracking-[0.18em] uppercase mt-1" style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 400, color: "rgba(255,255,255,0.45)" }}>Productivity Overview</p>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-6 no-scrollbar"><Analytics /></div>
        </SheetContent>
      </Sheet>

      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.82)", backdropFilter: "blur(14px)" }} onClick={(e) => { if (e.target === e.currentTarget) setShowSettings(false); }}>
          <div className="animate-scale-in"><SettingsPanel config={config} onSave={handleSaveSettings} onClose={() => setShowSettings(false)} /></div>
        </div>
      )}

      {showProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.82)", backdropFilter: "blur(14px)" }} onClick={(e) => { if (e.target === e.currentTarget) setShowProfile(false); }}>
          <div className="animate-scale-in w-full max-w-sm flex items-center justify-center"><ProfilePanel onClose={() => setShowProfile(false)} /></div>
        </div>
      )}

      {sessionCompleted && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }}>
          <div className="animate-scale-in w-full max-w-sm p-8 rounded-3xl text-center space-y-6" style={{ background: "rgba(12,12,24,0.95)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 24px 64px rgba(0,0,0,0.6)" }}>
            <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-2" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div className="w-10 h-10 rounded-full animate-pulse" style={{ background: sessionCompleted.type === "work" ? "rgba(255,255,255,0.8)" : "rgba(100,210,170,0.8)" }} />
            </div>
            <div>
              <h3 className="text-xl font-semibold tracking-tight" style={{ fontFamily: "'Space Grotesk',sans-serif", color: "rgba(255,255,255,0.95)" }}>
                {sessionCompleted.type === "work" ? "Focus Session Complete" : "Break Session Complete"}
              </h3>
              <p className="text-sm mt-2 font-medium" style={{ fontFamily: "'Rajdhani',sans-serif", letterSpacing: "0.1em", color: "rgba(255,255,255,0.5)" }}>
                NEXT: {sessionCompleted.next === "work" ? "FOCUS SESSION" : sessionCompleted.next === "short-break" ? "SHORT BREAK" : "LONG BREAK"}
              </p>
            </div>
            <button onClick={closeCompletion} className="w-full py-4 rounded-2xl font-semibold transition-all active:scale-95 hover:brightness-110" style={{ background: "rgba(255,255,255,0.95)", color: "#050508", fontFamily: "'Space Grotesk',sans-serif" }}>
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
