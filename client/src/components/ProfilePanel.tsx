import { useAuth } from "@/hooks/use-auth";
import { LogOut, User as UserIcon, Mail } from "lucide-react";
import { useSessions } from "@/hooks/use-sessions";

interface ProfilePanelProps {
  onClose: () => void;
}

export default function ProfilePanel({ onClose }: ProfilePanelProps) {
  const { user, logoutMutation } = useAuth();
  const { sessions } = useSessions();

  const totalSessions = sessions ? sessions.length : 0;
  const workSessions = sessions ? sessions.filter((r: any) => r.type === "work").length : 0;
  const totalMins = sessions ? sessions.filter((r: any) => r.type === "work").reduce((acc: number, r: any) => acc + Math.floor(r.duration / 60), 0) : 0;

  return (
    <div className="w-full max-w-sm rounded-3xl overflow-hidden p-6 relative border border-white/10" style={{ background: "rgba(10,10,20,0.95)", boxShadow: "0 24px 64px rgba(0,0,0,0.8)" }}>
      {/* Decorative gradient */}
      <div className="absolute top-0 left-0 right-0 h-32 opacity-20 pointer-events-none" style={{ background: "linear-gradient(to bottom, rgba(140,175,255,0.5) 0%, transparent 100%)" }} />

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 relative" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)" }}>
          <UserIcon className="w-8 h-8 text-white/80" />
          <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#64d2aa] border-2 border-[#0a0a14]" />
        </div>

        {/* Info */}
        <h2 className="text-xl font-medium tracking-wide mb-1" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
          {user?.email?.split('@')[0] || "User"}
        </h2>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full mb-8" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <Mail className="w-3 h-3 text-white/50" />
          <span className="text-xs text-white/60 tracking-wider" style={{ fontFamily: "'Rajdhani',sans-serif" }}>{user?.email}</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 w-full mb-8">
          <div className="p-4 rounded-2xl flex flex-col items-center justify-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="text-2xl font-light text-white mb-1" style={{ fontFamily: "'JetBrains Mono',monospace" }}>{workSessions}</div>
            <div className="text-[10px] font-semibold tracking-widest uppercase text-white/40" style={{ fontFamily: "'Rajdhani',sans-serif" }}>Focus Sessions</div>
          </div>
          <div className="p-4 rounded-2xl flex flex-col items-center justify-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="text-2xl font-light text-white mb-1" style={{ fontFamily: "'JetBrains Mono',monospace" }}>{totalMins >= 60 ? `${Math.floor(totalMins / 60)}h` : `${totalMins}m`}</div>
            <div className="text-[10px] font-semibold tracking-widest uppercase text-white/40" style={{ fontFamily: "'Rajdhani',sans-serif" }}>Total Time</div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={() => logoutMutation.mutate()}
          className="w-full h-12 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 hover:bg-white/10"
          style={{
            border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.7)",
            fontFamily: "'Rajdhani',sans-serif",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase"
          }}
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  );
}
