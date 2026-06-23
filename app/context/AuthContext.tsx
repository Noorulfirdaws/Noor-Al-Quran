"use client";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

// ─── Auth (real backend) ──────────────────────────────────────────────────────
// Talks to /api/auth/* which persist to Postgres with bcrypt + httpOnly JWT
// sessions. The session cookie is httpOnly (not readable here) — we learn who
// the user is by calling /api/auth/me.

export type Role = "user" | "admin";
export type Plan = "free" | "premium" | "family";

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: Role;
}

type Result = { ok: true } | { ok: false; error: string };

interface AuthCtx {
  user: AuthUser | null;
  plan: Plan;
  isAuthed: boolean;
  isAdmin: boolean;
  loading: boolean;
  signUp: (p: { name: string; email: string; password: string }) => Promise<Result>;
  login: (p: { email: string; password: string }) => Promise<Result>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx>({
  user: null,
  plan: "free",
  isAuthed: false,
  isAdmin: false,
  loading: true,
  signUp: async () => ({ ok: false, error: "not ready" }),
  login: async () => ({ ok: false, error: "not ready" }),
  logout: async () => {},
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [plan, setPlan] = useState<Plan>("free");
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await res.json();
      setUser(data.user ?? null);
      setPlan((data.plan as Plan) ?? "free");
    } catch {
      setUser(null);
      setPlan("free");
    } finally {
      setLoading(false);
      // Let PremiumContext re-read the plan from here.
      if (typeof window !== "undefined") window.dispatchEvent(new Event("noor-premium-changed"));
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const signUp = useCallback<AuthCtx["signUp"]>(async (p) => {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(p),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, error: data.error || "Could not create your account." };
      setUser(data.user); setPlan((data.plan as Plan) ?? "free");
      window.dispatchEvent(new Event("noor-premium-changed"));
      return { ok: true };
    } catch {
      return { ok: false, error: "Network error. Please try again." };
    }
  }, []);

  const login = useCallback<AuthCtx["login"]>(async (p) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(p),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, error: data.error || "Could not log in." };
      setUser(data.user); setPlan((data.plan as Plan) ?? "free");
      window.dispatchEvent(new Event("noor-premium-changed"));
      return { ok: true };
    } catch {
      return { ok: false, error: "Network error. Please try again." };
    }
  }, []);

  const logout = useCallback(async () => {
    try { await fetch("/api/auth/logout", { method: "POST" }); } catch { /* ignore */ }
    setUser(null); setPlan("free");
    window.dispatchEvent(new Event("noor-premium-changed"));
  }, []);

  return (
    <AuthContext.Provider value={{
      user, plan, isAuthed: !!user, isAdmin: user?.role === "admin",
      loading, signUp, login, logout, refresh,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
