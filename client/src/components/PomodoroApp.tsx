import { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
import { SessionType, TimerConfig, TimerData, PomodoroSession, TimerState } from "@shared/schema";
import { startOfDay, subDays, format, isSameDay } from "date-fns";

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

function todayStr() { 
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function nowTime() { const d = new Date(); return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; }

function loadStreak() {
  try { const r = localStorage.getItem(LS.streak); if (r) return JSON.parse(r); } catch { }
  return { current: 0, best: 0, lastDate: "" };
}
function loadToday() {
  return { sessions: 0, mins: 0, date: todayStr() };
}
function loadTotalMins() { return 0; }
function loadBadges(): string[] {
  return [];
}
function loadConfig(): TimerConfig {
  try {
    const r = localStorage.getItem(LS.config);
    if (r) return { ...DEFAULT_CONFIG, ...JSON.parse(r) };
  } catch { }
  return DEFAULT_CONFIG;
}

function deriveStreak(history: PomodoroSession[]) {
  const workSessions = history.filter(s => s.type === "work");
  if (workSessions.length === 0) return { current: 0, best: 0, lastDate: "" };

  const dates = Array.from(new Set(workSessions.map(s => startOfDay(new Date(s.startTime)).getTime()))).sort((a, b) => b - a);
  const today = startOfDay(new Date()).getTime();
  const yesterday = subDays(new Date(), 1).getTime();

  let current = 0;
  let best = 0;
  let temp = 0;

  // Calculate current streak
  if (dates[0] === today || dates[0] === yesterday) {
    let checkDate = dates[0];
    for (let i = 0; i < dates.length; i++) {
      if (dates[i] === checkDate) {
        current++;
        checkDate = subDays(new Date(checkDate), 1).getTime();
      } else break;
    }
  }

  // Calculate best streak
  const sortedAsc = [...dates].sort((a, b) => a - b);
  if (sortedAsc.length > 0) {
    temp = 1;
    best = 1;
    for (let i = 1; i < sortedAsc.length; i++) {
      if (sortedAsc[i] === startOfDay(subDays(new Date(sortedAsc[i-1]), -1)).getTime()) {
        temp++;
      } else {
        best = Math.max(best, temp);
        temp = 1;
      }
    }
    best = Math.max(best, temp);
  }

  return { current, best, lastDate: dates[0] ? new Date(dates[0]).toISOString().slice(0, 10) : "" };
}

function playBeep(type: "work" | "break") {
  try {
    const ctx = getAudioCtx();
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
  } catch (_) { }
}

function sendNotification(title: string, body: string) {
  try {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body, icon: "/favicon.ico" });
    }
  } catch (_) { }
}

async function requestNotificationPermission() {
  try {
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
  } catch (_) { }
}

function announce(text: string) {
  try {
    const msg = new SpeechSynthesisUtterance(text);
    msg.rate = 0.9;
    msg.pitch = 1.1;
    msg.volume = 0.8;
    window.speechSynthesis.speak(msg);
  } catch (_) { }
}

function playClockSound(type: "start" | "tick") {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "start") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.8);
    } else {
      osc.type = "square";
      osc.frequency.setValueAtTime(100, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);
    }
  } catch (_) { }
}

const SESSION_TABS: { key: SessionType; label: string }[] = [
  { key: "work", label: "Focus" },
  { key: "short-break", label: "Short Break" },
  { key: "long-break", label: "Long Break" },
];

