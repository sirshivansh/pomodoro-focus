import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import Home from "@/pages/Home";
import AuthPage from "@/pages/AuthPage";
import MiniTimer from "@/pages/MiniTimer";
import NotFound from "@/pages/not-found";
import { Loader2 } from "lucide-react";

function LoadingSkeleton() {
  return (
    <div className="min-h-screen flex flex-col bg-[#07070f] overflow-hidden">
      {/* Premium Loader Overlay */}
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center pointer-events-none">
        <div className="relative">
          {/* Inner glowing orb */}
          <div className="w-16 h-16 rounded-full bg-white/10 blur-xl animate-pulse" />
          {/* Spinning ring */}
          <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-t-white/40 border-r-white/10 border-b-white/5 border-l-white/20 animate-spin" />
        </div>
        <p className="mt-8 text-[10px] tracking-[0.5em] font-bold text-white/40 uppercase animate-pulse" style={{ fontFamily: "'Rajdhani',sans-serif" }}>
          Initializing Systems
        </p>
      </div>

      <div className="flex-1 flex flex-col opacity-20 animate-pulse">
        {/* Header Skeleton */}
        <div className="h-14 border-b border-white/10 flex items-center justify-between px-6">
          <div className="space-y-1">
            <div className="w-24 h-3 bg-white/10 rounded-full" />
            <div className="w-16 h-2 bg-white/5 rounded-full" />
          </div>
          <div className="flex gap-2">
            <div className="w-9 h-9 rounded-full bg-white/10" />
            <div className="w-9 h-9 rounded-full bg-white/10" />
          </div>
        </div>

        {/* Main Content Skeleton */}
        <main className="flex-1 flex flex-col items-center justify-between py-12 px-6 max-w-5xl mx-auto w-full">
          {/* Tabs */}
          <div className="w-64 h-10 bg-white/10 rounded-full" />

          {/* Timer Circle */}
          <div className="relative flex items-center justify-center">
            <div className="w-[240px] h-[240px] rounded-full border-2 border-white/5 flex items-center justify-center">
              <div className="w-[180px] h-[180px] rounded-full bg-white/5" />
            </div>
          </div>

          {/* Quote */}
          <div className="w-full max-w-md space-y-3">
            <div className="w-3/4 h-2 bg-white/10 rounded-full mx-auto" />
            <div className="w-1/2 h-2 bg-white/5 rounded-full mx-auto" />
          </div>

          {/* Buttons */}
          <div className="flex gap-5">
            <div className="w-12 h-12 rounded-full bg-white/5" />
            <div className="w-16 h-16 rounded-full bg-white/20" />
            <div className="w-12 h-12 rounded-full bg-white/5" />
          </div>

          {/* Stats */}
          <div className="w-full max-w-3xl grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-white/5 rounded-2xl border border-white/5" />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

function ProtectedRoute({ component: Component }: { component: any }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!user) {
    return <AuthPage />;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <ProtectedRoute component={Home} />} />
      <Route path="/mini" component={MiniTimer} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
