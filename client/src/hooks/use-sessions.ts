import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { InsertPomodoroSession } from "@shared/schema";

export function useSessions() {
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["/api/sessions"],
    queryFn: async () => {
      let serverSessions: any[] = [];
      try {
        const res = await fetch("/api/sessions", { credentials: "include" });
        if (res.ok) {
          serverSessions = await res.json();
        }
      } catch (_) {}

      // Retrieve local fallback cache
      let localSessions: any[] = [];
      try {
        const cached = localStorage.getItem("ft_local_sessions_cache");
        if (cached) localSessions = JSON.parse(cached);
      } catch (_) {}

      // Merge server & local session records by ID
      const map = new Map<string, any>();
      [...localSessions, ...serverSessions].forEach((s) => {
        if (s && s.id) map.set(s.id, s);
      });

      const merged = Array.from(map.values()).sort(
        (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );

      // Keep local cache synced
      try {
        localStorage.setItem("ft_local_sessions_cache", JSON.stringify(merged));
      } catch (_) {}

      return merged;
    },
    staleTime: 0,
  });

  const createSession = useMutation({
    mutationFn: async (session: InsertPomodoroSession) => {
      let created: any = null;
      try {
        const res = await fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(session),
          credentials: "include",
        });
        if (res.ok) created = await res.json();
      } catch (_) {}

      if (!created) {
        created = {
          id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          type: session.type,
          taskTag: (session as any).taskTag || null,
          duration: session.duration,
          completed: session.completed ?? false,
          startTime: session.startTime,
          endTime: (session as any).endTime || null,
        };
      }

      // Save immediately to local backup cache
      try {
        const cached = localStorage.getItem("ft_local_sessions_cache");
        const list = cached ? JSON.parse(cached) : [];
        list.unshift(created);
        localStorage.setItem("ft_local_sessions_cache", JSON.stringify(list));
      } catch (_) {}

      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
    },
  });

  const updateSession = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      let updated: any = null;
      try {
        const res = await fetch(`/api/sessions/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
          credentials: "include",
        });
        if (res.ok) updated = await res.json();
      } catch (_) {}

      // Update local backup cache
      try {
        const cached = localStorage.getItem("ft_local_sessions_cache");
        if (cached) {
          const list = JSON.parse(cached);
          const idx = list.findIndex((item: any) => item.id === id);
          if (idx !== -1) {
            list[idx] = { ...list[idx], ...updates };
            if (updated) list[idx] = updated;
            localStorage.setItem("ft_local_sessions_cache", JSON.stringify(list));
          }
        }
      } catch (_) {}

      return updated || { id, ...updates };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
    },
  });

  const clearSessions = useMutation({
    mutationFn: async () => {
      try {
        localStorage.removeItem("ft_local_sessions_cache");
      } catch (_) {}
      const res = await fetch("/api/sessions", {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to clear sessions");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
    },
  });
  
  return { sessions, isLoading, createSession, updateSession, clearSessions };
}