// Persistent Audio Context for robustness
let sharedAudioCtx: AudioContext | null = null;
function getAudioCtx() {
  if (!sharedAudioCtx) {
    sharedAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (sharedAudioCtx.state === "suspended") {
    sharedAudioCtx.resume();
  }
  return sharedAudioCtx;
}

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
  const [earnedBadges, setEarnedBadges] = useState<string[]>(() => loadBadges());
  const [newBadge, setNewBadge] = useState<string | null>(null);
  const [focusGoal, setFocusGoal] = useState(() => localStorage.getItem(LS.focusGoal) || "");
  const { sessions: historyRaw = [], createSession, updateSession, clearSessions } = useSessions();

  // DERIVED DATA: Calculate from actual session history
  const history = historyRaw;
  const streak = useMemo(() => deriveStreak(historyRaw), [historyRaw]);

  const todayStats = useMemo(() => {
    const today = todayStr();
    const todaySessions = historyRaw.filter((r: any) => {
      const d = new Date(r.startTime);
      const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const isFocus = r.type === "work" || r.type === "focus";
      return isFocus && ds === today;
    });
    return {
      sessions: todaySessions.length,
      mins: todaySessions.reduce((acc: number, r: any) => acc + Math.floor(r.duration / 60), 0)
    };
  }, [historyRaw]);

  const displayTotalSessions = useMemo(() => {
    return historyRaw.filter((r: any) => r.type === "work" || r.type === "focus").length;
  }, [historyRaw]);

  const displayTotalMins = useMemo(() => {
    return historyRaw
      .filter((r: any) => r.type === "work" || r.type === "focus")
      .reduce((acc: number, r: any) => acc + Math.floor(r.duration / 60), 0);
  }, [historyRaw]);

  const handleClearHistory = () => {
    if (window.confirm("Delete all session records and reset progress?")) {
      clearSessions.mutate(undefined, {
        onSuccess: () => {
          localStorage.removeItem(LS.today);
          localStorage.removeItem(LS.totalMins);
          localStorage.removeItem(LS.streak);
          toast({ title: "History cleared", description: "All sessions and progress have been reset." });
        }
      });
    }
  };
  const { logoutMutation, user } = useAuth();
  const [completedCount, setCompletedCount] = useState(0);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const currentSessionDurationRef = useRef(0);
  const lastDateRef = useRef(todayStr());
  const syncTimerRef = useRef(0);

  const [timerData, setTimerData] = useState<TimerData>(() => {
    const cfg = loadConfig();
    return { timeRemaining: cfg.workDuration, totalTime: cfg.workDuration, currentSession: "work", sessionsCompleted: 0, state: "idle" };
  });

  const [sessionCompleted, setSessionCompleted] = useState<{ type: SessionType, next: SessionType } | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const expectedEndTimeRef = useRef<number | null>(null);
  const timerDataRef = useRef(timerData);
  useEffect(() => { timerDataRef.current = timerData; }, [timerData]);

  const sessionStartRef = useRef<string>("");
  const sessionTrueStartRef = useRef<string>("");
  const transitioningRef = useRef(false);
  const autoStartRef = useRef(config.autoStart);
  const channelRef = useRef<BroadcastChannel | null>(null);

  const handleStart = useCallback(() => {
    if (!sessionTrueStartRef.current) sessionTrueStartRef.current = new Date().toISOString();
    lastDateRef.current = todayStr(); // Fresh date on start
    setTimerData(p => ({ ...p, state: "running" }));
    if (config.soundEnabled) {
      playClockSound("start");
      announce(timerData.currentSession === "work" ? "Focus session started" : "Break time started");
    }
  }, [config.soundEnabled, timerData.currentSession]);

  const handlePause = useCallback(() => setTimerData(p => ({ ...p, state: "paused" })), []);
  const handleReset = useCallback(() => {
    sessionTrueStartRef.current = "";
    setCurrentSessionId(null);
    currentSessionDurationRef.current = 0;
    syncTimerRef.current = 0;
    setTimerData(p => ({ ...p, timeRemaining: p.totalTime, state: "idle" }));
  }, []);

  const handlersRef = useRef({ start: handleStart, pause: handlePause, reset: handleReset });
  useEffect(() => {
    handlersRef.current = { start: handleStart, pause: handlePause, reset: handleReset };
  }, [handleStart, handlePause, handleReset]);

  useEffect(() => {
    channelRef.current = new BroadcastChannel("pomodoro_sync");
    channelRef.current.onmessage = (event) => {
      if (event.data.type === "REQUEST_STATE") {
        channelRef.current?.postMessage({ type: "STATE_UPDATE", payload: timerDataRef.current });
      } else if (event.data.type === "COMMAND") {
        const { action } = event.data;
        if (action === "START") handlersRef.current.start();
        else if (action === "PAUSE") handlersRef.current.pause();
        else if (action === "RESET") handlersRef.current.reset();
      }
    };
    return () => channelRef.current?.close();
  }, []);

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

  // Audio Context unlock on first interaction
  useEffect(() => {
    const unlock = () => { getAudioCtx(); window.removeEventListener("mousedown", unlock); };
    window.addEventListener("mousedown", unlock);
    return () => window.removeEventListener("mousedown", unlock);
  }, []);

  useEffect(() => {
    const newlyEarned = BADGE_MILESTONES.filter(b => displayTotalMins >= b.minutesRequired && !earnedBadges.includes(b.id));
    if (newlyEarned.length > 0) {
      const updated = [...earnedBadges, ...newlyEarned.map(b => b.id)];
      setEarnedBadges(updated);
      localStorage.setItem(LS.badges, JSON.stringify(updated));
      const latest = newlyEarned[newlyEarned.length - 1];
      setNewBadge(latest.id);
      toast({ title: `Badge Unlocked — ${latest.name}`, description: latest.subtitle });
      setTimeout(() => setNewBadge(null), 4000);
    }
  }, [displayTotalMins]);

  const syncCurrentSession = useCallback(async (type: SessionType, isCompleted = false) => {
    const duration = currentSessionDurationRef.current;
    if (duration <= 0 && !isCompleted) return;

    try {
      if (currentSessionId) {
        await updateSession.mutateAsync({
          id: currentSessionId,
          updates: { duration, completed: isCompleted, endTime: new Date().toISOString() }
        });
      } else {
        const startTime = sessionTrueStartRef.current || new Date(Date.now() - duration * 1000).toISOString();
        const res = await createSession.mutateAsync({
          type,
          duration,
          completed: isCompleted,
          startTime: startTime,
        } as any);
        setCurrentSessionId(res.id);
      }
      syncTimerRef.current = 0;
    } catch (err) {
      console.error("[Sync] Real-time sync failed:", err);
    }
  }, [currentSessionId, createSession, updateSession]);

  const handleMidnightSplit = useCallback(async (type: SessionType) => {
    const today = todayStr();
    if (lastDateRef.current === today) return; // Already split
    
    console.log("[Midnight] Date changed, splitting session...");
    const oldId = currentSessionId;
    const oldDuration = currentSessionDurationRef.current;
    
    // Mark as split immediately
    lastDateRef.current = today;
    
    // 1. Sync current accumulation to the old session and mark it as completed for that day
    if (oldId) {
      try {
        await updateSession.mutateAsync({
          id: oldId,
          updates: { duration: oldDuration, completed: true, endTime: new Date().toISOString() }
        });
      } catch (err) {
        console.error("[Midnight] Failed to sync old session:", err);
      }
    }
    
    // 2. Reset for new day
    setCurrentSessionId(null);
    currentSessionDurationRef.current = 0;
    syncTimerRef.current = 0;
    sessionTrueStartRef.current = new Date().toISOString(); 
  }, [currentSessionId, updateSession]);

  const skipToNext = useCallback((current: TimerData, cfg: TimerConfig, completed: boolean) => {
    if (transitioningRef.current) return;
    transitioningRef.current = true;

    const isWork = current.currentSession === "work";
    const nextSessions = (isWork && completed) ? current.sessionsCompleted + 1 : current.sessionsCompleted;
    let nextSession: SessionType, nextDuration: number;

    if (isWork) {
      const isLong = nextSessions % cfg.sessionsUntilLongBreak === 0;
      nextSession = isLong ? "long-break" : "short-break";
      nextDuration = isLong ? cfg.longBreakDuration : cfg.shortBreakDuration;

      if (completed) {
        const durationMins = Math.floor(cfg.workDuration / 60);
        
        // Sync final state of the session
        syncCurrentSession("work", true);

        setCompletedCount(c => c + 1);

        if (cfg.soundEnabled) playBeep("work");
        if (cfg.notificationsEnabled) sendNotification("Focus session complete!", isLong ? "Time for a long break." : "Take a short break.");
        toast({ title: "Focus session complete", description: isLong ? "Next: Long break" : "Next: Short break" });
        setSessionCompleted({ type: "work", next: nextSession });
      }
    } else {
      nextSession = "work";
      nextDuration = cfg.workDuration;
      if (completed) {
        // Sync final state of the break
        syncCurrentSession(current.currentSession, true);

        if (cfg.soundEnabled) playBeep("break");
        if (cfg.notificationsEnabled) sendNotification("Break over!", "Ready to focus again?");
        toast({ title: "Break complete", description: "Next: Focus session" });
        setSessionCompleted({ type: current.currentSession, next: "work" });
      }
    }

    // Reset real-time tracking for the next session
    setCurrentSessionId(null);
    currentSessionDurationRef.current = 0;
    syncTimerRef.current = 0;
    lastDateRef.current = todayStr();

    const nextState = (autoStartRef.current && completed ? "running" : "idle") as TimerState;
    if (nextState === "running") {
      sessionStartRef.current = nowTime();
      sessionTrueStartRef.current = new Date().toISOString();
      if (cfg.soundEnabled) {
        playClockSound("start");
        announce(nextSession === "work" ? "Focus session started" : "Break time started");
      }
    } else {
      sessionStartRef.current = "";
      sessionTrueStartRef.current = "";
    }

    const payload = { timeRemaining: nextDuration, totalTime: nextDuration, currentSession: nextSession, sessionsCompleted: nextSessions, state: nextState };
    setTimerData(payload);

    // Broadcast the major state change immediately to prevent sync lag
    if (channelRef.current) {
      channelRef.current.postMessage({ type: "STATE_UPDATE", payload: { ...payload, skipAudio: true } });
    }

    // Guard reset
    setTimeout(() => { transitioningRef.current = false; }, 800);
  }, [createSession, toast]);

  useEffect(() => {
    if (timerData.state === "running") {
      if (!sessionStartRef.current) sessionStartRef.current = nowTime();

      // Calculate the absolute end time if it's not already set
      if (expectedEndTimeRef.current === null) {
        expectedEndTimeRef.current = Date.now() + (timerData.timeRemaining * 1000);
      }

      const timerId = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((expectedEndTimeRef.current! - now) / 1000));

        // Real-time tracking logic
        const prevRemaining = timerDataRef.current.timeRemaining;
        if (remaining !== prevRemaining) {
          const elapsed = Math.max(0, prevRemaining - remaining);
          if (elapsed > 0) {
            currentSessionDurationRef.current += elapsed;
            syncTimerRef.current += elapsed;

            // Check for midnight split
            const today = todayStr();
            if (lastDateRef.current !== today) {
              handleMidnightSplit(timerDataRef.current.currentSession);
            }

            // Periodic sync (every 30 seconds)
            if (syncTimerRef.current >= 30) {
              syncCurrentSession(timerDataRef.current.currentSession);
            }
          }
        }

        if (remaining <= 0) {
          clearInterval(timerId);
          expectedEndTimeRef.current = null;
          skipToNext(timerDataRef.current, config, true);
          return;
        }

        setTimerData(prev => {
          if (remaining !== prev.timeRemaining) {
            return { ...prev, timeRemaining: remaining };
          }
          return prev;
        });
      }, 100);
      intervalRef.current = timerId;
      return () => clearInterval(timerId);
    } else {
      // Clear tracking refs when not running
      expectedEndTimeRef.current = null;
      if (timerData.state === "idle") sessionStartRef.current = "";
    }
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
    sessionTrueStartRef.current = "";
    const dur = session === "work" ? config.workDuration : session === "short-break" ? config.shortBreakDuration : config.longBreakDuration;
    setTimerData(prev => ({ ...prev, currentSession: session, timeRemaining: dur, totalTime: dur, state: "idle" }));
  };

  const handleStop = () => {
    sessionTrueStartRef.current = "";
    setCurrentSessionId(null);
    currentSessionDurationRef.current = 0;
    syncTimerRef.current = 0;
    setTimerData(p => ({ ...p, state: "idle", timeRemaining: p.totalTime }));
  };
  const handleSaveSettings = (c: TimerConfig) => {
    setConfig(c);
    if (timerData.state === "idle") {
      const dur = timerData.currentSession === "work" ? c.workDuration : timerData.currentSession === "short-break" ? c.shortBreakDuration : c.longBreakDuration;
      setTimerData(p => ({ ...p, timeRemaining: dur, totalTime: dur }));
    }
  };

  const closeCompletion = () => setSessionCompleted(null);

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

          <SessionStats sessionsCompleted={todayStats.sessions} currentCycle={cycle} totalCycles={config.sessionsUntilLongBreak} timeSpentToday={todayStats.mins} className="w-full max-w-3xl" />

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
                    <div className="text-4xl font-light" style={{ fontFamily: "'JetBrains Mono',monospace", color: "rgba(255,255,255,0.96)" }}>
                      {displayTotalMins >= 60 ? `${Math.floor(displayTotalMins / 60)}h ${displayTotalMins % 60}m` : `${displayTotalMins} min`}
                    </div>
                    <div className="text-xs font-semibold tracking-[0.22em] uppercase mt-2" style={{ fontFamily: "'Rajdhani',sans-serif", color: "rgba(255,255,255,0.5)" }}>Total Focused</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <SLabel>Streak</SLabel>
                  <StreakCounter currentStreak={streak.current} longestStreak={streak.best} todaySessions={todayStats.sessions} dailyGoal={8} />
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
                  <Badges totalMinutes={displayTotalMins} earnedBadgeIds={earnedBadges} newlyUnlocked={newBadge} />
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
