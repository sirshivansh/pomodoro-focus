import { createContext, useContext, ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { User, InsertUser } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: ReturnType<typeof useLoginMutation>;
  logoutMutation: ReturnType<typeof useLogoutMutation>;
  registerMutation: ReturnType<typeof useRegisterMutation>;
  forgotPasswordMutation: ReturnType<typeof useForgotPasswordMutation>;
  resetPasswordMutation: ReturnType<typeof useResetPasswordMutation>;
};

const AuthContext = createContext<AuthContextType | null>(null);

async function fetchUser() {
  const res = await fetch("/api/user", {
    credentials: "include"
  });
  if (res.ok) {
    return res.json();
  }

  if (res.status === 401) {
    // Attempt auto-login if saved credentials exist in localStorage
    try {
      const saved = localStorage.getItem("ft_saved_credentials");
      if (saved) {
        const credentials = JSON.parse(saved);
        if (credentials.email && credentials.password) {
          const loginRes = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
            credentials: "include",
          });
          if (loginRes.ok) {
            return loginRes.json();
          }
        }
      }
    } catch (_) {}
    return null;
  }

  throw new Error("Failed to fetch user");
}

function useLoginMutation() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (credentials: InsertUser) => {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
        credentials: "include",
      });
      if (!res.ok) {
        let msg = "Invalid email or password";
        try {
          const error = await res.json();
          msg = error.message || msg;
        } catch {
          const text = await res.text();
          if (text && text.length < 100) msg = text;
        }
        throw new Error(msg);
      }
      const data = await res.json();
      try {
        localStorage.setItem("ft_saved_credentials", JSON.stringify({ email: credentials.email, password: credentials.password }));
      } catch (_) {}
      return data;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({ title: "Welcome back!", description: "Successfully logged in." });
    },
    onError: (error: Error) => {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    },
  });
}

function useRegisterMutation() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (credentials: InsertUser) => {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
        credentials: "include",
      });
      if (!res.ok) {
        let msg = "Registration failed";
        try {
          const error = await res.json();
          msg = error.message || msg;
        } catch {
          const text = await res.text();
          if (text && text.length < 100) msg = text;
        }
        throw new Error(msg);
      }
      const data = await res.json();
      try {
        localStorage.setItem("ft_saved_credentials", JSON.stringify({ email: credentials.email, password: credentials.password }));
      } catch (_) {}
      return data;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({ title: "Account created!", description: "Welcome to PomoFocusTrack." });
    },
    onError: (error: Error) => {
      toast({ title: "Registration failed", description: error.message, variant: "destructive" });
    },
  });
}

function useLogoutMutation() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async () => {
      try {
        localStorage.removeItem("ft_saved_credentials");
      } catch (_) {}
      const res = await fetch("/api/logout", { 
        method: "POST",
        credentials: "include"
      });
      if (!res.ok) throw new Error("Logout failed");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      queryClient.clear();
      toast({ title: "Logged out", description: "You have been logged out successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Logout failed", description: error.message, variant: "destructive" });
    },
  });
}

function useForgotPasswordMutation() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to process request");
      }
      return data;
    },
    onSuccess: (data) => {
      toast({ title: "Check your inbox", description: data.message || "If an account exists, a reset code has been sent." });
    },
    onError: (error: Error) => {
      toast({ title: "Request failed", description: error.message, variant: "destructive" });
    },
  });
}

function useResetPasswordMutation() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ token, newPassword }: { token: string; newPassword: string }) => {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to reset password");
      }
      return data;
    },
    onSuccess: (data) => {
      toast({ title: "Password Reset Complete!", description: data.message });
    },
    onError: (error: Error) => {
      toast({ title: "Reset failed", description: error.message, variant: "destructive" });
    },
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, error, isLoading } = useQuery<User | null>({
    queryKey: ["/api/user"],
    queryFn: fetchUser,
    retry: false,
  });

  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const logoutMutation = useLogoutMutation();
  const forgotPasswordMutation = useForgotPasswordMutation();
  const resetPasswordMutation = useResetPasswordMutation();

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error: error as Error | null,
        loginMutation,
        logoutMutation,
        registerMutation,
        forgotPasswordMutation,
        resetPasswordMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
