import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Timer, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { loginMutation, registerMutation, user } = useAuth();
  const [, setLocation] = useLocation();

  if (user) {
    setLocation("/");
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    if (isLogin) {
      loginMutation.mutate({ email, password } as any);
    } else {
      registerMutation.mutate({ email, password } as any);
    }
  };

  const isPending = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#07070f] text-white overflow-hidden">
      {/* Left side - Decorative */}
      <div className="hidden md:flex flex-1 relative flex-col justify-between p-12 border-r border-white/10" style={{ background: "radial-gradient(ellipse at bottom right, rgba(140,175,255,0.08) 0%, transparent 60%)" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <Timer className="w-5 h-5 text-white/80" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-[0.3em] uppercase" style={{ fontFamily: "'Rajdhani',sans-serif", color: "rgba(255,255,255,0.92)" }}>Focus Timer</h1>
            <p className="text-xs tracking-[0.22em] uppercase mt-0.5" style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 400, color: "rgba(255,255,255,0.4)" }}>Pomodoro</p>
          </div>
        </div>

        <div className="max-w-md relative z-10">
          <h2 className="text-4xl leading-tight font-light tracking-wide mb-6" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
            Master your time.<br/>
            <span style={{ color: "rgba(140,175,255,0.9)" }}>Sync your progress.</span>
          </h2>
          <p className="text-white/40 leading-relaxed font-light text-sm" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
            Join PomoFocusTrack to automatically save your focus sessions, analyze your productivity trends over time, and earn achievements that sync across all your devices.
          </p>
        </div>

        <div className="text-xs text-white/30 tracking-widest uppercase font-semibold" style={{ fontFamily: "'Rajdhani',sans-serif" }}>
          © 2026 Focus Timer
        </div>

        {/* Abstract shapes */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-[120px]" style={{ background: "rgba(100,210,170,0.03)" }} />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px]" style={{ background: "rgba(140,175,255,0.05)" }} />
      </div>

      {/* Right side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at top right, rgba(255,255,255,0.02) 0%, transparent 40%)" }} />
        
        <div className="w-full max-w-sm space-y-8 relative z-10">
          <div className="text-center md:text-left space-y-2">
            <h3 className="text-2xl font-light" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
              {isLogin ? "Welcome back" : "Create an account"}
            </h3>
            <p className="text-white/40 text-sm">
              {isLogin ? "Enter your details to access your dashboard." : "Start tracking your focus journey today."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold tracking-widest uppercase text-white/50 mb-1.5 block" style={{ fontFamily: "'Rajdhani',sans-serif" }}>Email Address</label>
                <Input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. you@example.com"
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-white/20 h-12"
                />
              </div>
              <div>
                <label className="text-xs font-semibold tracking-widest uppercase text-white/50 mb-1.5 block" style={{ fontFamily: "'Rajdhani',sans-serif" }}>Password</label>
                <Input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-white/20 h-12"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full h-12 mt-6 rounded-lg flex items-center justify-center transition-all duration-200 hover:bg-white hover:text-black disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: "rgba(255,255,255,0.9)",
                color: "#000",
                fontFamily: "'Rajdhani',sans-serif",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase"
              }}
            >
              {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? "Sign In" : "Sign Up")}
            </button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-white/50 hover:text-white transition-colors"
              style={{ fontFamily: "'Space Grotesk',sans-serif" }}
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
