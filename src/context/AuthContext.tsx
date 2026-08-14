import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export interface AuthUser {
  id: string;
  userId: string;
  displayName: string;
  createdAt: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  clearError: () => void;
  signup: (input: {
    userId: string;
    password: string;
    displayName?: string;
  }) => Promise<AuthUser>;
  signin: (input: { userId: string; password: string }) => Promise<AuthUser>;
  signout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AUTH_TOKEN_KEY = 'voice_mom_auth_token_v1';
const AUTH_USER_KEY = 'voice_mom_auth_user_v1';

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredToken() {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.userId && parsed?.id) return parsed as AuthUser;
  } catch {
    /* ignore */
  }
  return null;
}

function persistSession(token: string | null, user: AuthUser | null) {
  try {
    if (token && user) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      // Keep command-session / Instant Save user id aligned when present
      localStorage.setItem('voice_mom_command_session_user_id', user.id);
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
    }
  } catch {
    /* ignore quota */
  }
}

async function authFetch(path: string, init: RequestInit = {}, token?: string | null) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(path, { ...init, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());
  const [token, setToken] = useState<string | null>(() => readStoredToken());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const existing = readStoredToken();
    if (!existing) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }
    try {
      const data = await authFetch('/api/v1/auth/me', { method: 'GET' }, existing);
      setToken(existing);
      setUser(data.user);
      persistSession(existing, data.user);
    } catch {
      setUser(null);
      setToken(null);
      persistSession(null, null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const signup = useCallback(
    async (input: { userId: string; password: string; displayName?: string }) => {
      setError(null);
      const data = await authFetch('/api/v1/auth/signup', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      setToken(data.token);
      setUser(data.user);
      persistSession(data.token, data.user);
      return data.user as AuthUser;
    },
    [],
  );

  const signin = useCallback(async (input: { userId: string; password: string }) => {
    setError(null);
    const data = await authFetch('/api/v1/auth/signin', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    setToken(data.token);
    setUser(data.user);
    persistSession(data.token, data.user);
    return data.user as AuthUser;
  }, []);

  const signout = useCallback(async () => {
    setError(null);
    try {
      await authFetch('/api/v1/auth/signout', { method: 'POST' }, token);
    } catch {
      /* still clear local session */
    }
    setUser(null);
    setToken(null);
    persistSession(null, null);
  }, [token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(user && token),
      error,
      clearError: () => setError(null),
      signup: async (input) => {
        try {
          return await signup(input);
        } catch (e: any) {
          setError(e.message || 'Signup failed');
          throw e;
        }
      },
      signin: async (input) => {
        try {
          return await signin(input);
        } catch (e: any) {
          setError(e.message || 'Sign in failed');
          throw e;
        }
      },
      signout,
      refresh,
    }),
    [user, token, isLoading, error, signup, signin, signout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
