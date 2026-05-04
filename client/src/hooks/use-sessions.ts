import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { InsertPomodoroSession } from "@shared/schema";

export function useSessions() {
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["/api/sessions"],
    queryFn: async () => {
      const res = await fetch("/api/sessions", {
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to fetch sessions");
      return res.json();
    },
    staleTime: 0,
  });

  const createSession = useMutation({
    mutationFn: async (session: InsertPomodoroSession) => {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(session),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to save session");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
    },
  });

  const clearSessions = useMutation({
    mutationFn: async () => {
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
  
  return { sessions, isLoading, createSession, clearSessions };
}
