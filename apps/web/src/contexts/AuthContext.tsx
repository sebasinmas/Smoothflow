import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { SessionUser } from "@smoothflow/shared";
import { api } from "@/lib/api";

interface AuthContextValue {
  user: SessionUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<SessionUser>;
  patientLogin: (email: string, password: string) => Promise<SessionUser>;
  registerPatient: (data: {
    email: string;
    password: string;
    givenName: string;
    familyName: string;
    phone?: string;
    identifier?: string;
  }) => Promise<SessionUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  purgeSensitiveData: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { user: me } = await api.get<{ user: SessionUser }>("/auth/me");
      setUser(me);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const purgeSensitiveData = useCallback(() => {
    setUser(null);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user: loggedIn } = await api.post<{ user: SessionUser }>("/auth/login", {
      email,
      password,
    });
    setUser(loggedIn);
    return loggedIn;
  }, []);

  const patientLogin = useCallback(async (email: string, password: string) => {
    const { user: loggedIn } = await api.post<{ user: SessionUser }>("/auth/patient/login", {
      email,
      password,
    });
    setUser(loggedIn);
    return loggedIn;
  }, []);

  const registerPatient = useCallback(
    async (data: {
      email: string;
      password: string;
      givenName: string;
      familyName: string;
      phone?: string;
      identifier?: string;
    }) => {
      const { user: registered } = await api.post<{ user: SessionUser }>(
        "/auth/patient/register",
        data,
      );
      setUser(registered);
      return registered;
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      purgeSensitiveData();
    }
  }, [purgeSensitiveData]);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      patientLogin,
      registerPatient,
      logout,
      refresh,
      purgeSensitiveData,
    }),
    [user, loading, login, patientLogin, registerPatient, logout, refresh, purgeSensitiveData],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = use(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
