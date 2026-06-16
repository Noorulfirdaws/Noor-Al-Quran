"use client";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

// ─── Browser-based auth (demo) ────────────────────────────────────────────────
// This is a client-side account system backed by localStorage — it lets users
// sign up and enter the web app directly (no app download). It is NOT real
// security; a production build would back this with a server + database.

export type Role = "user" | "admin";

export interface AuthUser {
  name: string;
  email: string;
  role: Role;
  createdAt: number;
}

interface StoredAccount {
  name: string;
  email: string;
  role: Role;
  pass: string; // obfuscated (demo only — not secure)
}

interface AuthCtx {
  user: AuthUser | null;
  isAuthed: boolean;
  isAdmin: boolean;
  signUp: (p: { name: string; email: string; password: string; role: Role }) =>
    { ok: true } | { ok: false; error: string };
  login: (p: { email: string; password: string }) =>
    { ok: true } | { ok: false; error: string };
  logout: () => void;
}

const USER_KEY = "noor_auth_user";
const ACCOUNTS_KEY = "noor_auth_accounts";
const PREMIUM_KEY = "noor_admin_premium"; // shared with PremiumContext

const obfuscate = (s: string) => (typeof window !== "undefined" ? btoa(unescape(encodeURIComponent(s))) : s);

const AuthContext = createContext<AuthCtx>({
  user: null,
  isAuthed: false,
  isAdmin: false,
  signUp: () => ({ ok: false, error: "not ready" }),
  login: () => ({ ok: false, error: "not ready" }),
  logout: () => {},
});

function readAccounts(): Record<string, StoredAccount> {
  try { return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "{}"); }
  catch { return {}; }
}
function writeAccounts(a: Record<string, StoredAccount>) {
  try { localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(a)); } catch { /* ignore */ }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  // Restore session — and re-assert the admin premium flag, then tell
  // PremiumContext to re-check (it may have mounted before this ran).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      if (raw) {
        const u = JSON.parse(raw) as AuthUser;
        setUser(u);
        if (u?.role === "admin") localStorage.setItem(PREMIUM_KEY, "1");
        window.dispatchEvent(new Event("noor-premium-changed"));
      }
    } catch { /* ignore */ }
  }, []);

  const persist = useCallback((u: AuthUser | null) => {
    setUser(u);
    try {
      if (u) {
        localStorage.setItem(USER_KEY, JSON.stringify(u));
        // Super Admins unlock all premium features (read by PremiumContext).
        if (u.role === "admin") localStorage.setItem(PREMIUM_KEY, "1");
      } else {
        localStorage.removeItem(USER_KEY);
      }
      // Notify PremiumContext to re-evaluate immediately (no reload needed).
      window.dispatchEvent(new Event("noor-premium-changed"));
    } catch { /* ignore */ }
  }, []);

  const signUp: AuthCtx["signUp"] = useCallback((p) => {
    const email = p.email.trim().toLowerCase();
    if (!p.name.trim()) return { ok: false, error: "Please enter your name." };
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, error: "Please enter a valid email." };
    if (p.password.length < 6) return { ok: false, error: "Password must be at least 6 characters." };

    const accounts = readAccounts();
    if (accounts[email]) return { ok: false, error: "An account with this email already exists. Try logging in." };

    accounts[email] = { name: p.name.trim(), email, role: p.role, pass: obfuscate(p.password) };
    writeAccounts(accounts);
    persist({ name: p.name.trim(), email, role: p.role, createdAt: Date.now() });
    return { ok: true };
  }, [persist]);

  const login: AuthCtx["login"] = useCallback((p) => {
    const email = p.email.trim().toLowerCase();
    const accounts = readAccounts();
    const acc = accounts[email];
    if (!acc) return { ok: false, error: "No account found for this email. Please sign up." };
    if (acc.pass !== obfuscate(p.password)) return { ok: false, error: "Incorrect password." };
    persist({ name: acc.name, email: acc.email, role: acc.role, createdAt: Date.now() });
    return { ok: true };
  }, [persist]);

  const logout = useCallback(() => {
    persist(null);
    try { localStorage.removeItem(PREMIUM_KEY); } catch { /* ignore */ }
  }, [persist]);

  return (
    <AuthContext.Provider value={{ user, isAuthed: !!user, isAdmin: user?.role === "admin", signUp, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
