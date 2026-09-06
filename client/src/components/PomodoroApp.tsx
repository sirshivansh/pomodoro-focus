import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { BarChart3, Settings, Flame, User as UserIcon, Book, Monitor, CheckCircle2, Target, Sparkles, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Timer from "./Timer";
import ControlButtons from "./ControlButtons";
import SessionStats from "./SessionStats";
import DailyProgress from "./DailyProgress";
import Analytics from "./Analytics";
import SettingsPanel from "./SettingsPanel";
import ProfilePanel from "./ProfilePanel";
import StreakCounter from "./StreakCounter";
import Badges, { BADGE_MILESTONES } from "./Badges";
import HistoryList from "./HistoryList";
import SplineBackground from "./SplineBackground";
import SplineControls from "./SplineControls";
import TaskDurationPresets from "./TaskDurationPresets";
import { useSessions } from "@/hooks/use-sessions";
import { useAuth } from "@/hooks/use-auth";
import WeeklyHeatmap from "./WeeklyHeatmap";
import { SessionType, TimerConfig, TimerData, PomodoroSession, TimerState } from "@shared/schema";
import { startOfDay, subDays } from "date-fns";

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

function saveConfig(cfg: TimerConfig) {
  try {
    localStorage.setItem(LS.config, JSON.stringify(cfg));
  } catch { }
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

  if (dates[0] === today || dates[0] === yesterday) {
    let checkDate = dates[0];
    for (let i = 0; i < dates.length; i++) {
      if (dates[i] === checkDate) {
        current++;
        checkDate = subDays(new Date(checkDate), 1).getTime();
      } else break;
    }
  }

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

function NavIconButton({ onClick, active, tooltip, children, testId }: { onClick: () => void; active?: boolean; tooltip: string; children: React.ReactNode; testId?: string }) {
  return (
    <button
      onClick={onClick}
      data-testid={testId}
      title={tooltip}
      className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 group relative active:scale-95"
      style={{
        background: active ? "rgba(245,166,35,0.15)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${active ? "rgba(245,166,35,0.4)" : "rgba(255,255,255,0.08)"}`,
        color: active ? "#f5a623" : "rgba(255,255,255,0.55)",
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

  const [splineEnabled, setSplineEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("ft_spline_enabled");
      return saved !== "false";
    } catch {
      return true;
    }
  });

  const [splineOpacity, setSplineOpacity] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("ft_spline_opacity");
      return saved ? Number(saved) : 85;
    } catch {
      return 85;
    }
  });

  const [splineMode, setSplineMode] = useState<"gpu-grid" | "spline-3d">(() => {
    try {
      const saved = localStorage.getItem("ft_spline_mode");
      return (saved === "gpu-grid" ? "gpu-grid" : "spline-3d") as any;
    } catch {
      return "spline-3d";
    }
  });

  const handleToggleSpline = (enabled: boolean) => {
    setSplineEnabled(enabled);
    try {
      localStorage.setItem("ft_spline_enabled", String(enabled));
    } catch {}
  };

  const handleChangeSplineOpacity = (opacity: number) => {
    setSplineOpacity(opacity);
    try {
      localStorage.setItem("ft_spline_opacity", String(opacity));
    } catch {}
  };

  const handleChangeSplineMode = (mode: "gpu-grid" | "spline-3d") => {
    setSplineMode(mode);
    try {
      localStorage.setItem("ft_spline_mode", mode);
    } catch {}
  };

  const [activeTaskTag, setActiveTaskTag] = useState<string>(() => {
    try {
      return localStorage.getItem("ft_active_task_tag") || "#coding";
    } catch {
      return "#coding";
    }
  });

  const handleSelectTag = (tag: string) => {
    setActiveTaskTag(tag);
    try {
      localStorage.setItem("ft_active_task_tag", tag);
    } catch {}
  };

  const handleSelectWorkDuration = (mins: number) => {
    const seconds = mins * 60;
    const updatedConfig = { ...config, workDuration: seconds };
    setConfig(updatedConfig);
    saveConfig(updatedConfig);

    if (timerData.currentSession === "work") {
      setTimerData((prev) => ({
        ...prev,
        timeRemaining: prev.state === "idle" ? seconds : prev.timeRemaining,
        totalTime: seconds,
      }));
    }
  };

  const [config, setConfig] = useState<TimerConfig>(() => loadConfig());
  const [earnedBadges, setEarnedBadges] = useState<string[]>(() => loadBadges());
  const [newBadge, setNewBadge] = useState<string | null>(null);
  const { sessions: historyRaw = [], createSession, updateSession, clearSessions } = useSessions();
  const { user } = useAuth();

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

  const weeklyStats = useMemo(() => {
    const sevenDaysAgo = subDays(new Date(), 7).getTime();
    const workSessions = historyRaw.filter((r: any) => {
      const isFocus = r.type === "work" || r.type === "focus";
      const sessionTime = new Date(r.startTime).getTime();
      return isFocus && sessionTime >= sevenDaysAgo;
    });
    return {
      pomodoros: workSessions.length,
      mins: workSessions.reduce((acc: number, r: any) => acc + Math.floor(r.duration / 60), 0)
    };
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
    lastDateRef.current = todayStr();
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
  useEffect(() => { localStorage.setItem(LS.config, JSON.stringify(config)); }, [config]);
  useEffect(() => { if (config.notificationsEnabled) requestNotificationPermission(); }, [config.notificationsEnabled]);

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
          taskTag: type === "work" ? activeTaskTag : undefined,
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
  }, [currentSessionId, createSession, updateSession, activeTaskTag]);

  const handleMidnightSplit = useCallback(async (type: SessionType) => {
    const today = todayStr();
    if (lastDateRef.current === today) return;
    
    const oldId = currentSessionId;
    const oldDuration = currentSessionDurationRef.current;
    
    lastDateRef.current = today;
    
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
        syncCurrentSession(current.currentSession, true);
        if (cfg.soundEnabled) playBeep("break");
        if (cfg.notificationsEnabled) sendNotification("Break over!", "Ready to focus again?");
        toast({ title: "Break complete", description: "Next: Focus session" });
        setSessionCompleted({ type: current.currentSession, next: "work" });
      }
    }

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

    if (channelRef.current) {
      channelRef.current.postMessage({ type: "STATE_UPDATE", payload: { ...payload, skipAudio: true } });
    }

    setTimeout(() => { transitioningRef.current = false; }, 800);
  }, [createSession, toast]);

  useEffect(() => {
    if (timerData.state === "running") {
      if (!sessionStartRef.current) sessionStartRef.current = nowTime();

      if (expectedEndTimeRef.current === null) {
        expectedEndTimeRef.current = Date.now() + (timerData.timeRemaining * 1000);
      }

      const timerId = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((expectedEndTimeRef.current! - now) / 1000));

        const prevRemaining = timerDataRef.current.timeRemaining;
        if (remaining !== prevRemaining) {
          const elapsed = Math.max(0, prevRemaining - remaining);
          if (elapsed > 0) {
            currentSessionDurationRef.current += elapsed;
            syncTimerRef.current += elapsed;

            const today = todayStr();
            if (lastDateRef.current !== today) {
              handleMidnightSplit(timerDataRef.current.currentSession);
            }

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
  const hasHistory = history.length > 0;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#07070f] text-white relative">
      {/* 3D Ambient Backlight Background */}
      <SplineBackground enabled={splineEnabled} opacity={splineOpacity} mode={splineMode} />

      {/* Subtle Background Glow */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: `
          radial-gradient(ellipse 50% 40% at 50% 40%, rgba(245, 166, 35, 0.03) 0%, transparent 70%),
          radial-gradient(ellipse 60% 50% at 20% 80%, rgba(15, 16, 26, 0.8) 0%, transparent 100%)
        `,
      }} />

      {/* LEFT ICON SIDEBAR */}
      <aside className={`w-16 md:w-20 bg-[#0c0d14]/90 backdrop-blur-xl border-r border-[#1e1f2b] flex flex-col items-center py-6 gap-6 z-20 flex-shrink-0 select-none transition-all duration-700 ease-in-out ${
        timerData.state === "running" ? "-translate-x-full opacity-0 pointer-events-none" : "translate-x-0 opacity-100"
      }`}>
        {/* Brand / Logo */}
        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(245,166,35,0.2)]">
          <Flame className="w-5 h-5 text-amber-500 fill-amber-500/20" />
        </div>

        <div className="w-8 h-[1px] bg-[#1e1f2b] my-1" />

        {/* Navigation Items */}
        <div className="flex flex-col items-center gap-4 flex-1">
          <NavIconButton onClick={() => setShowSidebar(true)} active={showSidebar} tooltip="Streaks & Progress" testId="button-sidebar">
            <Flame className="w-5 h-5" />
          </NavIconButton>

          <NavIconButton onClick={() => setShowAnalytics(true)} active={showAnalytics} tooltip="Analytics & History" testId="button-analytics">
            <BarChart3 className="w-5 h-5" />
          </NavIconButton>

          <NavIconButton onClick={() => setShowSettings(true)} active={showSettings} tooltip="Timer Settings" testId="button-settings-header">
            <Settings className="w-5 h-5" />
          </NavIconButton>

          {/* 3D Spline Backlight Controls Button */}
          <SplineControls
            enabled={splineEnabled}
            onToggleEnabled={handleToggleSpline}
            opacity={splineOpacity}
            onChangeOpacity={handleChangeSplineOpacity}
            mode={splineMode}
            onChangeMode={handleChangeSplineMode}
          />

          <NavIconButton 
            onClick={() => {
              const w = 320;
              const h = 380;
              const left = (window.screen.width / 2) - (w / 2);
              const top = (window.screen.height / 2) - (h / 2);
              window.open("/mini", "PomoTimer", `width=${w},height=${h},left=${left},top=${top},resizable=no,scrollbars=no,status=no,location=no,toolbar=no,menubar=no`);
            }}
            tooltip="Open Mini Window"
          >
            <Monitor className="w-5 h-5" />
          </NavIconButton>

          <a href="/docs.html" target="_blank" rel="noreferrer" className="w-11 h-11 rounded-2xl flex items-center justify-center text-white/50 bg-white/[0.04] border border-white/[0.08] hover:text-white transition-all">
            <Book className="w-5 h-5" />
          </a>
        </div>

        {/* Bottom Profile Button */}
        <NavIconButton onClick={() => setShowProfile(true)} active={showProfile} tooltip={user ? user.email : "Account"}>
          <UserIcon className="w-5 h-5" />
        </NavIconButton>
      </aside>

      {/* MAIN DASHBOARD CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-y-auto no-scrollbar px-4 md:px-8 py-3 md:py-5 gap-3 md:gap-5 relative z-10 max-w-7xl mx-auto w-full justify-between transition-all duration-700">
        {/* TOP BAR / DASHBOARD HEADER */}
        <header className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all duration-700 ease-in-out ${
          timerData.state === "running"
            ? "opacity-0 -translate-y-8 max-h-0 py-0 border-none pointer-events-none overflow-hidden"
            : "opacity-100 translate-y-0 max-h-40 pb-3 border-b border-[#1e1f2b]/80"
        }`}>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                {timerData.currentSession === "work" ? "FOCUS MODE" : timerData.currentSession === "short-break" ? "SHORT BREAK" : "LONG BREAK"}
              </span>
              {timerData.state === "running" && (
                <span className="flex items-center gap-1.5 text-xs text-amber-400 font-medium animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-amber-400" /> Live
                </span>
              )}
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white/95 mt-1 font-sans">
              Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""}
            </h1>
          </div>

          {/* Quick Header Widget Cards */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* TODAY'S GOAL WIDGET CARD */}
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#0f1019]/80 backdrop-blur-md border border-[#1e1f2b]/80 shadow-lg">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Today's Goal</div>
                <div className="text-xs font-semibold text-white/90">
                  {todayStats.sessions} / 8 <span className="text-white/40 font-normal">Pomodoros</span>
                </div>
              </div>
            </div>

            {/* CURRENT SESSION WIDGET CARD */}
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#0f1019]/80 backdrop-blur-md border border-[#1e1f2b]/80 shadow-lg">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Current Session</div>
                <div className="text-xs font-semibold text-white/90">
                  #{ (timerData.sessionsCompleted % config.sessionsUntilLongBreak) + 1 } of {config.sessionsUntilLongBreak}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* CENTER MAIN CONTENT: TIMER & CONTROLS */}
        <section className="flex-1 flex flex-col items-center justify-center gap-2.5 sm:gap-3 py-1">
          {/* SESSION MODE TAB SWITCHER & TASK/DURATION BAR (SMOOTH FADE OUT WHEN RUNNING) */}
          <div className={`flex flex-col items-center gap-2.5 sm:gap-3 transition-all duration-700 ease-in-out ${
            timerData.state === "running"
              ? "opacity-0 -translate-y-4 max-h-0 pointer-events-none overflow-hidden"
              : "opacity-100 translate-y-0 max-h-40"
          }`}>
            <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-[#0c0d14]/80 backdrop-blur-md border border-[#1e1f2b]/80 shadow-lg">
              {SESSION_TABS.map(({ key, label }) => {
                const active = timerData.currentSession === key;
                return (
                  <button
                    key={key}
                    onClick={() => switchSession(key)}
                    data-testid={`button-session-${key}`}
                    className={`px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                      active
                        ? "bg-amber-500 text-black shadow-[0_0_15px_rgba(245,166,35,0.4)]"
                        : "text-white/50 hover:text-white/80 hover:bg-white/[0.05]"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {timerData.currentSession === "work" && (
              <TaskDurationPresets
                activeTag={activeTaskTag}
                onSelectTag={handleSelectTag}
                workDurationMinutes={Math.floor(config.workDuration / 60)}
                onSelectDuration={handleSelectWorkDuration}
                isTimerRunning={timerData.state === "running"}
              />
            )}
          </div>

          {/* LARGE AMBER TIMER DISPLAY */}
          <div className="relative my-1">
            <Timer 
              timeRemaining={timerData.timeRemaining} 
              totalTime={timerData.totalTime} 
              currentSession={timerData.currentSession} 
              state={timerData.state}
              taskTag={activeTaskTag}
              sessionsCompleted={timerData.sessionsCompleted}
              sessionsUntilLongBreak={config.sessionsUntilLongBreak}
            />
          </div>

          {/* PILL CONTROL BUTTONS */}
          <ControlButtons 
            state={timerData.state} 
            onStart={handleStart} 
            onPause={handlePause} 
            onStop={handleStop} 
            onReset={handleReset}
            onSkip={() => skipToNext(timerDataRef.current, config, false)}
            onSettings={() => setShowSettings(true)}
          />
        </section>

        {/* BOTTOM DASHBOARD STAT CARDS GRID (SMOOTH FADE OUT WHEN RUNNING) */}
        <section className={`w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 transition-all duration-700 ease-in-out ${
          timerData.state === "running"
            ? "opacity-0 translate-y-8 max-h-0 pointer-events-none overflow-hidden pt-0 pb-0"
            : "opacity-100 translate-y-0 max-h-96 pt-1 pb-2"
        }`}>
          <StreakCounter 
            currentStreak={streak.current} 
            longestStreak={streak.best} 
            todaySessions={todayStats.sessions}
            dailyGoal={8}
          />
          <SessionStats 
            sessionsCompleted={todayStats.sessions}
            currentCycle={(timerData.sessionsCompleted % config.sessionsUntilLongBreak) + 1}
            totalCycles={config.sessionsUntilLongBreak}
            timeSpentToday={todayStats.mins}
            weeklyMinutes={weeklyStats.mins}
            weeklyPomodoros={weeklyStats.pomodoros}
          />
          <DailyProgress 
            completed={todayStats.sessions} 
            goal={8} 
          />
        </section>
      </main>

      {/* BADGE UNLOCK POPUP */}
      {newBadge && (() => {
        const b = BADGE_MILESTONES.find(x => x.id === newBadge);
        if (!b) return null;
        return (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-badge-unlock pointer-events-none">
            <div className="px-6 py-3 rounded-full flex items-center gap-3 bg-[#0c0d14] border border-amber-500/50 shadow-[0_0_24px_rgba(245,166,35,0.4)] backdrop-blur-xl">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="font-semibold text-xs tracking-wider uppercase text-amber-400">{b.name} UNLOCKED</span>
            </div>
          </div>
        );
      })()}

      {/* DRAWERS & MODALS */}
      <Sheet open={showSidebar} onOpenChange={setShowSidebar}>
        <SheetContent side="right" className="w-full sm:w-[400px] flex flex-col overflow-hidden border-none p-0 bg-[#07070f]/95 backdrop-blur-2xl border-l border-[#1e1f2b] shadow-2xl">
          <SheetTitle className="sr-only">Progress — Streaks & Achievements</SheetTitle>
          <SheetDescription className="sr-only">View your focus streaks, achievement badges, and session history.</SheetDescription>
          <div className="px-6 pt-8 pb-5 flex-shrink-0 border-b border-[#1e1f2b]">
            <h2 className="text-sm font-semibold tracking-[0.3em] uppercase text-white/95" style={{ fontFamily: "'Rajdhani',sans-serif" }}>Progress</h2>
            <p className="text-xs tracking-[0.18em] uppercase mt-1 text-white/45" style={{ fontFamily: "'Rajdhani',sans-serif" }}>Streaks & Achievements</p>
            <div className="flex gap-1 mt-4 p-1 rounded-full bg-white/[0.05] border border-white/[0.09]">
              <SidebarTab active={sidebarTab === "progress"} onClick={() => setSidebarTab("progress")}>Progress</SidebarTab>
              <SidebarTab active={sidebarTab === "history"} onClick={() => setSidebarTab("history")}>History{hasHistory && <span className="ml-1 px-1.5 py-0.5 rounded-full text-[9px] bg-white/10 text-white/75">{history.filter((r: any) => r.type === "work").length}</span>}</SidebarTab>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-7 no-scrollbar">
            {sidebarTab === "progress" && (
              <>
                <div className="space-y-3">
                  <SLabel>All-Time Focus</SLabel>
                  <div className="text-center py-6 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                    <div className="text-4xl font-light font-mono text-white/95">
                      {displayTotalMins >= 60 ? `${Math.floor(displayTotalMins / 60)}h ${displayTotalMins % 60}m` : `${displayTotalMins} min`}
                    </div>
                    <div className="text-xs font-semibold tracking-[0.22em] uppercase mt-2 text-white/50" style={{ fontFamily: "'Rajdhani',sans-serif" }}>Total Focused</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <SLabel>Streak</SLabel>
                  <StreakCounter currentStreak={streak.current} longestStreak={streak.best} todaySessions={todayStats.sessions} dailyGoal={8} />
                </div>

                <div className="space-y-3">
                  <SLabel>Activity — Last 7 Weeks</SLabel>
                  <div className="rounded-2xl p-4 bg-white/[0.03] border border-white/[0.08]">
                    <WeeklyHeatmap history={history} />
                  </div>
                </div>

                <div className="space-y-3">
                  <SLabel>Achievement Badges</SLabel>
                  <p className="text-xs leading-relaxed text-white/45">Tap an unlocked badge to view and download it.</p>
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

      {showAnalytics && (
        <div className="fixed inset-0 z-50 bg-[#07090e] text-white flex flex-col overflow-y-auto animate-fade-in custom-scrollbar">
          {/* Top Bar for Full-Screen Analytics */}
          <div className="sticky top-0 z-30 bg-[#07090e]/90 backdrop-blur-xl border-b border-[#1e293b] px-6 md:px-12 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold tracking-wider uppercase text-emerald-400" style={{ fontFamily: "'Rajdhani',sans-serif" }}>Analytics & Reports</h2>
                <p className="text-xs text-white/40 font-sans">PRODUCTIVE+ Productivity Intelligence</p>
              </div>
            </div>

            <button
              onClick={() => setShowAnalytics(false)}
              className="w-10 h-10 rounded-full bg-white/[0.05] border border-white/10 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all active:scale-95 cursor-pointer"
              title="Close Analytics (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Full Screen Analytics Dashboard Content */}
          <div className="max-w-7xl mx-auto w-full p-6 md:p-10 flex-1">
            <Analytics />
          </div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={(e) => { if (e.target === e.currentTarget) setShowSettings(false); }}>
          <div className="animate-scale-in"><SettingsPanel config={config} onSave={handleSaveSettings} onClose={() => setShowSettings(false)} /></div>
        </div>
      )}

      {showProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={(e) => { if (e.target === e.currentTarget) setShowProfile(false); }}>
          <div className="animate-scale-in w-full max-w-sm flex items-center justify-center"><ProfilePanel onClose={() => setShowProfile(false)} /></div>
        </div>
      )}

      {sessionCompleted && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/85 backdrop-blur-md">
          <div className="animate-scale-in w-full max-w-sm p-8 rounded-3xl text-center space-y-6 bg-[#0c0d14] border border-amber-500/30 shadow-2xl">
            <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center bg-amber-500/10 border border-amber-500/30">
              <CheckCircle2 className="w-10 h-10 text-amber-500 animate-bounce" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white/95">
                {sessionCompleted.type === "work" ? "Focus Session Complete" : "Break Session Complete"}
              </h3>
              <p className="text-xs mt-2 font-semibold tracking-wider text-amber-400 uppercase">
                NEXT: {sessionCompleted.next === "work" ? "FOCUS SESSION" : sessionCompleted.next === "short-break" ? "SHORT BREAK" : "LONG BREAK"}
              </p>
            </div>
            <button onClick={closeCompletion} className="w-full py-3.5 rounded-2xl font-bold bg-amber-500 hover:bg-amber-400 text-black transition-all active:scale-95">
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

