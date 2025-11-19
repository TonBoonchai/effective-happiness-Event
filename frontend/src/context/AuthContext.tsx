"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { api } from "../lib/api";

type User = {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "member";
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    name: string;
    email: string;
    tel: string;
    role: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load token from storage
  useEffect(() => {
    const t =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (t) {
      setToken(t);
      // Set auth header for middleware
      if (typeof window !== "undefined") {
        document.cookie = `token=${t}; path=/`;
      }
    }
  }, []);

  // Fetch user if token present
  useEffect(() => {
    async function fetchMe() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const me = await api<{ success: boolean; data: User }>("/auth/me");
        setUser(me.data);
      } catch (e) {
        console.warn("Failed to fetch /auth/me", e);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    fetchMe();
  }, [token]);

  async function login(email: string, password: string) {
    const res = await api<{
      success: boolean;
      token: string;
      name: string;
      email: string;
      _id: string;
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem("token", res.token);
    document.cookie = `token=${res.token}; path=/`;
    setToken(res.token);
    await new Promise((r) => setTimeout(r, 0)); // next tick triggers me fetch
  }

  async function register(payload: {
    name: string;
    email: string;
    tel: string;
    role: string;
    password: string;
  }) {
    const res = await api<{
      success: boolean;
      token: string;
      name: string;
      email: string;
      _id: string;
    }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    localStorage.setItem("token", res.token);
    document.cookie = `token=${res.token}; path=/`;
    setToken(res.token);
  }

  function logout() {
    localStorage.removeItem("token");
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
