import { useEffect, useState, useRef } from "react";
import Timer from "@/components/Timer";
import { TimerData, SessionType } from "@shared/schema";
import { Play, Pause, RotateCcw } from "lucide-react";

export default function MiniTimer() {
  const [timerData, setTimerData] = useState<TimerData>({
    timeRemaining: 1500,
    totalTime: 1500,
    currentSession: "work",
    sessionsCompleted: 0,
    state: "idle",
  });
  const [audioEnabled, setAudioEnabled] = useState(false);
  const channelRef = useRef<BroadcastChannel | null>(null);

  // Shared Audio Context for robustness
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

  function announce(text: string) {
    if (!audioEnabled) return;
    try {
      const msg = new SpeechSynthesisUtterance(text);
      msg.rate = 0.95;
      msg.pitch = 1.0;
      msg.volume = 0.8;
      window.speechSynthesis.speak(msg);
    } catch (_) {}
  }

  function playClockSound(type: "start" | "tick") {
    if (!audioEnabled) return;
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
      }
    } catch (_) {}
  }

  useEffect(() => {
    const channel = new BroadcastChannel("pomodoro_sync");
    channelRef.current = channel;
    
    channel.postMessage({ type: "REQUEST_STATE" });

    channel.onmessage = (event) => {
      if (event.data.type === "TICK" || event.data.type === "STATE_UPDATE") {
        const newData = event.data.payload;
        const skipAudio = event.data.payload?.skipAudio;
        
        setTimerData(prev => {
          // Trigger sounds if state changed to running and not explicitly skipped
          if (prev.state !== "running" && newData.state === "running" && !skipAudio) {
            playClockSound("start");
            announce(newData.currentSession === "work" ? "Focus session started" : "Break time started");
          }
          return newData;
        });
      }
    };

    document.documentElement.classList.add("dark");
    document.body.style.background = "#05050a";
    document.body.style.overflow = "hidden";
    document.body.style.margin = "0";

    return () => {
      channel.close();
    };
  }, [audioEnabled]);

  const sendCommand = (type: string) => {
    channelRef.current?.postMessage({ type: "COMMAND", action: type });
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center relative select-none group" onClick={() => { if (!audioEnabled) { setAudioEnabled(true); getAudioCtx(); } }}>
      {!audioEnabled && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm cursor-pointer">
          <div className="px-4 py-2 rounded-full border border-white/20 bg-white/5 text-[10px] tracking-[0.2em] font-bold text-white/80 uppercase animate-pulse">
            Click to Enable Audio
          </div>
        </div>
      )}

      <div className="relative transition-transform duration-500 group-hover:scale-95">
        <Timer 
          timeRemaining={timerData.timeRemaining} 
          totalTime={timerData.totalTime} 
          currentSession={timerData.currentSession} 
          state={timerData.state} 
          className="scale-[1.1]"
        />
        
        {/* Quick Controls overlay on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex gap-4 p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
            {timerData.state === "running" ? (
              <button onClick={() => sendCommand("PAUSE")} className="text-white hover:text-white/80"><Pause size={20} /></button>
            ) : (
              <button onClick={() => sendCommand("START")} className="text-white hover:text-white/80"><Play size={20} /></button>
            )}
            <button onClick={() => sendCommand("RESET")} className="text-white hover:text-white/80"><RotateCcw size={20} /></button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 text-center w-full">
        <p className="text-[9px] tracking-[0.5em] font-bold text-white/30 uppercase" style={{ fontFamily: "'Rajdhani',sans-serif" }}>
          {timerData.currentSession === "work" ? "FOCUS" : timerData.currentSession === "short-break" ? "SHORT BREAK" : "LONG BREAK"}
        </p>
        {timerData.state === "paused" && (
          <p className="text-[8px] tracking-[0.2em] font-medium text-white/20 uppercase mt-1">Paused</p>
        )}
      </div>
    </div>
  );
}
